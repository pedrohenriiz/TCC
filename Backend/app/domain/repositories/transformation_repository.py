from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select
from domain.entities.transformation import TransformationType, TransformationSchemaDefinition
from interfaces.schemas.transformation_schema import TransformationBaseCreate, TransformationBaseUpdate
from datetime import datetime

class TransformationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_transformation(self, data: TransformationBaseCreate) -> TransformationType:
        data_dict = data.model_dump()

        schema_list = data_dict.pop("schema_definitions", [])

        print(schema_list)

        transformation = TransformationType(**data_dict)

        self.db.add(transformation)
        self.db.flush()

        if (data.schema_definitions):
            for schema in schema_list:
                new_schema = TransformationSchemaDefinition(transformation_type_id= transformation.id, **schema)
                
                self.db.add(new_schema)
        
        self.db.commit()
        self.db.refresh(transformation)

        result = self.db.execute(
            select(TransformationType)
            .options(selectinload(TransformationType.schema_definitions))
            .where(TransformationType.id == transformation.id)
        )

        return result.scalar_one()
    
    def list_transformations(self):
        query = self.db.query(
            TransformationType
        ).options(
            joinedload(TransformationType.schema_definitions)
        )

        data = query.all()

        return data
    
    def update_transformation(self, transformation_type_id: int, data):
        """Atualiza um tipo de transformação, incluindo definições de schema relacionadas."""
        transformation_type = self._get_transformation_type_by_id(transformation_type_id)

        if not transformation_type:
            return None

        update_data = data.dict(exclude_unset=True)

        # Atualiza dados básicos
        self._update_transformation_type_fields(transformation_type, update_data)

        # Atualiza as definições de schema relacionadas
        if "schema_definitions" in update_data:
            self._update_schema_definitions(transformation_type_id, update_data["schema_definitions"])

        # Persiste as alterações
        self.db.commit()
        
        # Recarrega o objeto do banco com os relacionamentos
        transformation_type = self.db.query(TransformationType).options(
            joinedload(TransformationType.schema_definitions)
        ).filter(TransformationType.id == transformation_type_id).first()
        
        return transformation_type

    def _get_transformation_type_by_id(self, transformation_type_id: int):
        return self.db.query(TransformationType).filter(
            TransformationType.id == transformation_type_id
        ).first()

    def _update_transformation_type_fields(self, transformation_type, update_data: dict):
        """Atualiza campos simples do tipo de transformação."""
        for field in ["code", "name", "description"]:
            if field in update_data:
                setattr(transformation_type, field, update_data[field])

    def _update_schema_definitions(self, transformation_type_id, definitions_data: list):
        """Atualiza, cria ou remove definições de schema."""
        
        # IDs enviados na requisição
        incoming_ids = {d.get("id") for d in definitions_data if d.get("id") is not None}
        
        # 1. SOFT DELETE nos schemas que não vieram na requisição
        existing_definitions = self.db.query(TransformationSchemaDefinition).filter(
            TransformationSchemaDefinition.transformation_type_id == transformation_type_id,
            TransformationSchemaDefinition.deleted_at.is_(None)  # Apenas os não deletados
        ).all()
        
        for definition in existing_definitions:
            if definition.id not in incoming_ids:
                # Soft delete ao invés de hard delete
                definition.deleted_at = datetime.utcnow()
        
        # Força o flush para executar os updates antes de continuar
        self.db.flush()
        
        # 2. ATUALIZAR ou CRIAR
        for definition_data in definitions_data:
            if "id" in definition_data and definition_data["id"] is not None:
                # ATUALIZAR existente
                definition = self.db.query(TransformationSchemaDefinition).filter(
                    TransformationSchemaDefinition.id == definition_data["id"],
                    TransformationSchemaDefinition.deleted_at.is_(None)
                ).first()
                
                if definition:
                    self._update_schema_definition_fields(definition, definition_data)
            else:
                # CRIAR novo
                new_definition = self._create_schema_definition(definition_data, transformation_type_id)
                self.db.add(new_definition)

    def _update_schema_definition_fields(self, definition, definition_data: dict):
        """Atualiza os campos de uma definição de schema existente."""
        for field in ["param_key", "param_label", "param_type", "required", "param_order"]:
            if field in definition_data:
                setattr(definition, field, definition_data[field])

    def _create_schema_definition(self, definition_data: dict, transformation_type_id: int):
        """Cria uma nova definição de schema."""
        return TransformationSchemaDefinition(
            transformation_type_id=transformation_type_id,
            param_key=definition_data["param_key"],
            param_label=definition_data["param_label"],
            param_type=definition_data["param_type"],
            required=definition_data.get("required", False),
            param_order=definition_data["param_order"]
        )

    def _update_schema_definition_fields(self, definition, definition_data: dict):
        """Atualiza os campos de uma definição de schema existente."""
        for field in ["param_key", "param_label", "param_type", "required", "param_order"]:
            if field in definition_data:
                setattr(definition, field, definition_data[field])

    def get_by_id(self, id:int):
        transformation = self.db.query(
            TransformationType
        ).options(
            joinedload(TransformationType.schema_definitions)
        ).filter(TransformationType.id == id).first()

        return transformation
    
    def delete_transformation(self, id: int):
        transformation = self.db.query(TransformationType).filter(TransformationType.id == id).first()

        if not transformation:
            return False
        
        self.db.delete(transformation)
        self.db.commit()

        return True