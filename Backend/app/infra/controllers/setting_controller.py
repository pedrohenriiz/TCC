# infra/controllers/setting_controller.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.services.setting_service import SettingService
from interfaces.schemas.setting_schema import (
    SettingDefinitionCreate,
    SettingDefinitionRead,
    SettingValueUpdate,
    SettingEffectiveRead,
    SettingsUpdateBulk,
    SettingsReadBulk
)
from typing import Optional, List

router = APIRouter(prefix="/settings", tags=["Settings"])


# ==================== DEFINITIONS ====================

@router.post("/definitions", response_model=SettingDefinitionRead)
def create_definition(
    request: SettingDefinitionCreate,
    db: Session = Depends(database)
):
    """Cria uma nova definição de configuração"""
    try:
        service = SettingService(db)
        return service.create_definition(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/definitions", response_model=List[SettingDefinitionRead])
def list_definitions(
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    db: Session = Depends(database)
):
    """Lista todas as definições de configurações"""
    try:
        service = SettingService(db)
        return service.list_definitions(category=category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/definitions/{key}", response_model=SettingDefinitionRead)
def show_definition(
    key: str,
    db: Session = Depends(database)
):
    """Busca uma definição por chave"""
    try:
        service = SettingService(db)
        definition = service.show_definition(key)
        
        if not definition:
            raise HTTPException(status_code=404, detail=f"Definição '{key}' não encontrada")
        
        return definition
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== VALUES (SIMPLE) ====================

@router.get("/values/{key}")
def get_value(
    key: str,
    owner_type: str = Query("global", description="Tipo do dono (global, user, project)"),
    owner_id: Optional[int] = Query(None, description="ID do dono"),
    db: Session = Depends(database)
):
    """Busca um valor de configuração específico"""
    try:
        service = SettingService(db)
        value = service.get_value(key, owner_type, owner_id)
        
        if not value:
            raise HTTPException(status_code=404, detail=f"Valor para '{key}' não encontrado")
        
        return value
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/values/{key}")
def update_value(
    key: str,
    request: SettingValueUpdate,
    owner_type: str = Query("global", description="Tipo do dono (global, user, project)"),
    owner_id: Optional[int] = Query(None, description="ID do dono"),
    db: Session = Depends(database)
):
    """Cria ou atualiza um valor de configuração"""
    try:
        service = SettingService(db)
        return service.update_value(key, request.value, owner_type, owner_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/values/{key}")
def delete_value(
    key: str,
    owner_type: str = Query("global", description="Tipo do dono (global, user, project)"),
    owner_id: Optional[int] = Query(None, description="ID do dono"),
    db: Session = Depends(database)
):
    """Remove um valor de configuração (volta para default)"""
    try:
        service = SettingService(db)
        deleted = service.delete_value(key, owner_type, owner_id)
        
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Valor para '{key}' não encontrado")
        
        return {"success": True, "message": f"Valor de '{key}' removido (voltou para default)"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== EFFECTIVE VALUES (MAIN ENDPOINTS) ====================

@router.get("/effective", response_model=List[SettingEffectiveRead])
def get_all_effective_settings(
    owner_type: str = Query("global", description="Tipo do dono (global, user, project)"),
    owner_id: Optional[int] = Query(None, description="ID do dono"),
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    db: Session = Depends(database)
):
    """
    Retorna todas as configurações efetivas com metadados.
    
    Retorna o valor customizado se existir, senão retorna o default.
    Inclui flag 'is_customized' para indicar se o valor foi customizado.
    """
    try:
        service = SettingService(db)
        return service.get_all_effective_with_metadata(owner_type, owner_id, category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/effective/{key}")
def get_effective_value(
    key: str,
    owner_type: str = Query("global", description="Tipo do dono (global, user, project)"),
    owner_id: Optional[int] = Query(None, description="ID do dono"),
    db: Session = Depends(database)
):
    """
    Retorna o valor efetivo de uma configuração.
    
    Retorna o valor customizado se existir, senão retorna o default.
    """
    try:
        service = SettingService(db)
        value = service.get_effective_value(key, owner_type, owner_id)
        return {"key": key, "value": value}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/effective/bulk")
def update_multiple_settings(
    request: SettingsUpdateBulk,
    owner_type: str = Query("global", description="Tipo do dono (global, user, project)"),
    owner_id: Optional[int] = Query(None, description="ID do dono"),
    db: Session = Depends(database)
):
    """
    Atualiza múltiplas configurações de uma vez.
    
    **Exemplo de request:**
```json
    {
        "settings": {
            "allow_duplicates": "true",
            "duplicate_strategy": "all"
        }
    }
```
    """
    try:
        service = SettingService(db)
        results = service.update_multiple_values(request, owner_type, owner_id)
        
        return {
            "success": True,
            "message": f"{len(results)} configuração(ões) atualizada(s)",
            "updated_keys": [result.definition.key for result in results]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== SEED ====================

@router.post("/seed")
def seed_definitions(db: Session = Depends(database)):
    """
    Popula as definições iniciais de configuração.
    
    Deve ser chamado apenas uma vez na inicialização do sistema.
    """
    try:
        service = SettingService(db)
        service.seed_definitions()
        
        return {
            "success": True,
            "message": "Definições de configuração populadas com sucesso"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))