from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from infra.database.connection import Base

class TableConfigs(Base):
    __tablename__ = "table_configs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    exhibition_name = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relacionamento 1:N com as colunas
    columns = relationship(
        "TableConfigColumns",
        back_populates="table",
        cascade="all, delete-orphan",
        foreign_keys="[TableConfigColumns.table_id]"
    )


class TableConfigColumns(Base):
    __tablename__ = "table_config_columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    size = Column(Integer, nullable=True)
    precision = Column(Integer, nullable=True)
    is_pk = Column(Boolean, nullable=False, default=False)
    is_nullable = Column(Boolean, nullable=False, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # FK para a tabela principal
    table_id = Column(Integer, ForeignKey("table_configs.id", ondelete="CASCADE"), nullable=False)
    table = relationship(
        "TableConfigs",
        back_populates="columns",
        foreign_keys=[table_id]
    )

    # FKs opcionais para referência entre colunas
    foreign_table_id = Column(Integer, ForeignKey("table_configs.id"), nullable=True)
    foreign_column_id = Column(Integer, ForeignKey("table_config_columns.id"), nullable=True)

    foreign_table = relationship("TableConfigs", foreign_keys=[foreign_table_id])
    foreign_column = relationship("TableConfigColumns", remote_side=[id])
