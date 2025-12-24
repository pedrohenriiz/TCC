from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from enum import Enum

class StatusEnum(str, Enum):
    COMPLETE = "COMPLETE"
    INCOMPLETE = "INCOMPLETE"

class MappingBase(BaseModel):
    name: str
    created_at: Optional[datetime] = None
    status: StatusEnum
    migration_project_id: int

# Mapping Columns

class MappingColumnsBase(BaseModel):

    # mapping_id: int

    origin_table_id: int
    origin_column_id: int

    destiny_table_id: int
    destiny_column_id: int

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

# Futuramente adicionar o mapping columns, o mapping_transformation e o mapping_transformation_param_value
class MappingCreate(MappingBase):

    columns: Optional[List[MappingColumnsBase]] = None
    pass

class MappingUpdate(MappingBase):
    id: Optional[int] = None
    name: Optional[str] = None
    status: Optional[StatusEnum] = None

    columns: Optional[List[MappingColumnsBase]] = None
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

