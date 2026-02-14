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
from typing import Dict, List, Any, Optional
from collections import defaultdict, deque
from application.validation.validation_result import ValidationResult
from application.validation.validation_error import ValidationError

from domain.enum.error_strategy import ErrorStrategy
from domain.repositories.setting_repository import SettingRepository

class MappingService:
    def __init__(self, db: Session):
        self.repo = MappingRepository(db)
        self.table_config = TableConfigRepository(db)
        self.context = MigrationContext()
        self.transformation_processor = TransformationProcessor(db)
        self.setting_repo = SettingRepository(db)
        
    def create_mapping(self, request: MappingCreate):
        return self.repo.create(request)
    
    def list_mapping(self, migration_project_id: int):
        return self.repo.list(migration_project_id)
    
    def delete_mapping(self, mapping_id: int) -> bool:
        return self.repo.delete(mapping_id)
    
    def show_mapping(self, mapping_id: int):
        return self.repo.get_by_id(mapping_id)
    
    def update_mapping(self, mapping_id: int, data: MappingUpdate):
        print("Estou no service do update")
        return self.repo.update(mapping_id, data)
    
    def _get_dependency_order(self, mapped_rows_by_table: Dict[str, List[Dict]], 
                            fk_mappings: Dict[int, List[Dict]]) -> List[int]:
        """
        Ordena tabelas por dependência: pais primeiro, filhos depois.
        
        Exemplo:
            customers (sem FK) → processa primeiro
            orders (FK para customers) → processa depois
            order_items (FK para orders) → processa por último
        
        Args:
            mapped_rows_by_table: Dados por tabela {table_id: [rows]}
            fk_mappings: FKs por tabela {table_id: [fk_configs]}
        
        Returns:
            Lista de table_ids em ordem de dependência
            Ex: [6, 9, 12] (customers, orders, order_items)
        """
        
        
        # Mapa de dependências: table_id → [tables que ela depende]
        dependencies = defaultdict(list)
        
        # Mapa de tabelas → nome (para debug)
        table_names = {}
        
        # Identifica dependências baseado nas FKs
        for table_id in mapped_rows_by_table.keys():
            table = self.table_config.get_by_id(int(table_id))
            table_names[table_id] = table.name
            
            # Se tabela tem FKs, ela depende de outras tabelas
            if table_id in fk_mappings:
                for fk_config in fk_mappings[table_id]:
                    reference_entity = fk_config['reference_entity']
                    
                    # Encontra o table_id da tabela referenciada
                    for ref_table_id in mapped_rows_by_table.keys():
                        ref_table = self.table_config.get_by_id(int(ref_table_id))
                        if ref_table.name == reference_entity:
                            # table_id DEPENDE de ref_table_id
                            dependencies[table_id].append(ref_table_id)
                            break
        
        # Ordenação topológica (algoritmo de Kahn)
        # Conta quantas dependências cada tabela tem
        in_degree = {table_id: 0 for table_id in mapped_rows_by_table.keys()}
        
        for table_id, deps in dependencies.items():
            in_degree[table_id] = len(deps)
        
        # Fila com tabelas sem dependências (pais)
        queue = deque([table_id for table_id, degree in in_degree.items() if degree == 0])
        ordered = []
        
        while queue:
            current = queue.popleft()
            ordered.append(current)
            
            # Remove current das dependências de outras tabelas
            for table_id, deps in dependencies.items():
                if current in deps:
                    in_degree[table_id] -= 1
                    if in_degree[table_id] == 0:
                        queue.append(table_id)
        
        # Verifica se há ciclo (não deveria acontecer)
        if len(ordered) != len(mapped_rows_by_table):
            print("⚠️ AVISO: Detectado possível dependência circular!")
            print(f"   Tabelas ordenadas: {len(ordered)}")
            print(f"   Total de tabelas: {len(mapped_rows_by_table)}")
            # Adiciona tabelas restantes no final
            for table_id in mapped_rows_by_table.keys():
                if table_id not in ordered:
                    ordered.append(table_id)
        
        # Debug: mostra ordem
        print("\n📋 ORDEM DE PROCESSAMENTO DAS TABELAS:")
        for idx, table_id in enumerate(ordered, 1):
            table_name = table_names.get(table_id, f"ID={table_id}")
            deps = dependencies.get(table_id, [])
            deps_names = [table_names.get(d, f"ID={d}") for d in deps]
            
            if deps_names:
                print(f"   {idx}. {table_name} (depende de: {', '.join(deps_names)})")
            else:
                print(f"   {idx}. {table_name} (sem dependências)")
        
        return ordered
    

    def _validate_and_filter(
        self,
        mapped_rows_by_table: Dict[str, List[Dict]],
        fk_mappings: Dict[int, List[Dict]],
        raw_mappings,
        error_strategy: 'ErrorStrategy',
    ) -> tuple:
        """
        Valida dados transformados e filtra linhas válidas.
        
        NOVO FLUXO SIMPLIFICADO:
        1. Registra TODAS as PKs e natural keys (para o contexto ficar pronto)
        2. Valida FKs (agora pode verificar se natural keys existem)
        3. Filtra linhas válidas
        """
        
        print("\n🔍 INICIANDO VALIDAÇÃO...")
        
        result = ValidationResult()
        filtered_rows = {}
        
        # Ordena tabelas por dependência (pais primeiro)
        ordered_table_ids = self._get_dependency_order(mapped_rows_by_table, fk_mappings)
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 1: REGISTRAR TODAS AS PKs E NATURAL KEYS
        # (Isso prepara o contexto para validação)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n🔑 REGISTRANDO PKs E NATURAL KEYS...")
        self._register_primary_keys(mapped_rows_by_table, raw_mappings)
        print("   ✅ Contexto preparado para validação")
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ETAPA 2: VALIDAR FKs (agora que contexto está pronto)
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n🔍 VALIDANDO FKs...")
        
        for table_id in ordered_table_ids:
            rows = mapped_rows_by_table.get(table_id, [])
            if not rows:
                filtered_rows[table_id] = []
                continue
            
            table = self.table_config.get_by_id(int(table_id))
            fk_configs = fk_mappings.get(table_id, [])
            
            if not fk_configs:
                # Tabela sem FKs - todas as linhas são válidas
                print(f"  ✅ {table.name}: sem FKs, {len(rows)} linhas válidas")
                filtered_rows[table_id] = rows
                result.total_rows += len(rows)
                result.valid_rows += len(rows)
                continue
            
            print(f"  📋 Validando {table.name} ({len(rows)} linhas, {len(fk_configs)} FK(s))...")
            
            valid_rows = []
            
            for row_index, row in enumerate(rows):
                result.total_rows += 1
                has_error = False
                
                # Valida cada FK da linha
                for fk_config in fk_configs:
                    source_column = fk_config['source_column']
                    reference_entity = fk_config['reference_entity']
                    
                    # Pega o valor da FK
                    if source_column not in row:
                        continue
                    
                    fk_value = row[source_column]
                    
                    # Pula se NULL/vazio
                    if fk_value is None or fk_value == '':
                        continue
                    
                    # ✨ TENTA RESOLVER A NATURAL KEY
                    try:
                        resolved_id = self.context.resolve(
                            entity=reference_entity,
                            natural_key=str(fk_value)
                        )
                        
                        # Se retornou None, não encontrou
                        if resolved_id is None:
                            error = ValidationError(
                                row_index=row_index,
                                table=table.name,
                                column=source_column,
                                error_type="natural_key_not_found",
                                message=f"Chave natural '{fk_value}' não encontrada em {reference_entity}",
                                value=fk_value,
                                severity="error",
                                related_error=f"O valor '{fk_value}' não existe na tabela {reference_entity}"
                            )
                            
                            result.add_error(error)
                            has_error = True
                            
                            print(f"    ❌ Linha {row_index}: '{fk_value}' não encontrado em {reference_entity}")
                            
                            # ABORT_ON_FIRST: para imediatamente
                            if error_strategy == ErrorStrategy.ABORT_ON_FIRST:
                                print(f"\n❌ ABORTANDO (estratégia: abort_on_first)")
                                return result, {}
                            
                            break  # Pula para próxima linha
                        
                    except Exception as e:
                        # Erro ao resolver
                        error = ValidationError(
                            row_index=row_index,
                            table=table.name,
                            column=source_column,
                            error_type="resolution_error",
                            message=f"Erro ao resolver FK: {str(e)}",
                            value=fk_value,
                            severity="error"
                        )
                        
                        result.add_error(error)
                        has_error = True
                        
                        print(f"    ❌ Linha {row_index}: erro ao resolver '{fk_value}'")
                        
                        if error_strategy == ErrorStrategy.ABORT_ON_FIRST:
                            print(f"\n❌ ABORTANDO (estratégia: abort_on_first)")
                            return result, {}
                        
                        break
                
                # Se não teve erro, linha é válida
                if not has_error:
                    valid_rows.append(row)
                    result.valid_rows += 1
            
            filtered_rows[table_id] = valid_rows
            
            invalid_count = len(rows) - len(valid_rows)
            if invalid_count > 0:
                print(f"    ✅ {len(valid_rows)} válidas, ❌ {invalid_count} inválidas")
            else:
                print(f"    ✅ Todas as {len(valid_rows)} linhas válidas")
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # RESUMO
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        print("\n" + "="*60)
        print("📊 RESUMO DA VALIDAÇÃO")
        print("="*60)
        print(f"Total de linhas: {result.total_rows}")
        print(f"✅ Válidas: {result.valid_rows} ({result.success_rate:.1f}%)")
        print(f"❌ Inválidas: {result.invalid_rows}")
        print(f"Total de erros: {len(result.errors)}")
        print("="*60)
        
        return result, filtered_rows
    
    def _get_pk_column(self, table) -> Optional[str]:
        """
        Retorna a coluna PK da tabela (apenas o nome).
        """
        for column in table.columns:
            if column.is_pk:
                return column.name
        return None
    
    def _get_pk_column_obj(self, table):
        """
        Retorna o objeto da coluna PK da tabela.
        """
        for column in table.columns:
            if column.is_pk:
                return column
        return None
    
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
            
            # Agora processa as FKs para esta tabela
            for mapping_column in mapping_columns:
                destiny_column = mapping_column.destiny_column
                origin_column = mapping_column.origin_column
                
                # CASO 1: Coluna com FK explícita
                if destiny_column.foreign_table_id and destiny_column.foreign_column_id:
                    foreign_table = destiny_column.foreign_table
                    
                    print(f"    CASO 1: FK explícita encontrada!")
                    print(f"      {origin_column.name} -> {destiny_column.name} (ref: {foreign_table.name})")
                    
                    if real_destiny_table_id not in fk_mappings:
                        fk_mappings[real_destiny_table_id] = []
                    
                    # IMPORTANTE: source_column deve ser o nome da coluna JÁ MAPEADA (destiny_column.name)
                    # porque os dados já foram carregados com esse nome!
                    fk_mappings[real_destiny_table_id].append({
                        'source_column': destiny_column.name,  # ← customer_id (nome já mapeado)
                        'target_column': destiny_column.name,  # ← customer_id (mesmo nome)
                        'reference_entity': foreign_table.name,
                        'reference_column': destiny_column.foreign_column.name
                    })
                
                # CASO 2: Mapeamento para PK de OUTRA tabela
                elif destiny_column.is_pk and destiny_column.table_id != real_destiny_table_id:
                    reference_table = destiny_column.table
                    
                    print(f"    CASO 2: Mapeamento para PK de outra tabela!")
                    print(f"      {origin_column.name} -> {reference_table.name}.{destiny_column.name}")
                    
                    # Gera nome da coluna FK
                    fk_column_name = f"{reference_table.name.rstrip('s2').rstrip('s')}_id"
                    print(f"      Coluna FK gerada: {fk_column_name}")
                    
                    if real_destiny_table_id not in fk_mappings:
                        fk_mappings[real_destiny_table_id] = []
                    
                    fk_mappings[real_destiny_table_id].append({
                        'source_column': origin_column.name,
                        'target_column': fk_column_name,
                        'reference_entity': reference_table.name,
                        'reference_column': destiny_column.name
                    })
                
                # CASO 3: Coluna que PARECE FK mas não está configurada
                # (termina com _id e não é PK)
                elif destiny_column.name.endswith('_id') and not destiny_column.is_pk:
                    print(f"    CASO 3: Coluna suspeita de FK (termina com _id mas sem foreign_table_id)")
                    print(f"      {origin_column.name} -> {destiny_column.name}")
                    
                    # Tenta descobrir qual tabela ela referencia pelo nome
                    # Ex: customer_id -> customers, customers2
                    base_name = destiny_column.name[:-3]  # Remove '_id'
                    
                    # Procura por tabelas que batem com o nome
                    possible_tables = []
                    for other_mc in mapping_columns:
                        other_dest_table = other_mc.destiny_table
                        # Verifica se o nome bate
                        if (other_dest_table.name.startswith(base_name) or 
                            other_dest_table.name.rstrip('s2').rstrip('s') == base_name):
                            if other_dest_table.id != real_destiny_table_id:
                                possible_tables.append(other_dest_table)
                    
                    if possible_tables:
                        reference_table = possible_tables[0]
                        # Pega a PK da tabela referenciada
                        ref_pk = self._get_pk_column_obj(reference_table)
                        
                        if ref_pk:
                            print(f"      ✓ Detectado como FK para {reference_table.name}.{ref_pk.name}")
                            
                            if real_destiny_table_id not in fk_mappings:
                                fk_mappings[real_destiny_table_id] = []
                            
                            fk_mappings[real_destiny_table_id].append({
                                'source_column': origin_column.name,
                                'target_column': destiny_column.name,
                                'reference_entity': reference_table.name,
                                'reference_column': ref_pk.name
                            })
                    else:
                        print(f"      ⚠️ Não foi possível determinar tabela referenciada")
        
        print(f"\n  FKs finais detectadas: {len(fk_mappings)} tabela(s)")
        return fk_mappings

    def _register_primary_keys(self, mapped_rows_by_table: Dict[str, List[Dict]], raw_mappings):
        """
        Registra PKs E natural keys no contexto de migração.
        Agora usa is_natural_key da coluna de origem.
        """
        print("\n🔑 REGISTRANDO CHAVES PRIMÁRIAS E NATURAIS:")
        
        # Primeiro, cria um mapa de colunas naturais por tabela de destino
        natural_keys_map = {}  # {destiny_table_id: {destiny_column_name: origin_column}}
        
        for mapping in raw_mappings:
            for mapping_column in mapping.columns:
                # Verifica se a coluna de ORIGEM está marcada como natural_key
                if mapping_column.origin_column.is_natural_key:
                    destiny_table_id = mapping_column.destiny_table_id
                    destiny_column_name = mapping_column.destiny_column.name
                    
                    if destiny_table_id not in natural_keys_map:
                        natural_keys_map[destiny_table_id] = {}
                    
                    natural_keys_map[destiny_table_id][destiny_column_name] = mapping_column.origin_column
                    
                    print(f"  🔍 Natural Key detectada:")
                    print(f"     {mapping_column.origin_table.name}.{mapping_column.origin_column.name} (origem)")
                    print(f"     → {mapping_column.destiny_table.name}.{destiny_column_name} (destino)")
        
        # Agora registra as chaves
        for destiny_table_id, rows in mapped_rows_by_table.items():
            if not rows:
                continue
                
            table = self.table_config.get_by_id(int(destiny_table_id))
            pk_column = self._get_pk_column(table)
            
            print(f"\n  Tabela: {table.name} (PK={pk_column})")
            
            if not pk_column:
                print(f"  ⚠️ Sem PK definida!")
                continue
            
            # Pega as colunas naturais desta tabela
            natural_keys_columns = natural_keys_map.get(destiny_table_id, {})
            
            # Registra cada linha
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
                
                # 2. Registra pelas Natural Keys configuradas
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
            print(f"  ✅ Total: {len(rows)} registros ({total_natural_keys} natural key(s) configurada(s))")
    
    def _resolve_foreign_keys(self, mapped_rows_by_table: Dict[str, List[Dict]], 
                        fk_mappings: Dict[int, List[Dict]],
                        raw_mappings):
        """
        Resolve FKs usando os mapeamentos de mapping_columns.
        """
        resolver = NaturalKeyResolver(self.context)
        
        for destiny_table_id, rows in mapped_rows_by_table.items():
            if not rows:
                continue
            
            # Verifica se esta tabela tem FKs mapeadas
            table_fks = fk_mappings.get(destiny_table_id, [])
            if not table_fks:
                continue
            
            table = self.table_config.get_by_id(int(destiny_table_id))
            
            # Resolve cada FK
            for fk_config in table_fks:
                source_column = fk_config['source_column']
                target_column = fk_config['target_column']
                reference_entity = fk_config['reference_entity']
                reference_column = fk_config['reference_column']
                
                # VERIFICAÇÃO: A coluna de origem existe nos dados?
                if not rows or source_column not in rows[0]:
                    print(f"⚠️ Coluna {source_column} não encontrada em {table.name}")
                    print(f"   Colunas disponíveis: {list(rows[0].keys()) if rows else []}")
                    continue
                
                print(f"🔄 Resolvendo FK: {table.name}.{source_column} -> {reference_entity}.{reference_column}")
                
                if rows:
                    sample_value = rows[0].get(source_column)
                    print(f"  🔍 Valor original na FK: '{sample_value}'")
                
                # ✨ DESCOBRE qual coluna da tabela referenciada tem transformações que batem
                transformations_to_apply = None
                reference_table_id = None
                actual_reference_column = None
                
                # Encontra a tabela referenciada
                for dest_table_id, _ in mapped_rows_by_table.items():
                    temp_table = self.table_config.get_by_id(int(dest_table_id))
                    if temp_table.name == reference_entity:
                        reference_table_id = dest_table_id
                        break
                
                if reference_table_id:
                    # ✨ PROCURA em TODAS as colunas da tabela referenciada por transformações
                    print(f"  🔍 Procurando transformações em colunas de {reference_entity}")
                    
                    for mapping in raw_mappings:
                        for mapping_column in mapping.columns:
                            if mapping_column.destiny_table_id == reference_table_id:
                                if mapping_column.transformations:
                                    # Encontrou transformações nesta coluna!
                                    transformations_to_apply = mapping_column.transformations
                                    actual_reference_column = mapping_column.destiny_column.name
                                    print(f"  ✅ Encontradas {len(transformations_to_apply)} transformação(ões) em {reference_entity}.{actual_reference_column}")
                                    break
                        if transformations_to_apply:
                            break
                
                # ✨ APLICA AS TRANSFORMAÇÕES encontradas
                if transformations_to_apply:
                    print(f"  ⚡ Aplicando transformações da coluna {reference_entity}.{actual_reference_column} nos valores de FK")
                    
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
                    print(f"  ℹ️ Nenhuma transformação encontrada na tabela {reference_entity}")
                
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
            print("Nenhuma transformação configurada.")
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

    def _get_status_message(self, status: str, validation_result) -> str:
        """Gera mensagem descritiva baseada no status"""
        messages = {
            "success": "Migração executada com sucesso!",
            "completed_with_errors": f"Migração concluída com {len(validation_result.errors)} erro(s). Algumas linhas foram puladas.",
            "validation_passed": "Validação concluída: todos os dados são válidos.",
            "validation_failed": f"Validação falhou: {len(validation_result.errors)} erro(s) encontrado(s).",
            "aborted": "Migração abortada devido a erro na validação.",
            "error": "Erro durante a migração."
        }
        return messages.get(status, "Status desconhecido")
    
    def get_by_migration_project(
        self, 
        migration_project_id: int,
        allow_duplicates: bool = False,
        duplicate_strategy: str = 'first'
    ):
        """
        Args:
            migration_project_id: ID do projeto de migração
            allow_duplicates: Se True, permite chaves naturais duplicadas
            duplicate_strategy: Estratégia para resolver duplicatas ('first', 'last')
        """
        # Cria o contexto com as configurações
        error_strategy_value = self.setting_repo.get_effective_value(
            key='error_strategy',
            owner_type='global'
        )
        error_strategy = ErrorStrategy(error_strategy_value or 'abort_on_first')

        self.context = MigrationContext(
            allow_duplicates=allow_duplicates,
            duplicate_strategy=duplicate_strategy
        )
        
        # 1️⃣ Buscar projeto + mappings
        migration_project = self.repo.get_by_migration_project_id(migration_project_id)
        migration_helpers = MigrationHelpers()
        raw_mappings = migration_project.mappings

        # 2️⃣ Extrair configurações de FK de mapping_columns
        fk_mappings = self._extract_fk_mappings(raw_mappings)
        
        print("🔍 FKs detectadas:")
        if fk_mappings:
            for table_id, fks in fk_mappings.items():
                table = self.table_config.get_by_id(int(table_id))
                print(f"  {table.name} (ID={table_id}): {len(fks)} FK(s)")
                for fk in fks:
                    print(f"    - {fk['source_column']} -> {fk['target_column']} (ref: {fk['reference_entity']})")
        else:
            print("  Nenhuma FK detectada!")

        # 3️⃣ Pipeline de normalização e carregamento
        normalized = migration_helpers.normalize_mappings(raw_mappings)
        migration_plan = migration_helpers.build_migration_plan(normalized)
        mapped_rows_by_table = migration_helpers.load_csv_data(migration_plan)

        # ✨ MOVER PARA AQUI - ANTES de registrar PKs
        print("\n📋 Dados carregados (ANTES de aplicar transformações):")
        for table_id, rows in mapped_rows_by_table.items():
            table = self.table_config.get_by_id(int(table_id))
            if rows:
                print(f"  {table.name} (ID={table_id}): {len(rows)} linhas")
            else:
                print(f"  {table.name} (ID={table_id}): vazio")

        # ✨ APLICAR TRANSFORMAÇÕES ANTES DE REGISTRAR PKs
        self._apply_transformations(mapped_rows_by_table, raw_mappings)

        validation_result, filtered_rows = self._validate_and_filter(
            mapped_rows_by_table=mapped_rows_by_table,
            fk_mappings=fk_mappings,
            raw_mappings=raw_mappings,
            error_strategy=error_strategy,
        )

        if error_strategy == ErrorStrategy.ABORT_ON_FIRST and validation_result.has_errors:
            print("\n❌ MIGRAÇÃO ABORTADA (estratégia: abort_on_first)")
            return {
                "status": "aborted",
                "message": "Migração abortada: erro encontrado na validação",
                "migration_project_id": migration_project_id,
                "error_strategy": error_strategy.value,
                "validation": validation_result.to_dict(),
                "sql_file": None
            }


        # 4️⃣ Registrar PKs de TODAS as tabelas (AGORA com valores já transformados)
        try:
            self._register_primary_keys(filtered_rows, raw_mappings)
        except ValueError as e:
            # Duplicata detectada em modo estrito
            print(f"\n❌ ERRO: {e}")
            print("\n💡 Dica: Use 'allow_duplicates=True' para permitir duplicatas")
            
            return {
                "status": "error",
                "message": str(e),
                "migration_project_id": migration_project_id,
                "validation": validation_result.to_dict(),
                "sql_file": None
            }

        # 5️⃣ Verificar se houve duplicatas
        if self.context.has_duplicates():
            self.context.print_duplicate_report()

        # 6️⃣ Resolver FKs usando os mapeamentos explícitos
        self._resolve_foreign_keys(filtered_rows, fk_mappings, raw_mappings)

        # 7️⃣ Gerar SQL
        sql_file = None

        if error_strategy != ErrorStrategy.VALIDATE_ALL:
            sql_builder = MigrationSQLBuilder()
            file_builder = MigrationSQLFileBuilder("/app/sql_output")
            sql_blocks = []
            
            for destiny_table_id, rows in filtered_rows.items():
                table = self.table_config.get_by_id(int(destiny_table_id))
                sql = sql_builder.build_insert_sql(
                    table_name=table.name,
                    rows=rows
                )
                if sql:
                    sql_blocks.append(sql)
            
            # Escrever arquivo
            sql_file = file_builder.write(
                migration_project_name=migration_project.name,
                sql_blocks=sql_blocks
            )
            
            print(f"\n📄 SQL gerado: {sql_file}")
        else:
            print(f"\n📄 SQL NÃO gerado (estratégia: validate_all - modo validação)")

        # 9️⃣ Estatísticas
        stats = self.context.get_stats()

        if error_strategy == ErrorStrategy.VALIDATE_ALL:
            if validation_result.has_errors:
                status = "validation_failed"
            else:
                status = "validation_passed"
        else:
            if validation_result.has_errors:
                status = "completed_with_errors"
            else:
                status = "success"

        return {
            "status": status,
            "message": self._get_status_message(status, validation_result),
            "migration_project_id": migration_project_id,
            "error_strategy": error_strategy.value,
            "sql_file": str(sql_file) if sql_file else None,
            "validation": validation_result.to_dict(),
            "duplicate_warnings": len(self.context.get_duplicate_warnings()),
            "stats": stats
        }
    
    