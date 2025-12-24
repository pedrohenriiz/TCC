from sqlalchemy.orm import Session
from domain.repositories.table_config_repository import TableConfigRepository
from interfaces.schemas.table_config_schema import TableConfigCreate

class TableConfigService:
    def __init__(self, db: Session):
        self.repo = TableConfigRepository(db)

    def create_table(self, data: TableConfigCreate):
        return self.repo.create(data)
    
    def list_tables(self, with_columns: bool = False):
        return self.repo.list_tables(with_columns)
    
    def delete_tables(self, table_id: int) -> bool:
        return self.repo.delete_tables(table_id)
    
    def show_table(self, table_id: int):
        return self.repo.get_by_id(table_id)
    
    def update_table(self, table_id: int, data):
        return self.repo.update_table(table_id, data)
