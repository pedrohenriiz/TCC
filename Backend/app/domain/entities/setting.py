# domain/models/setting.py

from sqlalchemy import Column, Integer, String, DateTime, Text, func, ForeignKey
from sqlalchemy.orm import relationship
from infra.database.connection import Base

class SettingDefinition(Base):
    __tablename__ = "setting_definitions"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    default_value = Column(Text, nullable=False)
    data_type = Column(String(20), nullable=False)  # boolean, string, integer, json
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    allowed_values = Column(Text, nullable=True)  # JSON em string: '["first", "last", "all"]'
    display_order = Column(Integer, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamento com valores
    values = relationship(
        "SettingValue",
        back_populates="definition",
        cascade="all, delete-orphan",
        lazy="select"
    )


class SettingValue(Base):
    __tablename__ = "setting_values"

    id = Column(Integer, primary_key=True, index=True)
    setting_definition_id = Column(
        Integer, 
        ForeignKey("setting_definitions.id", ondelete="CASCADE"), 
        nullable=False
    )
    value = Column(Text, nullable=True)
    owner_type = Column(String(50), nullable=False, default="global", index=True)  # global, user, project
    owner_id = Column(Integer, nullable=True, index=True)  # NULL para global
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamento com definição
    definition = relationship(
        "SettingDefinition",
        back_populates="values",
        lazy="select"
    )