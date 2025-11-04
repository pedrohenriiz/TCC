from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.services.table_config_service import TableConfigService
from interfaces.schemas.table_config_schema import (
    TableConfigCreate,
    TableConfigUpdate
)

router = APIRouter(prefix="/table-configs", tags=["Table Configs"])

@router.post("/")
def create_table_config(request: TableConfigCreate, db: Session = Depends(database)):
    service = TableConfigService(db)
    config = service.create_table(request)
    return config

@router.get("/")
def list_table_config(db: Session = Depends(database)):
    service = TableConfigService(db)
    data = service.list_tables()
    return data

@router.get("/{id}")
def show_table_config(id:int, db: Session= Depends(database)):
    service = TableConfigService(db)
    data = service.show_table(id)

    if not data:
        raise HTTPException(status_code=400, detail="Tabela não encontrada!")
    
    return data

@router.patch("/{id}")
def update_table_config(id: int, request: TableConfigUpdate, db: Session=Depends(database)):
    service = TableConfigService(db)
    data = service.update_table(id, request)

    if not data:
        raise HTTPException(status_code=400, detail="Tabela não encontrada!")
    
    updated_data = service.show_table(id)
    
    return updated_data

@router.delete("/{id}")
def delete_table_config(id:int, db: Session = Depends(database)):
    service = TableConfigService(db)
    deleted = service.delete_tables(id)

    if not deleted:
        raise HTTPException(status_code=400, detail="Tabela não encontrada!")
    
    return { "detail": "Tabela excluída com sucesso!" }
