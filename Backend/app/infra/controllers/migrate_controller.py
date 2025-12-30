# infra/controllers/migrate_controller.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.services.mapping_service import MappingService
from pydantic import BaseModel

teste = APIRouter(prefix="/migrate", tags=["Migration"])

class MigrateRequest(BaseModel):
    migration_project_id: int
    allow_duplicates: bool = False
    duplicate_strategy: str = 'first'  # 'first' ou 'last'

@teste.post("/")
def migrate(
    request: MigrateRequest,
    db: Session = Depends(database)
):
    """
    Executa a migração de dados.
    
    **Parâmetros:**
    - `migration_project_id`: ID do projeto de migração
    - `allow_duplicates`: Permite chaves naturais duplicadas (padrão: False)
    - `duplicate_strategy`: Estratégia para duplicatas - 'first' (usa primeiro) ou 'last' (usa último)
    
    **Exemplo sem duplicatas (padrão):**
    ```json
    {
        "migration_project_id": 1
    }
    ```
    
    **Exemplo permitindo duplicatas:**
    ```json
    {
        "migration_project_id": 1,
        "allow_duplicates": true,
        "duplicate_strategy": "first"
    }
    ```
    
    **Comportamento:**
    - Com `allow_duplicates=False`: Erro se encontrar "João Silva" duplicado
    - Com `allow_duplicates=True, duplicate_strategy='first'`: Usa o primeiro "João Silva" (ID 100)
    - Com `allow_duplicates=True, duplicate_strategy='last'`: Usa o último "João Silva" (ID 300)
    """
    try:
        service = MappingService(db)
        
        result = service.get_by_migration_project(
            migration_project_id=request.migration_project_id,
            allow_duplicates=request.allow_duplicates,
            duplicate_strategy=request.duplicate_strategy
        )
        
        return {
            "success": True,
            "message": "Migração executada com sucesso!",
            "data": result
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