from sqlalchemy.orm import Session, joinedload, selectinload
from domain.entities.mapping import Mapping, MappingColumn, MappingTransformationParamValue, MappingTransformation
from domain.entities.migration_project import MigrationProjectOriginTableColumn, MigrationProjectOriginTable
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
        
        # ✨ Recarrega com relacionamentos
        return self.get_by_id(mapping.id)
    
    def _create_mapping_columns(self, data):
        """Cria uma coluna de mapeamento com suas transformações"""
        mapping_column = MappingColumn(
            origin_table_id=data.origin_table_id,
            origin_column_id=data.origin_column_id,
            destiny_table_id=data.destiny_table_id,
            destiny_column_id=data.destiny_column_id
        )

        # Adiciona transformações se houver
        if hasattr(data, 'transformations') and data.transformations:
            mapping_column.transformations = [
                self._create_mapping_transformation(trans_data)
                for trans_data in data.transformations
            ]

        return mapping_column
    
    def _create_mapping_transformation(self, data):
        """Cria uma transformação com seus param_values"""
        transformation = MappingTransformation(
            transformation_type_id=data.transformation_type_id,
            order=data.order
        )

        # Adiciona param_values se houver
        if hasattr(data, 'param_values') and data.param_values:
            transformation.param_values = [
                MappingTransformationParamValue(
                    param_definition_id=param.param_definition_id,
                    value=param.value
                )
                for param in data.param_values
            ]

        return transformation

    def list(self, migration_project_id: int):
        query = (
            self.db.query(Mapping)
            .options(
                selectinload(Mapping.columns).selectinload(MappingColumn.origin_table),
                selectinload(Mapping.columns).selectinload(MappingColumn.origin_column),
                selectinload(Mapping.columns).selectinload(MappingColumn.destiny_table),
                selectinload(Mapping.columns).selectinload(MappingColumn.destiny_column),
                selectinload(Mapping.columns)
                .selectinload(MappingColumn.transformations)
                .selectinload(MappingTransformation.param_values)
            )
            .filter(Mapping.migration_project_id == migration_project_id)
            .all()
        )
        
        return query

    def delete(self, mapping_id: int) -> bool:
        mapping = self.get_by_id(mapping_id)

        if not mapping:
            return False
        
        self.db.delete(mapping)
        self.db.commit()

        return True
    
    def get_by_id(self, mapping_id: int):        
        query = (
            self.db.query(Mapping)
            .options(
                selectinload(Mapping.columns).selectinload(MappingColumn.origin_table),
                selectinload(Mapping.columns).selectinload(MappingColumn.origin_column),
                selectinload(Mapping.columns).selectinload(MappingColumn.destiny_table),
                selectinload(Mapping.columns).selectinload(MappingColumn.destiny_column),
                selectinload(Mapping.columns)
                .selectinload(MappingColumn.transformations)
                .selectinload(MappingTransformation.param_values),
                selectinload(Mapping.columns)
                .selectinload(MappingColumn.transformations)
                .selectinload(MappingTransformation.transformation_type)
            )
            .filter(Mapping.id == mapping_id)
            .first()
        )
        
        # ✨ DEBUG: Adicione para verificar
        if query:
            print(f"\n🔍 Mapping carregado: {query.name}")
            if query.columns:
                for col in query.columns:
                    print(f"  Coluna {col.id}:")
                    print(f"    origin_table: {col.origin_table.name if col.origin_table else 'None'}")
                    print(f"    origin_column: {col.origin_column.name if col.origin_column else 'None'}")
                    print(f"    destiny_table: {col.destiny_table.name if col.destiny_table else 'None'}")
                    print(f"    destiny_column: {col.destiny_column.name if col.destiny_column else 'None'}")
        
        return query

    def update(self, mapping_id: int, data: MappingUpdate):
        print("Aqui")
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
            payload_columns = update_data["columns"]

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
                        # Atualiza campos básicos da coluna
                        db_col.origin_table_id = col_data["origin_table_id"]
                        db_col.origin_column_id = col_data["origin_column_id"]
                        db_col.destiny_table_id = col_data["destiny_table_id"]
                        db_col.destiny_column_id = col_data["destiny_column_id"]
                        
                        # ✨ ATUALIZA TRANSFORMAÇÕES
                        if "transformations" in col_data:
                            self._update_column_transformations(
                                db_col, 
                                col_data["transformations"]
                            )

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
                    
                    # ✨ ADICIONA TRANSFORMAÇÕES NA NOVA COLUNA
                    if "transformations" in col_data and col_data["transformations"]:
                        new_col.transformations = [
                            self._create_transformation_from_dict(trans_data)
                            for trans_data in col_data["transformations"]
                        ]
                    
                    self.db.add(new_col)

        # -----------------------------------------------
        # COMMIT FINAL
        # -----------------------------------------------
        self.db.commit()
        self.db.refresh(mapping)

        # ✨ RECARREGA COM TODOS OS RELACIONAMENTOS
        return self.get_by_id(mapping.id)
    
    def _update_column_transformations(self, column: MappingColumn, transformations_data: list):
        """
        Atualiza as transformações de uma coluna.
        Remove as que não vieram, atualiza as existentes e cria novas.
        """
        # IDs das transformações enviadas
        payload_transformation_ids = {
            trans.get("id") for trans in transformations_data if trans.get("id") is not None
        }

        # IDs das transformações existentes
        existing_transformation_ids = {trans.id for trans in column.transformations}

        # 1. REMOVER transformações que NÃO vieram no payload
        to_delete_transformation_ids = existing_transformation_ids - payload_transformation_ids

        for trans in column.transformations:
            if trans.id in to_delete_transformation_ids:
                self.db.delete(trans)

        self.db.flush()  # Importante: flush antes de continuar

        # 2. ATUALIZAR transformações existentes
        for trans_data in transformations_data:
            if trans_data.get("id"):
                db_trans = next(
                    (t for t in column.transformations if t.id == trans_data["id"]), 
                    None
                )
                if db_trans:
                    # Atualiza campos básicos
                    db_trans.transformation_type_id = trans_data["transformation_type_id"]
                    db_trans.order = trans_data["order"]
                    
                    # Atualiza param_values
                    if "param_values" in trans_data:
                        self._update_transformation_param_values(
                            db_trans, 
                            trans_data["param_values"]
                        )

        # 3. CRIAR novas transformações (sem ID)
        for trans_data in transformations_data:
            if not trans_data.get("id"):
                new_trans = self._create_transformation_from_dict(trans_data)
                new_trans.mapping_column_id = column.id
                self.db.add(new_trans)

    def _create_transformation_from_dict(self, trans_data: dict):
        """Cria uma transformação a partir de um dicionário"""
        transformation = MappingTransformation(
            transformation_type_id=trans_data["transformation_type_id"],
            order=trans_data["order"]
        )

        # Adiciona param_values se houver
        if "param_values" in trans_data and trans_data["param_values"]:
            transformation.param_values = [
                MappingTransformationParamValue(
                    param_definition_id=param["param_definition_id"],
                    value=param["value"]
                )
                for param in trans_data["param_values"]
            ]

        return transformation

    def _update_transformation_param_values(self, transformation: MappingTransformation, param_values_data: list):
        """
        Atualiza os param_values de uma transformação.
        Remove todos os existentes e cria novos (estratégia simples).
        """
        # Remove todos os param_values existentes
        for param_value in transformation.param_values:
            self.db.delete(param_value)

        self.db.flush()

        # Cria novos param_values
        for param_data in param_values_data:
            new_param = MappingTransformationParamValue(
                mapping_transformation_id=transformation.id,
                param_definition_id=param_data["param_definition_id"],
                value=param_data["value"]
            )
            self.db.add(new_param)
    
    def get_by_migration_project_id(self, migration_project_id: int):
        query = (
            self.db.query(MigrationProject)
            .options(
                selectinload(MigrationProject.origin_tables)
                .selectinload(MigrationProjectOriginTable.columns),
                
                selectinload(MigrationProject.mappings)
                .selectinload(Mapping.columns)
                .selectinload(MappingColumn.transformations)
                .selectinload(MappingTransformation.param_values),
                
                selectinload(MigrationProject.mappings)
                .selectinload(Mapping.columns)
                .selectinload(MappingColumn.transformations)
                .selectinload(MappingTransformation.transformation_type)
            )
            .filter(MigrationProject.id == migration_project_id)
            .first()
        )

        return query