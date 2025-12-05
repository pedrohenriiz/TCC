from sqlalchemy.orm import Session
from domain.repositories.mapping_repository import MappingRepository
from interfaces.schemas.mapping_schema import MappingCreate, MappingUpdate

class MappingService:
    def __init__(self, db: Session):
        self.repo = MappingRepository(db)

    def create_mapping(self, request: MappingCreate):
        return self.repo.create(request)
    
    def list_mapping(self):
        return self.repo.list()
    
    def delete_mapping(self, mapping_id: int)-> bool:
        return self.repo.delete(mapping_id)
    
    def show_mapping(self, mapping_id: int):
        return self.repo.get_by_id(mapping_id)
    
    def update_mapping(self, mapping_id: int, data: MappingUpdate):
        return self.repo.update(mapping_id, data)