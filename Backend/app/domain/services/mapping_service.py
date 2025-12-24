from sqlalchemy.orm import Session
from domain.repositories.mapping_repository import MappingRepository
from interfaces.schemas.mapping_schema import MappingCreate, MappingUpdate
from application.migration_helpers import MigrationHelpers
from application.migration_sql_builder import MigrationSQLBuilder
from application.migration_sql_file_builder import MigrationSQLFileBuilder
from domain.repositories.table_config_repository import TableConfigRepository
from application.migration_context import MigrationContext
from application.natural_key_resolver import NaturalKeyResolver
from typing import Dict, List, Any, Optional

class MappingService:
    def __init__(self, db: Session):
        self.repo = MappingRepository(db)
        self.table_config = TableConfigRepository(db)
        self.context = MigrationContext()
        
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
    
    def _register_primary_keys(self, mapped_rows_by_table: Dict[str, List[Dict]]):
        """
        Registra PKs E natural keys no contexto de migração.
        """
        print("\n🔑 REGISTRANDO CHAVES PRIMÁRIAS E NATURAIS:")
        
        for destiny_table_id, rows in mapped_rows_by_table.items():
            if not rows:
                continue
                
            table = self.table_config.get_by_id(int(destiny_table_id))
            pk_column = self._get_pk_column(table)
            
            print(f"\n  Tabela: {table.name} (PK={pk_column})")
            
            if not pk_column:
                print(f"  ⚠️ Sem PK definida!")
                continue
            
            # Registra cada linha
            for row in rows:
                if pk_column not in row:
                    continue
                    
                pk_value = row[pk_column]
                
                # Registra pela PK
                self.context.register(
                    entity=table.name,
                    natural_key=str(pk_value),
                    destination_id=int(pk_value)
                )
                print(f"    📝 {table.name}['{pk_value}'] = {pk_value}")
                
                # Registra por TODAS as outras colunas (natural keys)
                for col_name, col_value in row.items():
                    if col_name == pk_column or not col_value:
                        continue
                    
                    # Registra string values como natural keys
                    if isinstance(col_value, str) and not col_value.isdigit():
                        self.context.register(
                            entity=table.name,
                            natural_key=str(col_value),
                            destination_id=int(pk_value)
                        )
                        print(f"    📝 {table.name}['{col_value}'] = {pk_value}")
                        
            print(f"  ✅ Total: {len(rows)} registros")
    
    def _resolve_foreign_keys(self, mapped_rows_by_table: Dict[str, List[Dict]], 
                             fk_mappings: Dict[int, List[Dict]]):
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
                
                # VERIFICAÇÃO: A coluna de origem existe nos dados?
                if not rows or source_column not in rows[0]:
                    print(f"⚠️ Coluna {source_column} não encontrada em {table.name}")
                    print(f"   Colunas disponíveis: {list(rows[0].keys()) if rows else []}")
                    print(f"   Isso acontece porque {source_column} foi mapeada para outra tabela")
                    continue
                
                print(f"🔄 Resolvendo FK: {table.name}.{source_column} -> {reference_entity}.{target_column}")
                
                # DEBUG: Mostra o que está tentando resolver
                if rows:
                    sample_value = rows[0].get(source_column)
                    print(f"  🔍 Exemplo de valor a resolver: '{sample_value}'")
                
                try:
                    # Usa o resolve_rows que já existe
                    mapped_rows_by_table[destiny_table_id] = resolver.resolve_rows(
                        rows=mapped_rows_by_table[destiny_table_id],
                        source_column=source_column,
                        target_column=target_column,
                        entity=reference_entity
                    )
                    
                    print(f"✅ FK resolvida: {table.name}.{target_column} (substituiu {source_column})")
                except ValueError as e:
                    print(f"❌ Erro ao resolver FK: {e}")
                    continue
    
    def get_by_migration_project(self, migration_project_id: int):
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
        
        print("\n📋 Dados carregados (ANTES de resolver FKs):")
        for table_id, rows in mapped_rows_by_table.items():
            table = self.table_config.get_by_id(int(table_id))
            if rows:
                print(f"  {table.name} (ID={table_id}): {len(rows)} linhas")
                print(f"    Colunas: {list(rows[0].keys())}")
                print(f"    Primeira linha: {rows[0]}")
            else:
                print(f"  {table.name} (ID={table_id}): vazio")

        # 4️⃣ Registrar PKs de TODAS as tabelas primeiro
        print("🟢 VAI CHAMAR _register_primary_keys")
        self._register_primary_keys(mapped_rows_by_table)
        print("🟢 TERMINOU _register_primary_keys")

        # 5️⃣ Resolver FKs usando os mapeamentos explícitos
        self._resolve_foreign_keys(mapped_rows_by_table, fk_mappings)

        # 6️⃣ Gerar SQL
        sql_builder = MigrationSQLBuilder()
        file_builder = MigrationSQLFileBuilder("/app/sql_output")
        sql_blocks = []

        for destiny_table_id, rows in mapped_rows_by_table.items():
            table = self.table_config.get_by_id(int(destiny_table_id))
            sql = sql_builder.build_insert_sql(
                table_name=table.name,
                rows=rows
            )
            if sql:
                sql_blocks.append(sql)

        # 7️⃣ Escrever arquivo
        file_path = file_builder.write(
            migration_project_name=migration_project.name,
            sql_blocks=sql_blocks
        )

        return {
            "migration_project_id": migration_project_id,
            "sql_file": str(file_path),
            "tables": list(mapped_rows_by_table.keys()),
            "total_tables": len(mapped_rows_by_table),
        }