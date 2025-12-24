from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from infra.database.connection import Base

class Mapping(Base):
    __tablename__ = "mappings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    status = Column(String(10), nullable=False, default="INCOMPLETE")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Chave estrangeira para o projeto
    migration_project_id = Column(Integer, ForeignKey("migration_projects.id", ondelete="CASCADE"), nullable=False)

    migration_project = relationship(
        "MigrationProject",
        back_populates="mappings"
    )

    columns = relationship(
        "MappingColumn",
        back_populates="mapping",
        cascade="all, delete-orphan",
        lazy="joined"
    )

class MappingColumn(Base):
    __tablename__ = "mapping_columns"

    id = Column(Integer, primary_key=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    mapping_id = Column(Integer, ForeignKey("mappings.id", ondelete="CASCADE"), nullable=False)

    origin_table_id = Column(Integer, ForeignKey("migration_project_origin_tables.id", ondelete="CASCADE"), nullable=False)
    origin_column_id = Column(Integer, ForeignKey("migration_project_origin_table_columns.id", ondelete="CASCADE"), nullable=False)

    destiny_table_id = Column(Integer, ForeignKey("table_configs.id", ondelete="CASCADE"), nullable=False)
    destiny_column_id = Column(Integer, ForeignKey("table_config_columns.id", ondelete="CASCADE"), nullable=False)

    origin_table = relationship(
        "MigrationProjectOriginTable",
        lazy="joined"
    )

    origin_column = relationship(
        "MigrationProjectOriginTableColumn",
        lazy="joined"
    )

    # Destino
    destiny_table = relationship(
        "TableConfigs",
        foreign_keys=[destiny_table_id],
        lazy="joined",
        back_populates="mapping_columns"
    )

    destiny_column = relationship(
        "TableConfigColumns",
        foreign_keys=[destiny_column_id],
        lazy="joined",
        back_populates="mapping_columns"
    )

    # Se houver um model "Mapping", adicione o back_populates
    mapping = relationship(
        "Mapping",
        back_populates="columns",
        lazy="joined"
    )

    transformations = relationship(
        "MappingTransformation",
        back_populates="mapping_column",
        cascade="all, delete-orphan"
    )

class MappingTransformation(Base):
    __tablename__ = "mapping_transformations"

    id = Column(Integer, primary_key=True, index=True)
    order = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    mapping_column_id = Column(
        Integer,
        ForeignKey("mapping_columns.id", ondelete="CASCADE"),
        nullable=False
    )

    # FK para o tipo da transformação
    transformation_type_id = Column(
        Integer,
        ForeignKey("transformation_type.id", ondelete="RESTRICT"),
        nullable=False
    )

    mapping_column = relationship(
        "MappingColumn",
        back_populates="transformations",
        lazy="joined"
    )

    transformation_type = relationship(
        "TransformationType",
        back_populates="transformations",
        lazy="joined"
    )

    param_values = relationship(
        "MappingTransformationParamValue",
        back_populates="transformation",
        cascade="all, delete-orphan"
    )

class MappingTransformationParamValue(Base):
    __tablename__ = "mapping_transformation_param_values"

    id = Column(Integer, primary_key=True, index=True)
    value = Column(String, nullable=True) 

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    mapping_transformation_id = Column(
        Integer,
        ForeignKey("mapping_transformations.id", ondelete="CASCADE"),
        nullable=False
    )

    param_definition_id = Column(
        Integer,
        ForeignKey("transformation_schema_definition.id", ondelete="RESTRICT"),
        nullable=False
    )

    transformation = relationship(
        "MappingTransformation",
        back_populates="param_values"
    )

    param_definition = relationship(
        "TransformationSchemaDefinition",
        back_populates="param_values"
    )