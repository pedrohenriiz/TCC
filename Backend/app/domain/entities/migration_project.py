from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum, func
from sqlalchemy.orm import relationship
from infra.database.connection import Base
import enum


class MigrationProject(Base):
    __tablename__ = "migration_projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    description = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Um projeto pode ter várias tabelas de origem
    origin_tables = relationship(
        "MigrationProjectOriginTable",
        back_populates="migration_project",
        cascade="all, delete-orphan"
    )

    mappings = relationship(
        "Mapping",
        back_populates="migration_project",
        cascade="all, delete-orphan"
    )


class MigrationProjectOriginTable(Base):
    __tablename__ = "migration_project_origin_tables"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Chave estrangeira para o projeto
    migration_project_id = Column(Integer, ForeignKey("migration_projects.id", ondelete="CASCADE"), nullable=False)

    # Relacionamentos
    migration_project = relationship(
        "MigrationProject",
        back_populates="origin_tables"
    )

    # Uma tabela de origem pode ter várias colunas
    columns = relationship(
        "MigrationProjectOriginTableColumn",
        back_populates="origin_table",
        cascade="all, delete-orphan"
    )

    mapping_columns = relationship(
        "MappingColumn",
        back_populates="origin_table",
        foreign_keys="[MappingColumn.origin_table_id]"
    )


class MigrationProjectOriginTableColumn(Base):
    __tablename__ = "migration_project_origin_table_columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    type = Column(String(14), nullable=False)
    is_pk = Column(Boolean, nullable=True)
    is_natural_key = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Chave estrangeira para a tabela de origem
    origin_table_id = Column(Integer, ForeignKey("migration_project_origin_tables.id", ondelete="CASCADE"), nullable=False)

    # Relacionamento inverso
    origin_table = relationship(
        "MigrationProjectOriginTable",
        back_populates="columns"
    )

    mapping_columns = relationship(
        "MappingColumn",
        back_populates="origin_column",
        foreign_keys="[MappingColumn.origin_column_id]"
    )
