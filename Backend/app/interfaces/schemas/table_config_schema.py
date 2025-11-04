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

class TableConfigColumnUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    size: Optional[int] = None
    is_pk: Optional[bool] = False
    is_nullable: Optional[bool] = True
    foreign_table_id: Optional[int] = None
    foreign_column_id: Optional[int] = None

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

class TableConfigUpdate(BaseModel):
    name: Optional[str] = None
    exhibition_name: Optional[str] = None

class TableConfigList(BaseModel):
    id: int
    name: str
    exhibition_name: str
    total_columns: int
    total_foreign_keys: int

class TableConfigDelete(BaseModel):
    id: int