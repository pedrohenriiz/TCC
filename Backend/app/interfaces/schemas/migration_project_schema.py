from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


# ============================================================
# Column Schemas
# ============================================================

class MigrationProjectOriginTableColumnBase(BaseModel):
    id: int
    name: str
    type: str
    is_pk: Optional[bool] = False


class MigrationProjectOriginTableColumnCreate(MigrationProjectOriginTableColumnBase):
    pass


class MigrationProjectOriginTableColumnUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None
    is_pk: Optional[bool] = None


class MigrationProjectOriginTableColumnRead(MigrationProjectOriginTableColumnBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        orm_mode = True


# ============================================================
# Origin Table Schemas
# ============================================================

class MigrationProjectOriginTableBase(BaseModel):
    id: int
    name: str


class MigrationProjectOriginTableCreate(MigrationProjectOriginTableBase):
    columns: Optional[List[MigrationProjectOriginTableColumnCreate]] = None


class MigrationProjectOriginTableUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    columns: Optional[List[MigrationProjectOriginTableColumnUpdate]] = None


class MigrationProjectOriginTableRead(MigrationProjectOriginTableBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    migration_project_id: int
    columns: Optional[List[MigrationProjectOriginTableColumnRead]] = None

    class Config:
        orm_mode = True


# ============================================================
# Project Schemas
# ============================================================

class MigrationProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class MigrationProjectCreate(MigrationProjectBase):
    origin_tables: Optional[List[MigrationProjectOriginTableCreate]] = None


class MigrationProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    origin_tables: Optional[List[MigrationProjectOriginTableUpdate]] = None


class MigrationProjectRead(MigrationProjectBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    origin_tables: Optional[List[MigrationProjectOriginTableRead]] = None

    class Config:
        orm_mode = True
