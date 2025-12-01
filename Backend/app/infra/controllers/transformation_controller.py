from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.services.transformation_service import TransformationService
from interfaces.schemas.transformation_schema import TransformationBaseCreate, TransformationBaseUpdate

transformation_router = APIRouter(prefix="/transformations", tags=["Transformations"])

@transformation_router.post("/")
def create_transformation(request: TransformationBaseCreate, db: Session = Depends(database)):
    service = TransformationService(db)
    transformation = service.create(request)
    return transformation

@transformation_router.get("/")
def list_transformation(db: Session = Depends(database)):
    service = TransformationService(db)
    data = service.list()

    return data

@transformation_router.patch("/{id}")
def update_transformation(id: int, request: TransformationBaseUpdate, db: Session = Depends(database)):
    service = TransformationService(db)
    print("ESSE É O REQUEST", request)
    data = service.update(id, request)

    if not data:
        raise HTTPException(status_code =400, detail="Tabela não encontrada!")
    
    updated_data = service.get_by_id(id)

    return updated_data

@transformation_router.get("/{id}")
def show_transformation(id: int, db: Session = Depends(database)):
    service = TransformationService(db)
    data = service.get_by_id(id)

    if not data:
        raise HTTPException(status_code=400, detail="Transformação não encontrada!")
    
    return data

@transformation_router.delete("/{id}")
def delete_transformation(id: int, db: Session = Depends(database)):
    service = TransformationService(db)
    deleted = service.delete(id)

    if not deleted:
        raise HTTPException(status_code=400, detail="Tabela não encontrada!")
    
    return { "detail": "Transformação excluída com sucesso!" }

#     if not deleted:
#         raise HTTPException(status_code=400, detail="Tabela não encontrada!")
    
#     return { "detail": "Tabela excluída com sucesso!" }


# @router.get("/")
# def list_table_config(db: Session = Depends(database)):
#     service = TableConfigService(db)
#     data = service.list_tables()
#     return data

# @router.get("/{id}")
# def show_table_config(id:int, db: Session= Depends(database)):
#     service = TableConfigService(db)
#     data = service.show_table(id)

#     if not data:
#         raise HTTPException(status_code=400, detail="Tabela não encontrada!")
    
#     return data

# @router.patch("/{id}")
# def update_table_config(id: int, request: TableConfigUpdate, db: Session=Depends(database)):
#     service = TableConfigService(db)
#     data = service.update_table(id, request)

#     if not data:
#         raise HTTPException(status_code=400, detail="Tabela não encontrada!")
    
#     updated_data = service.show_table(id)
    
#     return updated_data

# @router.delete("/{id}")
# def delete_table_config(id:int, db: Session = Depends(database)):
#     service = TableConfigService(db)
#     deleted = service.delete_tables(id)

#     if not deleted:
#         raise HTTPException(status_code=400, detail="Tabela não encontrada!")
    
#     return { "detail": "Tabela excluída com sucesso!" }
