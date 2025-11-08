from sqlalchemy import Column, Integer, String, DateTime, Enum, func
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

    # table_origins = relationship(
    #     "MigrationProjects",
    #     back_populates="migration_project",
    #     cascade="all, delete-orphan",
    #     foreign_keys=["TableOrigins.migration_project_id"]
    # )

# class TableOrigins(Base):
#     __tablename__ = "table_origins"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(80), nullable=False)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
#     deleted_at = Column(DateTime(timezone=True), nullable=True)

#     migration_project = relationship(
#         "MigrationProject",
#         back_populates="table_origins"
#     )

#     columns = relationship(
#         "TableOriginColumns",
#         back_populates="table_origin",
#         cascade="all, delete-orphan"
#     )

# class TableOriginColumnsType(enum.Enum):
#     text = "TEXT"
#     number = "NUMBER"
#     date = 'DATE'
#     boolean = 'BOOLEAN'

# class TableOriginColumns(Base):
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String(80), nullable=False)
#     type = Column(Enum(TableOriginColumnsType), nullable=False)

#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())
#     deleted_at = Column(DateTime(timezone=True), nullable=True)


