from typing import Optional, List
from pydantic import BaseModel

# ---------------------------
# Column Schemas
# ---------------------------

class MigrationProjectOriginColumnBase(BaseModel):
    name: str
    type: str
    is_pk: Optional[bool] = False


class MigrationProjectOriginColumnCreate(MigrationProjectOriginColumnBase):
    pass


class MigrationProjectOriginColumnUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None
    is_pk: Optional[bool] = None


class MigrationProjectOriginColumnResponse(BaseModel):
    id: int
    name: str
    type: str
    is_pk: bool

    class Config:
        orm_mode = True


# ---------------------------
# Table Schemas
# ---------------------------

class MigrationProjectOriginTableBase(BaseModel):
    name: str


class MigrationProjectOriginTableCreate(MigrationProjectOriginTableBase):
    columns: Optional[List[MigrationProjectOriginColumnCreate]] = None


class MigrationProjectOriginTableUpdate(BaseModel):
    name: Optional[str] = None
    columns: Optional[List[MigrationProjectOriginColumnUpdate]] = None


class MigrationProjectOriginTableResponse(BaseModel):
    id: int
    name: str
    columns: Optional[List[MigrationProjectOriginColumnResponse]] = None

    class Config:
        orm_mode = True
