from sqlalchemy.orm import Session
from domain.repositories.migration_project_repository import MigrationProjectRepository
from interfaces.schemas.migration_project_schema import MigrationProjectCreate

class MigrationProjectService:
    def __init__(self, db: Session):
        self.repo = MigrationProjectRepository(db)

    def create_migration_project(self, data: MigrationProjectCreate):
        return self.repo.create(data)
    
    def list_migration_project(self):
        return self.repo.list_migration_projects()
    
    def delete_migration_project(self, table_id: int) -> bool:
        return self.repo.delete_migration_project(table_id)
    
    def show_migration_project(self, table_id: int):
        return self.repo.get_by_id(table_id)
    
    def update_migration_project(self, table_id: int, data):
        return self.repo.update_migration_project(table_id, data)