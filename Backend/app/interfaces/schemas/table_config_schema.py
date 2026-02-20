from pydantic import BaseModel
from typing import List, Optional

class TableConfigColumnCreate(BaseModel):
    name: str
    type: str
    size: Optional[int] = None
    is_pk: Optional[bool] = False
    is_nullable: Optional[bool] = True
    foreign_table_id: Optional[int] = None
    foreign_column_id: Optional[int] = None
    id_generation_strategy: Optional[str] = 'keep'
    id_start_value: Optional[int] = 1

class TableConfigColumnUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    size: Optional[int] = None
    is_pk: Optional[bool] = False
    is_nullable: Optional[bool] = True
    foreign_table_id: Optional[int] = None
    foreign_column_id: Optional[int] = None
    id_generation_strategy: Optional[str] = 'keep'
    id_start_value: Optional[int] = 1

class TableConfigCreate(BaseModel):
    name: str
    exhibition_name: str
    columns: Optional[List[TableConfigColumnCreate]] = None

class TableConfigUpdate(BaseModel):
    name: Optional[str]
    exhibition_name: Optional[str]
    columns: Optional[List[TableConfigColumnUpdate]] = None
    
class TableConfigResponse(BaseModel):
    id: int
    name: str
    exhibition_name: str

class TableConfigList(BaseModel):
    id: int
    name: str
    exhibition_name: str
    total_columns: int
    total_foreign_keys: int

class TableConfigDelete(BaseModel):
    id: int

class AddForeignKeyRequest(BaseModel):
    foreign_table_id: int
    foreign_column_id: int

class AddForeignKeyResponse(BaseModel):
    column_id: int
    column_name: str
    foreign_table_id: int
    foreign_table_name: str
    foreign_column_id: int
    foreign_column_name: str
    message: str