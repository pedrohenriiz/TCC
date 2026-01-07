from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from infra.database.connection import Base

class TransformationType(Base):
    __tablename__ = "transformation_type"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(80), nullable=False)
    name = Column(String(80), nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(20), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    schema_definitions = relationship(
        "TransformationSchemaDefinition",
        back_populates="transformation_type",
        cascade="all, delete-orphan",
        lazy="joined"
    )

    transformations = relationship(
        "MappingTransformation",
        back_populates="transformation_type"
    )

class TransformationSchemaDefinition(Base):
    __tablename__ = "transformation_schema_definition"

    id = Column(Integer, primary_key=True, index=True)
    param_key = Column(String(80), nullable=False)
    param_label = Column(String(80), nullable=False)
    param_type = Column(String(80), nullable=False)
    required = Column(Boolean, nullable=True)
    param_order = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    transformation_type_id = Column(Integer, ForeignKey("transformation_type.id", ondelete="CASCADE"), nullable=False)
    transformation_type = relationship(
        "TransformationType",
        back_populates="schema_definitions",
        cascade="all"
    )

    param_values = relationship(
        "MappingTransformationParamValue",
        back_populates="param_definition"
    )


