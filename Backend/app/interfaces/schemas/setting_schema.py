from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SettingDefinitionBase(BaseModel):
    key: str
    default_value: str
    data_type: str  # boolean, string, integer, json
    category: str
    description: Optional[str] = None
    allowed_values: Optional[str] = None  # JSON string
    display_order: Optional[int] = None


class SettingDefinitionCreate(SettingDefinitionBase):
    pass


class SettingDefinitionUpdate(SettingDefinitionBase):
    id: Optional[int] = None
    key: Optional[str] = None
    default_value: Optional[str] = None
    data_type: Optional[str] = None
    category: Optional[str] = None


class SettingDefinitionRead(BaseModel):
    id: int
    key: str
    default_value: str
    data_type: str
    category: str
    description: Optional[str] = None
    allowed_values: Optional[str] = None
    display_order: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SettingValueBase(BaseModel):
    setting_definition_id: int
    value: Optional[str] = None
    owner_type: str = "global"  # global, user, project
    owner_id: Optional[int] = None


class SettingValueCreate(SettingValueBase):
    pass


class SettingValueUpdate(BaseModel):
    value: str


class SettingValueRead(BaseModel):
    id: int
    setting_definition_id: int
    value: Optional[str] = None
    owner_type: str
    owner_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Relacionamento
    definition: Optional[SettingDefinitionRead] = None

    class Config:
        from_attributes = True


class SettingEffectiveRead(BaseModel):
    """Schema para retornar configuração com valor efetivo"""
    key: str
    value: str  # Valor efetivo (customizado ou default)
    default_value: str
    data_type: str
    category: str
    description: Optional[str] = None
    allowed_values: Optional[str] = None
    is_customized: bool  # True se foi customizado, False se está usando default

    class Config:
        from_attributes = True


class SettingsUpdateBulk(BaseModel):
    """Schema para atualizar múltiplas configurações"""
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


class SettingsReadBulk(BaseModel):
    """Schema para retornar múltiplas configurações"""
    settings: dict  # {key: value_efetivo}
    
    class Config:
        json_schema_extra = {
            "example": {
                "settings": {
                    "allow_duplicates": "false",
                    "duplicate_strategy": "first"
                }
            }
        }