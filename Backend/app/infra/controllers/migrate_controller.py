from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.services.mapping_service import MappingService
from domain.repositories.setting_repository import SettingRepository
from pydantic import BaseModel

router = APIRouter(prefix="/migrate", tags=["Migration"])


class MigrateRequest(BaseModel):
    migration_project_id: int


@router.post("/")
def migrate(request: MigrateRequest, db: Session = Depends(database)):
    """
    Executa a migração de dados.

    **Comportamento:**
    - Com `allow_duplicates=False`: Erro se encontrar chaves naturais duplicadas
    - Com `allow_duplicates=True, duplicate_strategy='first'`: Usa o primeiro registro duplicado
    - Com `allow_duplicates=True, duplicate_strategy='last'`: Usa o último registro duplicado
    """
    try:
        settings = SettingRepository(db)

        allow_duplicates = settings.get("allow_duplicates").lower() == "true"
        duplicate_strategy = settings.get("duplicate_strategy")

        result = MappingService(db).get_by_migration_project(
            migration_project_id=request.migration_project_id,
            allow_duplicates=allow_duplicates,
            duplicate_strategy=duplicate_strategy,
        )

        return {
            "success": True,
            "data": result,
            "settings_used": {
                "allow_duplicates": allow_duplicates,
                "duplicate_strategy": duplicate_strategy,
            },
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))