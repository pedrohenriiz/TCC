from sqlalchemy.orm import Session, selectinload
from domain.entities.migration_project import MigrationProject, MigrationProjectOriginTable, MigrationProjectOriginTableColumn

class MigrationProjectOriginTableRepository:
    def __init__(self, db:Session):
        self.db = db

    def _create_column(self, column_data):
        """Cria uma coluna de tabela."""
        return MigrationProjectOriginTableColumn(
            name=column_data.name,
            type=column_data.type,
            is_pk=column_data.is_pk or False,
        )

    # Ajustar todos os campos futuramente
    def create(self,migration_project_id, data)-> MigrationProjectOriginTable:
        origin_table = MigrationProjectOriginTable(name=data.name, migration_project_id=migration_project_id)

        print(origin_table)

        if data.columns:
            origin_table.columns = [
                self._create_column(column_data)
                for column_data in data.columns
            ]

        self.db.add(origin_table)
        self.db.commit()
        self.db.refresh(origin_table)

        return origin_table
    
    def _get_project_by_id(self, project_id: int):
        return self.db.query(MigrationProject).filter(MigrationProject.id == project_id).first()
    
    def _get_origin_table_by_id(self, migration_project_id: int, id: int):
        return self.db.query(MigrationProjectOriginTable).filter((MigrationProjectOriginTable.id == id) & (MigrationProjectOriginTable.migration_project_id == migration_project_id)).first()
    
    def get(self, migration_project_id: int, table_id: int):
        return (
            self.db.query(MigrationProjectOriginTable)
            .filter(
                MigrationProjectOriginTable.id == table_id,
                MigrationProjectOriginTable.migration_project_id == migration_project_id
            ).options(selectinload(MigrationProjectOriginTable.columns))
            .first()
        )
    
    def show(self, migration_project_id: int, table_id: int):
        table = self.get(migration_project_id, table_id)
        return table 

    def update(self, migration_project_id: int, table_id: int, data):
    # Busca o projeto
        migration_project = self._get_project_by_id(migration_project_id)
        if not migration_project:
            return None

        # Busca a tabela dentro do projeto
        table = self._get_origin_table_by_id(migration_project_id, table_id)
        if not table:
            return None

        # Dados enviados no body
        # --- Atualiza apenas campos simples da tabela ---
        if data.name is not None:
            table.name = data.name

        # --- Atualiza colunas ---
        if data.columns is not None:
            self._update_columns(table, data.columns)

        self.db.commit()
        self.db.refresh(table)

        return table
    
    def _update_columns(self, table, incoming_columns: list):
        existing_columns = {col.id: col for col in table.columns}

        incoming_ids = {col.id for col in incoming_columns if col.id is not None}

        # Remover colunas que sumiram
        for col_id, col in list(existing_columns.items()):
            if col_id not in incoming_ids:
                self.db.delete(col)

        # Criar ou atualizar
        for col_data in incoming_columns:
            if col_data.id is None:
                # Criar nova
                new_col = MigrationProjectOriginTableColumn(
                    origin_table_id=table.id,
                    name=col_data.name,
                    type=col_data.type,
                    is_pk=col_data.is_pk,
                )
                self.db.add(new_col)

            else:
                # Atualizar existente
                col = existing_columns[col_data.id]

                col.name = col_data.name
                col.type = col_data.type
                col.is_pk = col_data.is_pk
        
    def delete(self, migration_project_id: int, id: int):
        print("migration_project_id", migration_project_id)
        print("id", id)

        migration_project_origin_table = self.db.query(MigrationProjectOriginTable).filter(MigrationProjectOriginTable.migration_project_id == migration_project_id and MigrationProjectOriginTable.id == id).first()
        
        if not migration_project_origin_table:
            return False
        
        self.db.delete(migration_project_origin_table)
        self.db.commit()

        return True


