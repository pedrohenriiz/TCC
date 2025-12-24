from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from infra.database.database import database
from pydantic import BaseModel
from typing import List
from application.check_migration_project_and_origin_tables import ProjectFileService
from domain.services.mapping_service import MappingService

teste = APIRouter(prefix="", tags=["CSV"])

class MigrateRequest(BaseModel):
    migration_project_id: str


@teste.post("/migrate")
async def migrate(request: MigrateRequest, db: Session = Depends(database)):

    service = MappingService(db)
    mapping = service.get_by_migration_project(request.migration_project_id)

    return mapping
    # service = ProjectFileService("/app/projects")
    # try:
    #     # csv = service.get_csv_by_names(request.nome_projeto, request.nome_csv)

    #     print(csv)
    #     if not csv:
    #         raise HTTPException(
    #             status_code=404,
    #             detail="CSV não encontrado!"
    #         )
    #     return csv  
    # except Exception as error:
    #     raise HTTPException(status_code = 500, detail=str(error))