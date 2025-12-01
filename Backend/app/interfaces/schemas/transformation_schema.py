from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

# TODO: Adicionar o created_at, updated_at e deleted_at futuramente

class TransformationSchemaDefinitionBase(BaseModel):
    param_key: str
    param_label: str
    param_type: str
    required: bool
    param_order: int

class TransformationBase(BaseModel):
    id: int
    code: str
    name: str
    description: str
    created_at: Optional[datetime]

class TransformationBaseCreate(TransformationBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None

    schema_definitions: Optional[List[TransformationSchemaDefinitionBase]] = None
    pass

class TransformationBaseUpdate(TransformationBase):
    id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime]= None

    schema_definitions: Optional[List[TransformationSchemaDefinitionBase]] = None

