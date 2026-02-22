# domain/services/mapping_service.py - VERSÃO REFATORADA

from sqlalchemy.orm import Session
from domain.repositories.mapping_repository import MappingRepository
from interfaces.schemas.mapping_schema import MappingCreate, MappingUpdate
from application.migration_helpers import MigrationHelpers
from application.migration_sql_builder import MigrationSQLBuilder
from application.migration_sql_file_builder import MigrationSQLFileBuilder
from domain.repositories.table_config_repository import TableConfigRepository
from application.migration_context import MigrationContext
from application.natural_key_resolver import NaturalKeyResolver
from application.use_cases.transformation_processor import TransformationProcessor
from application.validation.validation_orchestrator import ValidationOrchestrator
from application.helpers.column_config_extractor import ColumnConfigExtractor
from typing import Dict, List, Any, Optional
from collections import defaultdict, deque
from domain.enum.error_strategy import ErrorStrategy
from domain.repositories.setting_repository import SettingRepository
from application.id_generator import IdGenerator  # ✨ NOVO
from domain.enum.id_generation_strategy import IdGenerationStrategy

class MappingService:
    """
    Serviço de migração de dados - VERSÃO REFATORADA
    
    Responsabilidades:
    - Orquestrar o fluxo de migração
    - Coordenar validações
    - Gerar SQL
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.repo = MappingRepository(db)
        self.table_config = TableConfigRepository(db)
        self.transformation_processor = TransformationProcessor(db)
        self.setting_repo = SettingRepository(db)
        self.column_config_extractor = ColumnConfigExtractor(db)
        
        # Contexto será criado a cada migração
        self.context = None
        self.validation_orchestrator = None

        # Gerador de ids
        self.id_generator = IdGenerator()
    
    # ============================================================
    # CRUD BÁSICO
    # ============================================================
    
    def create_mapping(self, request: MappingCreate):
        return self.repo.create(request)
    
    def list_mapping(self, migration_project_id: int):
        return self.repo.list(migration_project_id)
    
    def delete_mapping(self, mapping_id: int) -> bool:
        return self.repo.delete(mapping_id)
    
    def show_mapping(self, mapping_id: int):
        return self.repo.get_by_id(mapping_id)
    
    def update_mapping(self, mapping_id: int, data: MappingUpdate):
        return self.repo.update(mapping_id, data)
    
    # ============================================================
    # FLUXO PRINCIPAL DE MIGRAÇÃO
    # ============================================================
    
    def get_by_migration_project(
        self, 
        migration_project_id: int,
        allow_duplicates: bool = False,
        duplicate_strategy: str = 'first'
    ):
        """
        Executa migração completa para um projeto
        
        FLUXO:
        1. Preparação (contexto, settings, dados)
        2. Transformações
        3. Validações (FK + Tipos)
        4. Registro de PKs
        5. Resolução de FKs
        6. Geração de SQL
        """
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 1: PREPARAÇÃO
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n" + "="*60)
        print("🚀 INICIANDO MIGRAÇÃO")
        print("="*60)
        
        # Carrega configurações
        error_strategy = self._load_error_strategy()
        
        # Cria contexto
        self.context = MigrationContext(
            allow_duplicates=allow_duplicates,
            duplicate_strategy=duplicate_strategy
        )
        
        # Cria orquestrador de validação
        self.validation_orchestrator = ValidationOrchestrator(self.context)
        
        # Carrega dados
        migration_project = self.repo.get_by_migration_project_id(migration_project_id)
        raw_mappings = migration_project.mappings
        
        # Pipeline de dados
        migration_helpers = MigrationHelpers()
        normalized = migration_helpers.normalize_mappings(raw_mappings)
        migration_plan = migration_helpers.build_migration_plan(normalized)
        mapped_rows_by_table = migration_helpers.load_csv_data(migration_plan)
        
        print(f"\n📊 Projeto: {migration_project.name}")
        print(f"📋 Estratégia de erro: {error_strategy.value}")
        print(f"📁 Tabelas carregadas: {len(mapped_rows_by_table)}")
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 2: TRANSFORMAÇÕES
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self._apply_transformations(mapped_rows_by_table, raw_mappings)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 3: GERAÇÃO DE IDs
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self._apply_id_generation(mapped_rows_by_table, raw_mappings)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 4: EXTRAÇÃO DE CONFIGURAÇÕES
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        fk_mappings = self._extract_fk_mappings(raw_mappings)
        dependency_order = self._get_dependency_order(mapped_rows_by_table, fk_mappings)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 5: VALIDAÇÕES (FK + TIPOS)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        validation_result, filtered_rows = self._validate_and_filter(
            mapped_rows_by_table=mapped_rows_by_table,
            dependency_order=dependency_order,
            fk_mappings=fk_mappings,
            raw_mappings=raw_mappings,
            error_strategy=error_strategy
        )
        
        # Se abort_on_first e tem erros, para aqui
        if error_strategy == ErrorStrategy.ABORT_ON_FIRST and validation_result.has_errors:
            return self._build_error_response(
                status="aborted",
                migration_project_id=migration_project_id,
                error_strategy=error_strategy,
                validation_result=validation_result
            )

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 6: REGISTRO DE PKs
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        try:
            self._register_primary_keys(filtered_rows, raw_mappings)
        except ValueError as e:
            return self._build_error_response(
                status="error",
                migration_project_id=migration_project_id,
                error_strategy=error_strategy,
                validation_result=validation_result,
                message=str(e)
            )

        # Verifica duplicatas
        if self.context.has_duplicates():
            self.context.print_duplicate_report()

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 7: RESOLUÇÃO DE FKs
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        self._resolve_foreign_keys(filtered_rows, fk_mappings, raw_mappings)
        self._resolve_fks_with_id_mapping(filtered_rows, fk_mappings)

        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 8: GERAÇÃO DE SQL
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        sql_file = self._generate_sql(
            filtered_rows=filtered_rows,
            migration_project=migration_project,
            error_strategy=error_strategy
        )
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 9: RESULTADO FINAL
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        return self._build_success_response(
            migration_project_id=migration_project_id,
            error_strategy=error_strategy,
            validation_result=validation_result,
            sql_file=sql_file
        )
    
    # ============================================================
    # VALIDAÇÃO (REFATORADO - USA ORCHESTRATOR)
    # ============================================================
    
    def _validate_and_filter(
        self,
        mapped_rows_by_table: Dict[str, List[Dict]],
        dependency_order: List[int],
        fk_mappings: Dict[int, List[Dict]],
        raw_mappings,
        error_strategy: ErrorStrategy
    ) -> tuple:
        """
        Valida dados usando ValidationOrchestrator
        
        Returns:
            (ValidationResult, filtered_rows)
        """
        from application.validation.validation_result import ValidationResult
        
        print("\n🔍 INICIANDO VALIDAÇÕES...")
        
        overall_result = ValidationResult()
        filtered_rows = {}
        
        # Registra PKs ANTES de validar (para contexto estar pronto)
        print("\n🔑 REGISTRANDO PKs PARA CONTEXTO...")
        self._register_primary_keys(mapped_rows_by_table, raw_mappings)
        
        # Valida cada tabela
        for table_id in dependency_order:
            rows = mapped_rows_by_table.get(table_id, [])
            if not rows:
                filtered_rows[table_id] = []
                continue
            
            table = self.table_config.get_by_id(int(table_id))
            fk_configs = fk_mappings.get(table_id, [])
            
            # Extrai configurações de colunas
            all_mapping_columns = []
            for mapping in raw_mappings:
                all_mapping_columns.extend(mapping.columns)
            
            column_configs = self.column_config_extractor.extract_for_validation(
                mapping_columns=all_mapping_columns,
                table_id=table_id
            )
            
            print(f"\n  📋 Validando {table.name} ({len(rows)} linhas)")
            if fk_configs:
                print(f"     - {len(fk_configs)} FK(s)")
            if column_configs:
                print(f"     - {len(column_configs)} coluna(s) com validação de tipo")
            
            # ✨ USA ORCHESTRATOR PARA VALIDAR
            valid_rows, table_result = self.validation_orchestrator.validate_all(
                rows=rows,
                table_name=table.name,
                table_id=table_id,
                fk_configs=fk_configs,
                column_configs=column_configs,
                error_strategy=error_strategy,
                start_row_index=0
            )
            
            # Merge resultados
            overall_result.merge(table_result)
            filtered_rows[table_id] = valid_rows
            
            # Mostra resumo da tabela
            invalid_count = len(rows) - len(valid_rows)
            if invalid_count > 0:
                print(f"     ✅ {len(valid_rows)} válidas, ❌ {invalid_count} inválidas")
            else:
                print(f"     ✅ Todas as {len(valid_rows)} linhas válidas")
            
            # Se abort_on_first e tem erro, para
            if error_strategy == ErrorStrategy.ABORT_ON_FIRST and table_result.has_errors:
                print(f"\n❌ ABORTANDO (estratégia: abort_on_first)")
                return overall_result, {}
        
        # Resumo final
        print("\n" + "="*60)
        print("📊 RESUMO DA VALIDAÇÃO")
        print("="*60)
        print(f"Total de linhas: {overall_result.total_rows}")
        print(f"✅ Válidas: {overall_result.valid_rows} ({overall_result.success_rate:.1f}%)")
        print(f"❌ Inválidas: {overall_result.invalid_rows}")
        print(f"Total de erros: {len(overall_result.errors)}")
        print("="*60)
        
        return overall_result, filtered_rows
    
    # ============================================================
    # HELPERS (MANTIDOS DO ORIGINAL)
    # ============================================================
    
    def _load_error_strategy(self) -> ErrorStrategy:
        """Carrega estratégia de erro das settings"""
        try:
            value = self.setting_repo.get('error_strategy')
        except ValueError:
            value = 'abort_on_first'
        return ErrorStrategy(value or 'abort_on_first')
    
    def _get_dependency_order(
        self,
        mapped_rows_by_table: Dict[str, List[Dict]], 
        fk_mappings: Dict[int, List[Dict]]
    ) -> List[int]:
        """Ordena tabelas por dependência (código original mantido)"""
        # [CÓDIGO ORIGINAL - NÃO MUDOU]
        dependencies = defaultdict(list)
        table_names = {
            table_id: self.table_config.get_by_id(int(table_id)).name
            for table_id in mapped_rows_by_table.keys()
        }

        for table_id in mapped_rows_by_table.keys():
            if table_id in fk_mappings:
                for fk_config in fk_mappings[table_id]:
                    reference_entity = fk_config['reference_entity']
                    ref_table_id = next(
                        (tid for tid, name in table_names.items() if name == reference_entity),
                        None
                    )
                    if ref_table_id:
                        dependencies[table_id].append(ref_table_id)
        
        in_degree = {table_id: 0 for table_id in mapped_rows_by_table.keys()}
        
        for table_id, deps in dependencies.items():
            in_degree[table_id] = len(deps)
        
        queue = deque([table_id for table_id, degree in in_degree.items() if degree == 0])
        ordered = []
        
        while queue:
            current = queue.popleft()
            ordered.append(current)
            
            for table_id, deps in dependencies.items():
                if current in deps:
                    in_degree[table_id] -= 1
                    if in_degree[table_id] == 0:
                        queue.append(table_id)
        
        if len(ordered) != len(mapped_rows_by_table):
            for table_id in mapped_rows_by_table.keys():
                if table_id not in ordered:
                    ordered.append(table_id)
        
        print("\n📋 ORDEM DE PROCESSAMENTO:")
        for idx, table_id in enumerate(ordered, 1):
            table_name = table_names.get(table_id, f"ID={table_id}")
            deps = dependencies.get(table_id, [])
            deps_names = [table_names.get(d, f"ID={d}") for d in deps]
            
            if deps_names:
                print(f"   {idx}. {table_name} (depende de: {', '.join(deps_names)})")
            else:
                print(f"   {idx}. {table_name} (sem dependências)")
        
        return ordered
    
    def _extract_fk_mappings(self, raw_mappings) -> Dict[int, List[Dict]]:
        """
        Extrai mapeamentos de FK de mapping_columns.
        """
        fk_mappings = {}
        
        print("\n🔍 DEBUG _extract_fk_mappings:")
        print(f"  Total de mappings: {len(raw_mappings)}")
        
        # Primeiro, agrupa todos mapping_columns por origin_table_id
        by_origin_table = {}
        for mapping in raw_mappings:
            print(f"\n  Mapping ID={mapping.id}, total colunas={len(mapping.columns)}")
            for mapping_column in mapping.columns:
                origin_table_id = mapping_column.origin_table_id
                origin_col = mapping_column.origin_column.name
                destiny_col = mapping_column.destiny_column.name
                destiny_table_id = mapping_column.destiny_table_id
                destiny_table_name = mapping_column.destiny_table.name
                
                print(f"    {mapping_column.origin_table.name}.{origin_col} -> {destiny_table_name}.{destiny_col} (destiny_table_id={destiny_table_id})")
                print(f"      destiny_column.is_pk={mapping_column.destiny_column.is_pk}")
                print(f"      destiny_column.table_id={mapping_column.destiny_column.table_id}")
                print(f"      destiny_column.foreign_table_id={mapping_column.destiny_column.foreign_table_id}")
                
                if origin_table_id not in by_origin_table:
                    by_origin_table[origin_table_id] = []
                
                by_origin_table[origin_table_id].append(mapping_column)
        
        # Para cada origin_table, descobre a tabela de destino real
        for origin_table_id, mapping_columns in by_origin_table.items():
            origin_table_name = mapping_columns[0].origin_table.name if mapping_columns else "?"
            print(f"\n  Processando origin_table: {origin_table_name} (ID={origin_table_id})")
            
            # Descobre qual é a tabela de destino real
            destiny_table_candidates = {}
            
            for mc in mapping_columns:
                # Se a coluna de destino não é PK de outra tabela, conta como candidata
                if not mc.destiny_column.is_pk or mc.destiny_column.table_id == mc.destiny_table_id:
                    destiny_table_candidates[mc.destiny_table_id] = destiny_table_candidates.get(mc.destiny_table_id, 0) + 1
            
            print(f"    Candidatas para destiny_table: {destiny_table_candidates}")
            
            if not destiny_table_candidates:
                print(f"    ⚠️ Nenhuma candidata encontrada!")
                continue
                
            real_destiny_table_id = max(destiny_table_candidates, key=destiny_table_candidates.get)
            real_destiny_table = self.table_config.get_by_id(real_destiny_table_id)
            print(f"    ✓ Tabela de destino real: {real_destiny_table.name} (ID={real_destiny_table_id})")
            
            # Processa as FKs para esta tabela
            for mapping_column in mapping_columns:
                destiny_column = mapping_column.destiny_column
                origin_column  = mapping_column.origin_column

                if destiny_column.foreign_table_id and destiny_column.foreign_column_id:
                    self._append_explicit_fk(fk_mappings, real_destiny_table_id, destiny_column, origin_column)

                elif destiny_column.is_pk and destiny_column.table_id != real_destiny_table_id:
                    self._append_pk_reference_fk(fk_mappings, real_destiny_table_id, destiny_column, origin_column)

                elif destiny_column.name.endswith('_id') and not destiny_column.is_pk:
                    self._append_implicit_fk(fk_mappings, real_destiny_table_id, destiny_column, origin_column, mapping_columns)
        
        print(f"\n  FKs finais detectadas: {len(fk_mappings)} tabela(s)")
        return fk_mappings

    def _append_explicit_fk(self, fk_mappings, table_id, destiny_column, origin_column):
        """CASO 1: coluna de destino tem FK explícita configurada (foreign_table_id + foreign_column_id)."""
        foreign_table = destiny_column.foreign_table
        print(f"    CASO 1: FK explícita encontrada!")
        print(f"      {origin_column.name} -> {destiny_column.name} (ref: {foreign_table.name})")

        fk_mappings.setdefault(table_id, []).append({
            'source_column': destiny_column.name,
            'target_column': destiny_column.name,
            'reference_entity': foreign_table.name,
            'reference_column': destiny_column.foreign_column.name
        })

    def _append_pk_reference_fk(self, fk_mappings, table_id, destiny_column, origin_column):
        """CASO 2: coluna de destino é PK de outra tabela — gera coluna FK implícita."""
        reference_table = destiny_column.table
        fk_column_name = f"{reference_table.name.rstrip('s2').rstrip('s')}_id"
        print(f"    CASO 2: Mapeamento para PK de outra tabela!")
        print(f"      {origin_column.name} -> {reference_table.name}.{destiny_column.name}")
        print(f"      Coluna FK gerada: {fk_column_name}")

        fk_mappings.setdefault(table_id, []).append({
            'source_column': origin_column.name,
            'target_column': fk_column_name,
            'reference_entity': reference_table.name,
            'reference_column': destiny_column.name
        })

    def _append_implicit_fk(self, fk_mappings, table_id, destiny_column, origin_column, mapping_columns):
        """CASO 3: coluna termina com _id sem FK explícita — tenta inferir tabela referenciada."""
        print(f"    CASO 3: Coluna suspeita de FK (termina com _id mas sem foreign_table_id)")
        print(f"      {origin_column.name} -> {destiny_column.name}")

        base_name = destiny_column.name[:-3]
        possible_tables = [
            mc.destiny_table
            for mc in mapping_columns
            if mc.destiny_table.id != table_id and (
                mc.destiny_table.name.startswith(base_name) or
                mc.destiny_table.name.rstrip('s2').rstrip('s') == base_name
            )
        ]

        if not possible_tables:
            print(f"      ⚠️ Não foi possível determinar tabela referenciada")
            return

        reference_table = possible_tables[0]
        ref_pk = self._get_pk_column_obj(reference_table)
        if ref_pk:
            print(f"      ✓ Detectado como FK para {reference_table.name}.{ref_pk.name}")
            fk_mappings.setdefault(table_id, []).append({
                'source_column': origin_column.name,
                'target_column': destiny_column.name,
                'reference_entity': reference_table.name,
                'reference_column': ref_pk.name
            })

    def _register_primary_keys(
        self,
        mapped_rows_by_table: Dict[str, List[Dict]],
        raw_mappings
    ):
        """
        Registra PKs E natural keys no contexto de migração.
        Usa is_natural_key da coluna de origem.
        """
        print("\n🔑 REGISTRANDO CHAVES PRIMÁRIAS E NATURAIS:")
        
        # Cria mapa de colunas naturais por tabela de destino
        natural_keys_map = {}
        
        for mapping in raw_mappings:
            for mapping_column in mapping.columns:
                if mapping_column.origin_column.is_natural_key:
                    destiny_table_id = mapping_column.destiny_table_id
                    destiny_column_name = mapping_column.destiny_column.name
                    
                    if destiny_table_id not in natural_keys_map:
                        natural_keys_map[destiny_table_id] = {}
                    
                    natural_keys_map[destiny_table_id][destiny_column_name] = mapping_column.origin_column
                    
                    print(f"  🔍 Natural Key detectada:")
                    print(f"     {mapping_column.origin_table.name}.{mapping_column.origin_column.name} (origem)")
                    print(f"     → {mapping_column.destiny_table.name}.{destiny_column_name} (destino)")
        
        # Registra as chaves
        for destiny_table_id, rows in mapped_rows_by_table.items():
            if not rows:
                continue
                
            table = self.table_config.get_by_id(int(destiny_table_id))
            pk_column = self._get_pk_column(table)
            
            print(f"\n  Tabela: {table.name} (PK={pk_column})")
            
            if not pk_column:
                print(f"  ⚠️ Sem PK definida!")
                continue
            
            natural_keys_columns = natural_keys_map.get(destiny_table_id, {})
            
            for row in rows:
                if pk_column not in row:
                    continue
                    
                pk_value = row[pk_column]
                
                # 1. Registra pela PK
                self.context.register(
                    entity=table.name,
                    natural_key=str(pk_value),
                    destination_id=int(pk_value)
                )
                print(f"    📝 PK: {table.name}['{pk_value}'] = {pk_value}")
                
                # 2. Registra pelas Natural Keys
                for col_name in natural_keys_columns.keys():
                    if col_name in row and row[col_name]:
                        col_value = row[col_name]
                        self.context.register(
                            entity=table.name,
                            natural_key=str(col_value),
                            destination_id=int(pk_value)
                        )
                        print(f"    🔑 Natural Key: {table.name}['{col_value}'] = {pk_value}")
                        
            total_natural_keys = len(natural_keys_columns)
            print(f"  ✅ Total: {len(rows)} registros ({total_natural_keys} natural key(s))")
    
    def _resolve_foreign_keys(
        self,
        mapped_rows_by_table: Dict[str, List[Dict]], 
        fk_mappings: Dict[int, List[Dict]],
        raw_mappings
    ):
        """
        Resolve FKs usando os mapeamentos de mapping_columns.
        """
        resolver = NaturalKeyResolver(self.context)
        
        for destiny_table_id, rows in mapped_rows_by_table.items():
            if not rows:
                continue
            
            table_fks = fk_mappings.get(destiny_table_id, [])
            if not table_fks:
                continue
            
            table = self.table_config.get_by_id(int(destiny_table_id))
            
            for fk_config in table_fks:
                source_column = fk_config['source_column']
                target_column = fk_config['target_column']
                reference_entity = fk_config['reference_entity']
                reference_column = fk_config['reference_column']
                
                if not rows or source_column not in rows[0]:
                    print(f"⚠️ Coluna {source_column} não encontrada em {table.name}")
                    print(f"   Colunas disponíveis: {list(rows[0].keys()) if rows else []}")
                    continue
                
                print(f"🔄 Resolvendo FK: {table.name}.{source_column} -> {reference_entity}.{reference_column}")
                
                if rows:
                    sample_value = rows[0].get(source_column)
                    print(f"  🔍 Valor original na FK: '{sample_value}'")
                
                # Descobre transformações da tabela referenciada
                reference_table_id = next(
                    (tid for tid in mapped_rows_by_table
                     if self.table_config.get_by_id(int(tid)).name == reference_entity),
                    None
                )
                transformations_to_apply, actual_reference_column = \
                    self._find_transformations_for_reference(reference_entity, reference_table_id, raw_mappings)

                # Aplica transformações se encontradas
                if transformations_to_apply:
                    print(f"  ⚡ Aplicando transformações da coluna {reference_entity}.{actual_reference_column}")
                    
                    for row_index, row in enumerate(rows):
                        original_value = row[source_column]
                        transformed_value = self.transformation_processor.apply_transformations(
                            value=original_value,
                            transformations=transformations_to_apply
                        )
                        row[source_column] = transformed_value
                        
                        if row_index == 0:
                            print(f"    '{original_value}' → '{transformed_value}'")
                else:
                    print(f"  ℹ️ Nenhuma transformação encontrada em {reference_entity}")
                
                try:
                    original_count = len(rows)
                    
                    mapped_rows_by_table[destiny_table_id] = resolver.resolve_rows(
                        rows=mapped_rows_by_table[destiny_table_id],
                        source_column=source_column,
                        target_column=target_column,
                        entity=reference_entity,
                        table_name=table.name
                    )
                    
                    new_count = len(mapped_rows_by_table[destiny_table_id])
                    
                    if new_count > original_count:
                        print(f"✅ FK resolvida: {table.name}.{target_column} ({original_count} → {new_count} linhas expandidas!)")
                    else:
                        print(f"✅ FK resolvida: {table.name}.{target_column}")
                        
                except ValueError as e:
                    print(f"❌ Erro ao resolver FK: {e}")
                    continue
    
    def _find_transformations_for_reference(
        self,
        reference_entity: str,
        reference_table_id,
        raw_mappings
    ):
        """
        Procura transformações configuradas para colunas da tabela referenciada.

        Returns:
            (transformations, column_name) se encontrado, (None, None) caso contrário.
        """
        if not reference_table_id:
            return None, None

        print(f"  🔍 Procurando transformações em colunas de {reference_entity}")

        for mapping in raw_mappings:
            for mapping_column in mapping.columns:
                if mapping_column.destiny_table_id == reference_table_id and mapping_column.transformations:
                    column_name = mapping_column.destiny_column.name
                    print(f"  ✅ Encontradas {len(mapping_column.transformations)} transformação(ões) em {reference_entity}.{column_name}")
                    return mapping_column.transformations, column_name

        return None, None

    def _apply_transformations(
        self,
        mapped_rows_by_table: Dict[str, List[Dict]],
        raw_mappings
    ):
        """
        Aplica transformações configuradas nos dados mapeados.
        """
        print("\n🔄 APLICANDO TRANSFORMAÇÕES:")
        
        # Organiza transformações por (destiny_table_id, destiny_column_id)
        transformations_map = {}
        
        for mapping in raw_mappings:
            for mapping_column in mapping.columns:
                if not mapping_column.transformations:
                    continue
                
                key = (
                    mapping_column.destiny_table_id,
                    mapping_column.destiny_column.name
                )
                transformations_map[key] = mapping_column.transformations
        
        if not transformations_map:
            print("  Nenhuma transformação configurada.")
            return
        
        # Aplica transformações nos dados
        for destiny_table_id, rows in mapped_rows_by_table.items():
            if not rows:
                continue
            
            table = self.table_config.get_by_id(int(destiny_table_id))
            print(f"\n  Tabela: {table.name}")
            
            # Para cada linha
            for row in rows:
                # Para cada coluna na linha
                for column_name in list(row.keys()):
                    key = (destiny_table_id, column_name)
                    
                    if key not in transformations_map:
                        continue
                    
                    transformations = transformations_map[key]
                    original_value = row[column_name]
                    
                    # Aplica transformações
                    transformed_value = self.transformation_processor.apply_transformations(
                        value=original_value,
                        transformations=transformations
                    )
                    
                    # Atualiza o valor
                    row[column_name] = transformed_value
                    
                    print(f"    ✓ {column_name}: '{original_value}' → '{transformed_value}'")
    
    def _get_pk_column(self, table) -> Optional[str]:
        """Retorna nome da coluna PK"""
        for column in table.columns:
            if column.is_pk:
                return column.name
        return None
    
    def _get_pk_column_obj(self, table):
        """Retorna objeto da coluna PK"""
        for column in table.columns:
            if column.is_pk:
                return column
        return None
    
    # ============================================================
    # GERAÇÃO DE SQL
    # ============================================================
    
    def _generate_sql(
        self,
        filtered_rows: Dict[str, List[Dict]],
        migration_project,
        error_strategy: ErrorStrategy
    ) -> Optional[str]:
        """Gera arquivo SQL"""
        
        if error_strategy == ErrorStrategy.VALIDATE_ALL:
            print("\n📄 SQL NÃO gerado (modo validação)")
            return None
        
        sql_builder = MigrationSQLBuilder()
        file_builder = MigrationSQLFileBuilder("/app/sql_output")
        sql_blocks = []
        
        for destiny_table_id, rows in filtered_rows.items():
            if not rows:
                continue
            
            table = self.table_config.get_by_id(int(destiny_table_id))
            sql = sql_builder.build_insert_sql(
                table_name=table.name,
                rows=rows
            )
            if sql:
                sql_blocks.append(sql)
        
        sql_file = file_builder.write(
            migration_project_name=migration_project.name,
            sql_blocks=sql_blocks
        )
        
        print(f"\n📄 SQL gerado: {sql_file}")
        return str(sql_file) if sql_file else None
    
    # ============================================================
    # RESPONSE BUILDERS
    # ============================================================
    
    def _build_success_response(
        self,
        migration_project_id: int,
        error_strategy: ErrorStrategy,
        validation_result,
        sql_file: Optional[str]
    ) -> Dict:
        """Constrói resposta de sucesso"""
        
        # Determina status
        if error_strategy == ErrorStrategy.VALIDATE_ALL:
            status = "validation_passed" if not validation_result.has_errors else "validation_failed"
        else:
            status = "success" if not validation_result.has_errors else "completed_with_errors"
        
        return {
            "status": status,
            "message": self._get_status_message(status, validation_result),
            "migration_project_id": migration_project_id,
            "error_strategy": error_strategy.value,
            "sql_file": sql_file,
            "validation": validation_result.to_dict(),
            "duplicate_warnings": len(self.context.get_duplicate_warnings()),
            "stats": self.context.get_stats()
        }
    
    def _build_error_response(
        self,
        status: str,
        migration_project_id: int,
        error_strategy: ErrorStrategy,
        validation_result,
        message: Optional[str] = None
    ) -> Dict:
        """Constrói resposta de erro"""
        
        return {
            "status": status,
            "message": message or self._get_status_message(status, validation_result),
            "migration_project_id": migration_project_id,
            "error_strategy": error_strategy.value,
            "validation": validation_result.to_dict(),
            "sql_file": None
        }
    
    def _get_status_message(self, status: str, validation_result) -> str:
        """Gera mensagem descritiva"""
        messages = {
            "success": "Migração executada com sucesso!",
            "completed_with_errors": f"Migração concluída com {len(validation_result.errors)} erro(s)",
            "validation_passed": "Validação concluída: dados válidos",
            "validation_failed": f"Validação falhou: {len(validation_result.errors)} erro(s)",
            "aborted": "Migração abortada",
            "error": "Erro durante migração"
        }
        return messages.get(status, "Status desconhecido")
    
    def _apply_id_generation(
        self,
        mapped_rows_by_table: Dict[str, List[Dict]],
        raw_mappings
    ):
        """
        Aplica geração de IDs configurada e registra mapeamentos
        
        FLUXO:
        1. Para cada tabela
        2. Identifica coluna PK
        3. Verifica estratégia de ID configurada
        4. Se não for 'keep', gera novos IDs
        5. Registra mapeamento (old_id → new_id)
        6. Substitui ID na linha
        """
        print("\n🔄 APLICANDO GERAÇÃO DE IDs...")
        
        for table_id, rows in mapped_rows_by_table.items():
            if not rows:
                continue

            table = self.table_config.get_by_id(int(table_id))

            pk_column = self._get_pk_column_obj(table)
            if not pk_column:
                continue

            strategy = IdGenerationStrategy(pk_column.id_generation_strategy or 'keep')

            if strategy == IdGenerationStrategy.KEEP:
                print(f"  ✓ {table.name}.{pk_column.name}: KEEP (mantém original)")
                continue

            start_value = pk_column.id_start_value or 1
            print(f"  🔧 {table.name}.{pk_column.name}: {strategy.value.upper()} (start={start_value})")

            for idx, row in enumerate(rows):
                if pk_column.name not in row:
                    continue

                old_id = row[pk_column.name]
                new_id = self.id_generator.generate(
                    strategy=strategy,
                    original_value=old_id,
                    entity=table.name,
                    start_value=start_value
                )

                self.context.register_id_mapping(entity=table.name, old_id=old_id, new_id=new_id)
                row[pk_column.name] = new_id

                if idx < 3:
                    print(f"     {old_id} → {new_id}")

            if len(rows) > 3:
                print(f"     ... e mais {len(rows) - 3}")
        
        print("  ✅ Geração de IDs concluída")

    def _resolve_fks_with_id_mapping(
        self,
        mapped_rows_by_table: Dict[str, List[Dict]],
        fk_mappings: Dict[int, List[Dict]]
    ):
        """
        Resolve FKs usando mapeamento de IDs
        
        Se a tabela pai teve IDs convertidos (1 → 1000),
        as FKs filhas precisam ser atualizadas também.
        
        EXEMPLO:
            customers:
                CSV: id=1  →  Destino: id=1000
            
            orders:
                CSV: customer_id=1  →  Precisa virar: customer_id=1000
        """
        print("\n🔗 RESOLVENDO FKs COM MAPEAMENTO DE IDs...")
        
        has_any_mapping = False
        
        for table_id, rows in mapped_rows_by_table.items():
            if not rows:
                continue
            
            table_fks = fk_mappings.get(table_id, [])
            if not table_fks:
                continue
            
            table = self.table_config.get_by_id(int(table_id))
            
            for fk_config in table_fks:
                source_column = fk_config['source_column']
                reference_entity = fk_config['reference_entity']
                
                print(f"  📋 {table.name}.{source_column} → {reference_entity}")
                
                # Verifica se a tabela referenciada tem mapeamentos de ID
                mappings = self.context.id_mapping.get_all_mappings(reference_entity)
                
                if not mappings:
                    print(f"     ℹ️ Sem mapeamentos de ID para {reference_entity}")
                    continue
                
                has_any_mapping = True
                
                # Processa cada linha
                updated_count = 0
                for row in rows:
                    if source_column not in row:
                        continue
                    
                    old_fk_value = row[source_column]
                    
                    # Tenta resolver com mapeamento
                    new_fk_value = self.context.resolve_id_mapping(
                        entity=reference_entity,
                        old_id=old_fk_value
                    )
                    
                    if new_fk_value is not None:
                        row[source_column] = new_fk_value
                        updated_count += 1
                
                if updated_count > 0:
                    print(f"     ✅ {updated_count} FK(s) atualizadas")
                else:
                    print(f"     ℹ️ Nenhuma FK precisou ser atualizada")
        
        if not has_any_mapping:
            print("  ℹ️ Nenhum mapeamento de ID encontrado (estratégia = KEEP)")