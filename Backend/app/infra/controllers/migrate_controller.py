# infra/controllers/migrate_controller.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.services.mapping_service import MappingService
from domain.services.setting_service import SettingService
from pydantic import BaseModel

teste = APIRouter(prefix="/migrate", tags=["Migration"])

class MigrateRequest(BaseModel):
    migration_project_id: int

@teste.post("/")
def migrate(
    request: MigrateRequest,
    db: Session = Depends(database)
):
    """
    Executa a migração de dados.
    
    **Parâmetros:**
    - `migration_project_id`: ID do projeto de migração
    
    **Comportamento:**
    - Com `allow_duplicates=False`: Erro se encontrar "João Silva" duplicado
    - Com `allow_duplicates=True, duplicate_strategy='first'`: Usa o primeiro "João Silva" (ID 100)
    - Com `allow_duplicates=True, duplicate_strategy='last'`: Usa o último "João Silva" (ID 300)
    """
    try:
        setting_service = SettingService(db)
        
        allow_duplicates_str = setting_service.get_effective_value(
            key='allow_duplicates',
            owner_type='global'
        )
        
        duplicate_strategy = setting_service.get_effective_value(
            key='duplicate_strategy',
            owner_type='global'
        )
        
        # Converter string para boolean
        allow_duplicates = allow_duplicates_str.lower() == 'true'

        service = MappingService(db)
        
        result = service.get_by_migration_project(
            migration_project_id=request.migration_project_id,
            allow_duplicates=allow_duplicates,
            duplicate_strategy=duplicate_strategy
        )
        
        return {
            "success": True,
            "message": "Migração executada com sucesso!",
            "data": result,
            "settings_used": { 
                "allow_duplicates": allow_duplicates,
                "duplicate_strategy": duplicate_strategy
            }
        }
        
    except ValueError as e:
        # Erro de duplicata ou outro erro de validação
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Validation Error",
                "message": str(e),
                "suggestion": "Use 'allow_duplicates: true' para permitir duplicatas"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Migration Error",
                "message": str(e)
            }
        )