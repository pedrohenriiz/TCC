from sqlalchemy.orm import Session, joinedload, selectinload
from domain.entities.mapping import Mapping, MappingColumn, MappingTransformationParamValue, MappingTransformation
from interfaces.schemas.mapping_schema import MappingCreate, MappingUpdate

class MappingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, request: MappingCreate):
        mapping = Mapping(name=request.name)

        if request.columns:
            mapping.columns = [
                self._create_mapping_columns(columns_data)
                for columns_data in request.columns
            ]

        self.db.add(mapping)
        self.db.commit()
        self.db.refresh(mapping)
        return mapping
    
    def _create_mapping_columns(self, data):
        mapping_column = MappingColumn(
            origin_table_id=data.origin_table_id,
            origin_column_id=data.origin_column_id,
            destiny_table_id=data.destiny_table_id,
            destiny_column_id=data.destiny_column_id
        )

        return mapping_column

    def list(self):
        query = self.db.query(Mapping)

        data = query.all()

        return data

    def delete(self, mapping_id: int) -> bool:
        mapping = self.get_by_id(mapping_id)

        if not mapping:
            return False
        
        self.db.delete(mapping)
        self.db.commit()

        return True
    
    def get_by_id(self, mapping_id: int):
        query = self.db.query(Mapping).filter(Mapping.id == mapping_id).first()

        return query

    def update(self, mapping_id: int, data: MappingUpdate):
        mapping = self.get_by_id(mapping_id)

        if not mapping:
            return None
        
        update_data = data.dict(exclude_unset=True)

        for field in ["name"]:
            if field in update_data:
                setattr(mapping, field, update_data[field])

        self.db.commit()
        self.db.refresh(mapping)

        return mapping
