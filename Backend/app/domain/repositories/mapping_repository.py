from sqlalchemy.orm import Session, joinedload, selectinload
from domain.entities.mapping import Mapping, MappingColumn, MappingTransformationParamValue, MappingTransformation
from interfaces.schemas.mapping_schema import MappingCreate, MappingUpdate
from domain.entities.migration_project import MigrationProject

class MappingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, request: MappingCreate):
        mapping = Mapping(
            name=request.name, 
            migration_project_id=request.migration_project_id, 
            status=request.status
        )

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

    def list(self, migration_project_id: int):
        query = self.db.query(Mapping).filter(Mapping.migration_project_id == migration_project_id)

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

        # Atualiza campos simples
        for field in ["name", "status"]:
            if field in update_data:
                setattr(mapping, field, update_data[field])

        # -----------------------------------------------
        # ATUALIZAÇÃO DOS MAPPING COLUMNS
        # -----------------------------------------------
        if "columns" in update_data:

            payload_columns = update_data["columns"]  # <<< vem como LISTA DE DICTS

            # IDs enviados no payload
            payload_ids = {
                col.get("id") for col in payload_columns if col.get("id") is not None
            }

            # IDs existentes no banco
            existing_ids = {col.id for col in mapping.columns}

            # 1. REMOVER os que NÃO vieram no payload
            to_delete_ids = existing_ids - payload_ids

            for col in mapping.columns:
                if col.id in to_delete_ids:
                    self.db.delete(col)

            # 2. ATUALIZAR os que vieram COM ID
            for col_data in payload_columns:
                if col_data.get("id"):
                    db_col = next((c for c in mapping.columns if c.id == col_data["id"]), None)
                    if db_col:
                        db_col.origin_table_id = col_data["origin_table_id"]
                        db_col.origin_column_id = col_data["origin_column_id"]
                        db_col.destiny_table_id = col_data["destiny_table_id"]
                        db_col.destiny_column_id = col_data["destiny_column_id"]

            # 3. CRIAR os que NÃO têm ID
            for col_data in payload_columns:
                if not col_data.get("id"):
                    new_col = MappingColumn(
                        mapping_id=mapping.id,
                        origin_table_id=col_data["origin_table_id"],
                        origin_column_id=col_data["origin_column_id"],
                        destiny_table_id=col_data["destiny_table_id"],
                        destiny_column_id=col_data["destiny_column_id"],
                    )
                    self.db.add(new_col)

        # -----------------------------------------------
        # COMMIT FINAL
        # -----------------------------------------------
        self.db.commit()
        self.db.refresh(mapping)

        return mapping
    
    def get_by_migration_project_id(self, migration_project_id: int):
        query = (
            self.db.query(MigrationProject)
            .options(joinedload(MigrationProject.mappings))
            .filter(MigrationProject.id == migration_project_id)
            .one()
        )

        return query
    
