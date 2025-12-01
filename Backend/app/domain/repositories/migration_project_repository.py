from sqlalchemy.orm import Session, joinedload, selectinload
from domain.entities.migration_project import MigrationProject, MigrationProjectOriginTable, MigrationProjectOriginTableColumn
from interfaces.schemas.migration_project_schema import MigrationProjectCreate

class MigrationProjectRepository:
    def __init__(self, db: Session):
        self.db = db    
    
    def create(self, data: MigrationProjectCreate) -> MigrationProject:
        """Cria um novo projeto de migração com suas tabelas e colunas."""
        project = MigrationProject(
            name=data.name,
            description=data.description
        )

        # Cria tabelas de origem, se existirem
        if data.origin_tables:
            project.origin_tables = [
                self._create_origin_table(table_data)
                for table_data in data.origin_tables
            ]

        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def _create_origin_table(self, table_data):
        """Cria uma tabela de origem e suas colunas."""
        table = MigrationProjectOriginTable(name=table_data.name)

        if table_data.columns:
            table.columns = [
                self._create_column(column_data)
                for column_data in table_data.columns
            ]

        return table

    def _create_column(self, column_data):
        """Cria uma coluna de tabela."""
        return MigrationProjectOriginTableColumn(
            name=column_data.name,
            type=column_data.type,
            is_pk=column_data.is_pk or False,
        )
    
    def list_migration_projects(self):
        """Lista todos os projetos com tabelas e colunas relacionadas."""

        # Faz eager load das tabelas e colunas
        query = (
            self.db.query(MigrationProject)
            .options(
                joinedload(MigrationProject.origin_tables)
                .joinedload(MigrationProjectOriginTable.columns)  # carrega colunas dentro das tabelas
            )
            .order_by(MigrationProject.created_at)
        )

        projects = query.all()

        # Converte para dicionário estruturado
        data = []
        for project in projects:
            data.append({
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "origin_tables": [
                    {
                        "id": table.id,
                        "name": table.name,
                        "created_at": table.created_at,
                        "updated_at": table.updated_at,
                        "columns": [
                            {
                                "id": column.id,
                                "name": column.name,
                                "type": column.type,
                                "is_pk": column.is_pk,
                                "created_at": column.created_at,
                                "updated_at": column.updated_at,
                            }
                            for column in table.columns
                        ],
                    }
                    for table in project.origin_tables
                ],
            })

        return data

    def update_migration_project(self, migration_project_id: int, data):
        """Atualiza um projeto de migração, incluindo tabelas e colunas relacionadas."""
        project = self._get_project_by_id(migration_project_id)
        if not project:
            return None

        update_data = data.dict(exclude_unset=True)

        # Atualiza dados básicos
        self._update_project_fields(project, update_data)

        # Atualiza as tabelas e colunas relacionadas
        if "origin_tables" in update_data:
            self._update_origin_tables(project, update_data["origin_tables"])

        # Persiste as alterações
        self.db.commit()
        self.db.refresh(project)
        return project

    def _get_project_by_id(self, project_id: int):
        return self.db.query(MigrationProject).filter(MigrationProject.id == project_id).first()

    def _update_project_fields(self, project, update_data: dict):
        """Atualiza campos simples do projeto."""
        for field in ["name", "description"]:
            if field in update_data:
                setattr(project, field, update_data[field])

    def _update_origin_tables(self, project, tables_data: list):
        """Atualiza ou cria tabelas de origem dentro do projeto."""
        for table_data in tables_data:
            table = None

            # Verifica se é uma tabela existente
            if "id" in table_data:
                table = next((t for t in project.origin_tables if t.id == table_data["id"]), None)

            if table:
                self._update_origin_table_fields(table, table_data)
            else:
                # Cria uma nova tabela
                new_table = self._create_origin_table(table_data)
                project.origin_tables.append(new_table)

    def _update_origin_table_fields(self, table, table_data: dict):
        """Atualiza nome e colunas de uma tabela existente."""
        if "name" in table_data:
            table.name = table_data["name"]

        if "columns" in table_data:
            self._update_columns(table, table_data["columns"])

    # def _create_origin_table(self, table_data: dict):
    #     """Cria uma nova tabela de origem com colunas."""
    #     printf(table_data)
    #     new_table = MigrationProjectOriginTable(name=table_data)
    #     if "columns" in table_data:
    #         for col_data in table_data["columns"]:
    #             new_table.columns.append(self._create_column(col_data))
    #     return new_table

    def _update_columns(self, table, columns_data: list):
        """Atualiza ou cria colunas dentro de uma tabela."""
        for col_data in columns_data:
            column = None

            if "id" in col_data:
                column = next((c for c in table.columns if c.id == col_data["id"]), None)

            if column:
                self._update_column_fields(column, col_data)
            else:
                table.columns.append(self._create_column(col_data))

    def _update_column_fields(self, column, col_data: dict):
        """Atualiza os campos de uma coluna existente."""
        for field in ["name", "type", "is_pk"]:
            if field in col_data:
                setattr(column, field, col_data[field])
    
    def get_by_id(self, migration_project_id: int) -> MigrationProject:
        return (
            self.db.query(MigrationProject)
            .options(
                selectinload(MigrationProject.origin_tables)
                .selectinload(MigrationProjectOriginTable.columns)
            )
            .filter(MigrationProject.id == migration_project_id)
            .first()
        )

    def delete_migration_project(self, migration_project_id: int):
        migration_project = self.db.query(MigrationProject).filter(MigrationProject.id == migration_project_id).first()

        if not migration_project:
            return False
        
        self.db.delete(migration_project)
        self.db.commit()

        return True