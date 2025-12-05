from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from domain.services.mapping_service import MappingService
from infra.database.database import database
from interfaces.schemas.mapping_schema import (
    MappingCreate,
    MappingUpdate
)

mapping_router = APIRouter(prefix="/mappings", tags=["Mappings"])

@mapping_router.post("/")
def create_mapping(request: MappingCreate, db: Session=Depends(database)):
    service = MappingService(db)
    mapping = service.create_mapping(request)

    return mapping

@mapping_router.get("/")
def list_mapping(db: Session = Depends(database)):
    service = MappingService(db)
    data = service.list_mapping()

    return data

@mapping_router.get("/{id}")
def show_mapping(id: int, db: Session = Depends(database)):
    service = MappingService(db)
    data = service.show_mapping(id)

    if not data:
        raise HTTPException(status_code=400, detail="Mapeamento não encontrado!")
    
    return data
@mapping_router.patch("/{id}")
def update_mapping(id: int, request: MappingUpdate, db: Session= Depends(database)):
    service = MappingService(db)
    data = service.update_mapping(id, request)

    if not data:
        raise HTTPException(status_code=400, detail="Mapeamento não encontrado!")
    
    updated_data = service.show_mapping(id)

    return updated_data


@mapping_router.delete("/{id}")
def delete_mapping(id: int, db: Session = Depends(database)):
    service = MappingService(db)
    deleted = service.delete_mapping(id)

    if not deleted:
        raise HTTPException(status_code=400, detail="Mapeamento não encontrado!")

    return { "detail": "Mapeamento excluído com sucesso!" }