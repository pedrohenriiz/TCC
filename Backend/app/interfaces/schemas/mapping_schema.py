from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from enum import Enum

class StatusEnum(str, Enum):
    COMPLETE = "COMPLETE"
    INCOMPLETE = "INCOMPLETE"

# Schema para param_values
class MappingTransformationParamValueBase(BaseModel):
    param_definition_id: int
    value: str

class MappingTransformationParamValueCreate(MappingTransformationParamValueBase):
    pass

class MappingTransformationParamValueUpdate(MappingTransformationParamValueBase):
    id: Optional[int] = None

# ✨ ADICIONAR (Response Schema)
class MappingTransformationParamValueRead(BaseModel):
    id: int
    param_definition_id: int
    value: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schema para transformations
class MappingTransformationBase(BaseModel):
    transformation_type_id: int
    order: int
    param_values: Optional[List[MappingTransformationParamValueBase]] = []

class MappingTransformationCreate(MappingTransformationBase):
    pass

class MappingTransformationUpdate(MappingTransformationBase):
    id: Optional[int] = None
    param_values: Optional[List[MappingTransformationParamValueUpdate]] = []

# ✨ ADICIONAR (Response Schema)
class MappingTransformationRead(BaseModel):
    id: int
    transformation_type_id: int
    order: int
    param_values: List[MappingTransformationParamValueRead] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schema para Mapping
class MappingBase(BaseModel):
    name: str
    created_at: Optional[datetime] = None
    status: StatusEnum
    migration_project_id: int

# Mapping Columns
class MappingColumnsBase(BaseModel):
    origin_table_id: int
    origin_column_id: int
    destiny_table_id: int
    destiny_column_id: int
    
    transformations: Optional[List[MappingTransformationBase]] = []
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

class MappingColumnsCreate(MappingColumnsBase):
    transformations: Optional[List[MappingTransformationCreate]] = []

class MappingColumnsUpdate(MappingColumnsBase):
    id: Optional[int] = None
    transformations: Optional[List[MappingTransformationUpdate]] = []
    
class OriginTableSimple(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class OriginColumnSimple(BaseModel):
    id: int
    name: str
    type: str
    is_pk: Optional[bool] = False

    class Config:
        from_attributes = True


class DestinyTableSimple(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class DestinyColumnSimple(BaseModel):
    id: int
    name: str
    type: str

    class Config:
        from_attributes = True
        
class MappingColumnRead(BaseModel):
    id: int
    origin_table_id: int
    origin_column_id: int
    destiny_table_id: int
    destiny_column_id: int
    
    # ✨ ADICIONAR os relacionamentos
    origin_table: Optional[OriginTableSimple] = None
    origin_column: Optional[OriginColumnSimple] = None
    destiny_table: Optional[DestinyTableSimple] = None
    destiny_column: Optional[DestinyColumnSimple] = None
    
    transformations: List[MappingTransformationRead] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True

# Mapping CRUD
class MappingCreate(MappingBase):
    columns: Optional[List[MappingColumnsCreate]] = None

class MappingUpdate(MappingBase):
    id: Optional[int] = None
    name: Optional[str] = None
    status: Optional[StatusEnum] = None
    columns: Optional[List[MappingColumnsUpdate]] = None
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

class MappingRead(BaseModel):
    id: int
    name: str
    status: StatusEnum
    migration_project_id: int
    columns: List[MappingColumnRead] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True