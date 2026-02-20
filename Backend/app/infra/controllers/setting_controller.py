from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from infra.database.database import database
from domain.repositories.setting_repository import SettingRepository
from interfaces.schemas.setting_schema import SettingsUpdateBulk
from typing import Optional

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("")
def list_settings(
    category: Optional[str] = Query(None),
    db: Session = Depends(database)
):
    """Lista todas as configurações com seus valores atuais."""
    return SettingRepository(db).list(category=category)


@router.get("/{key}")
def get_setting(key: str, db: Session = Depends(database)):
    """Retorna o valor atual de uma configuração."""
    try:
        value = SettingRepository(db).get(key)
        return {"key": key, "value": value}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/bulk")
def bulk_set(request: SettingsUpdateBulk, db: Session = Depends(database)):
    """
    Atualiza múltiplas configurações de uma vez.

    Exemplo:
    {
        "settings": {
            "allow_duplicates": "true",
            "error_strategy": "skip_invalid"
        }
    }
    """
    try:
        SettingRepository(db).bulk_set(request.settings)
        return {"updated_keys": list(request.settings.keys())}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{key}")
def set_setting(key: str, body: dict, db: Session = Depends(database)):
    """Atualiza o valor de uma configuração."""
    try:
        SettingRepository(db).set(key, str(body.get("value", "")))
        return {"key": key, "value": body.get("value")}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{key}")
def reset_setting(key: str, db: Session = Depends(database)):
    """Reseta uma configuração para o valor default."""
    try:
        repo = SettingRepository(db)
        repo.reset(key)
        return {"key": key, "value": repo.get(key), "reset": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/seed")
def seed(db: Session = Depends(database)):
    """Popula as definições iniciais. Idempotente."""
    SettingRepository(db).seed()
    return {"message": "Seed executado com sucesso"}