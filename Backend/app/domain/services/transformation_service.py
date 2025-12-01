from sqlalchemy.orm import Session
from interfaces.schemas.transformation_schema import TransformationBaseCreate, TransformationBaseUpdate
from domain.repositories.transformation_repository import TransformationRepository

class TransformationService:
    def __init__(self, db: Session):
        self.repo = TransformationRepository(db)

    def create(self, data: TransformationBaseCreate) -> TransformationBaseCreate:
        return self.repo.create_transformation(data)
    
    def list(self):
        return self.repo.list_transformations()
    
    def delete(self, transformation_id: int) -> bool:
        return self.repo.delete_transformation(transformation_id)
    
    def get_by_id(self, transformation_id: int):
        return self.repo.get_by_id(transformation_id)
    
    def update(self, transformation_id: int, data: TransformationBaseUpdate):
        print("Estou aqui")
        return self.repo.update_transformation(transformation_id, data)