from typing import Optional
from pydantic import BaseModel


class SettingRead(BaseModel):
    """Uma configuração com seu valor atual (customizado ou default)."""
    key: str
    value: str
    default_value: str
    data_type: str
    category: str
    description: Optional[str] = None
    allowed_values: Optional[str] = None
    is_customized: bool

    class Config:
        from_attributes = True


class SettingsUpdateBulk(BaseModel):
    """Atualiza múltiplas configurações de uma vez."""
    settings: dict  # {key: value}

    class Config:
        json_schema_extra = {
            "example": {
                "settings": {
                    "allow_duplicates": "true",
                    "duplicate_strategy": "all"
                }
            }
        }