from sqlalchemy.orm import Session
from domain.repositories.migration_project_origin_table_repository import MigrationProjectOriginTableRepository
# Fazer o schema

class MigrationProjectOriginTableService:
    def __init__(self, db: Session):
        self.repo = MigrationProjectOriginTableRepository(db)
    
    def create_migration_project_origin_table(self, migration_project_id: int, data):
        print("no service")
        print(migration_project_id)
        print(data)
        return self.repo.create(migration_project_id, data)
    
    def delete_migration_project_origin_table(self, migration_project_id: int, id: int):
        return self.repo.delete(migration_project_id, id)
    
    def update_migration_project_origin_table(self, migration_project_id: int, id: int, data):
        return self.repo.update(migration_project_id, table_id=id, data=data)
    
    def show_migration_project_origin_table(self, migration_project_id: int, id: int):
        return self.repo.show(migration_project_id, id)