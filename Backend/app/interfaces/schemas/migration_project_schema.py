from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from enum import Enum


# ============================================================
# Enums
# ============================================================

class StatusEnum(str, Enum):
    COMPLETE = "COMPLETE"
    INCOMPLETE = "INCOMPLETE"


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
        from_attributes = True  # Pydantic v2 (ou orm_mode = True para v1)


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
        from_attributes = True


# ============================================================
# Transformation Schemas (NOVO)
# ============================================================

class TransformationTypeRead(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class MappingTransformationParamValueRead(BaseModel):
    id: int
    param_definition_id: int
    value: str

    class Config:
        from_attributes = True


class MappingTransformationRead(BaseModel):
    id: int
    transformation_type_id: int
    order: int
    param_values: List[MappingTransformationParamValueRead] = []
    transformation_type: Optional[TransformationTypeRead] = None

    class Config:
        from_attributes = True


# ============================================================
# Mapping Column Schemas (NOVO)
# ============================================================

class MappingColumnRead(BaseModel):
    id: int
    origin_table_id: int
    origin_column_id: int
    destiny_table_id: int
    destiny_column_id: int
    transformations: List[MappingTransformationRead] = []

    class Config:
        from_attributes = True


# ============================================================
# Mapping Schemas (NOVO)
# ============================================================

class MappingRead(BaseModel):
    id: int
    name: str
    status: StatusEnum
    migration_project_id: int
    columns: List[MappingColumnRead] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


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
    mappings: Optional[List[MappingRead]] = []  # ✨ ADICIONAR MAPPINGS

    class Config:
        from_attributes = True  # Pydantic v2 (ou orm_mode = True para v1)