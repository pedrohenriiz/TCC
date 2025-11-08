from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.services.migration_project_service import MigrationProjectService
from interfaces.schemas.migration_project_schema import (
    MigrationProjectCreate,
    MigrationProjectUpdate
)

migration_project_router = APIRouter(prefix="/migration-projects", tags=["Migration Projects"])

@migration_project_router.post("/")
def create_migration_project(request: MigrationProjectCreate, db: Session = Depends(database)):
    service = MigrationProjectService(db)
    migration_project = service.create_migration_project(request)
    return migration_project

@migration_project_router.get("/")
def list_migration_project(db: Session = Depends(database)):
    service = MigrationProjectService(db)
    data = service.list_migration_project()

    return data

@migration_project_router.get("/{id}")
def show_migration_project(id:int, db: Session = Depends(database)):
    service = MigrationProjectService(db)
    data = service.show_migration_project(id)

    if not data:
        raise HTTPException(status_code=400, detail="Projeto de migração não encontrado!")
    
    return data

@migration_project_router.patch("/{id}")
def update_migration_project(id:int, request: MigrationProjectUpdate, db: Session = Depends(database)):

    service = MigrationProjectService(db)
    data = service.update_migration_project(id, request)

    print(f"olá ${request.name}")

    if not data:
        raise HTTPException(status_code=400, detail="Projeto de migração não encontrado!")
    
    updated_migration_project = service.show_migration_project(id)

    return updated_migration_project
    
@migration_project_router.delete("/{id}")
def delete_migration_project(id:int, db: Session = Depends(database)):
    service = MigrationProjectService(db)
    deleted = service.delete_migration_project(id)

    if not deleted:
        raise HTTPException(status_code=400, detail="Projeto de migração não encontrado!")
    
    return { "detail": "Projeto de migração excluído com sucesso!" }