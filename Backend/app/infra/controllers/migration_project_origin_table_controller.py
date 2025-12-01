from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.services.migration_project_origin_table_service import MigrationProjectOriginTableService
from interfaces.schemas.migration_project_origin_table_schema import MigrationProjectOriginTableCreate, MigrationProjectOriginTableResponse, MigrationProjectOriginTableUpdate


migration_project_origin_table_router = APIRouter(prefix="/migration-projects", tags=["Origin tables"])

@migration_project_origin_table_router.post("/{migration_project_id}/origin-tables", response_model=MigrationProjectOriginTableResponse)
def create_migration_project_origin_table(migration_project_id, request: MigrationProjectOriginTableCreate, db: Session = Depends(database)):

    print(">> Controller chamado!")
    print(request)
    service = MigrationProjectOriginTableService(db)
    migration_project_origin_table = service.create_migration_project_origin_table(migration_project_id, data=request)

    return migration_project_origin_table

@migration_project_origin_table_router.patch("/{migration_project_id}/origin-tables/{id}")
def update_migration_project_origin_table(migration_project_id: int, id: int, request:MigrationProjectOriginTableUpdate, db: Session= Depends(database)):

    service = MigrationProjectOriginTableService(db)
    updated = service.update_migration_project_origin_table(migration_project_id=migration_project_id, id=id, data= request)

    if not updated:
        raise HTTPException(status_code=400, detail="Tabela de origem não encontrada!")
    

    print("Aqui")
    updated_migration_project_origin_table = service.show_migration_project_origin_table(migration_project_id, id)
    
    return updated_migration_project_origin_table

@migration_project_origin_table_router.delete("/{migration_project_id}/origin-tables/{id}")
def delete_migration_project_origin_table(migration_project_id, id, db: Session = Depends(database)):
    service = MigrationProjectOriginTableService(db)
    deleted = service.delete_migration_project_origin_table(migration_project_id, id)

    if not deleted:
        raise HTTPException(status_code=400, detail="Tabela de origem não encontrada!")
    
    return { "detail": "Tabela de origem excluída com sucesso!"}