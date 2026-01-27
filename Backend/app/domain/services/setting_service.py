from sqlalchemy.orm import Session
from domain.repositories.setting_repository import SettingRepository
from interfaces.schemas.setting_schema import (
    SettingDefinitionCreate,
    SettingValueUpdate,
    SettingsUpdateBulk
)
from typing import Optional, List
import json


class SettingService:
    def __init__(self, db: Session):
        self.repo = SettingRepository(db)

    def create_definition(self, data: SettingDefinitionCreate):
        """Cria uma nova definição de configuração"""
        return self.repo.create_definition(data)
    
    def list_definitions(self, category: Optional[str] = None):
        """Lista todas as definições de configurações"""
        return self.repo.list_definitions(category=category)
    
    def show_definition(self, key: str):
        """Busca uma definição por chave"""
        return self.repo.get_definition_by_key(key)
    
    
    def get_value(
        self, 
        key: str, 
        owner_type: str = "global", 
        owner_id: Optional[int] = None
    ):
        """Busca um valor de configuração específico"""
        return self.repo.get_value_by_key(key, owner_type, owner_id)
    
    def list_values(
        self, 
        owner_type: str = "global", 
        owner_id: Optional[int] = None
    ):
        """Lista todos os valores de configuração"""
        return self.repo.list_values(owner_type, owner_id)
    
    def update_value(
        self,
        key: str,
        value: str,
        owner_type: str = "global",
        owner_id: Optional[int] = None
    ):
        """Cria ou atualiza um valor de configuração"""
        return self.repo.create_or_update_value(key, value, owner_type, owner_id)
    
    def delete_value(
        self,
        key: str,
        owner_type: str = "global",
        owner_id: Optional[int] = None
    ):
        """Remove um valor de configuração (volta para default)"""
        return self.repo.delete_value(key, owner_type, owner_id)
    
    def get_effective_value(
        self,
        key: str,
        owner_type: str = "global",
        owner_id: Optional[int] = None
    ):
        """Retorna o valor efetivo (customizado ou default)"""
        return self.repo.get_effective_value(key, owner_type, owner_id)
    
    def get_all_effective_values(
        self,
        owner_type: str = "global",
        owner_id: Optional[int] = None,
        category: Optional[str] = None
    ):
        """Retorna todas as configurações efetivas"""
        return self.repo.get_all_effective_values(owner_type, owner_id, category)
    
    def update_multiple_values(
        self,
        data: SettingsUpdateBulk,
        owner_type: str = "global",
        owner_id: Optional[int] = None
    ):
        """Atualiza múltiplas configurações de uma vez"""
        return self.repo.update_multiple_values(
            values=data.settings,
            owner_type=owner_type,
            owner_id=owner_id
        )
    
    def get_all_effective_with_metadata(
        self,
        owner_type: str = "global",
        owner_id: Optional[int] = None,
        category: Optional[str] = None
    ):
        """
        Retorna todas as configurações com metadados completos.
        Útil para a UI mostrar se está usando default ou customizado.
        """
        definitions = self.repo.list_definitions(category=category)
        result = []
        
        for definition in definitions:
            effective_value = self.repo.get_effective_value(
                key=definition.key,
                owner_type=owner_type,
                owner_id=owner_id
            )
            
            # Verifica se foi customizado
            custom_value = self.repo.get_value_by_key(
                key=definition.key,
                owner_type=owner_type,
                owner_id=owner_id
            )
            
            result.append({
                "key": definition.key,
                "value": effective_value,
                "default_value": definition.default_value,
                "data_type": definition.data_type,
                "category": definition.category,
                "description": definition.description,
                "allowed_values": definition.allowed_values,
                "is_customized": custom_value is not None
            })
        
        return result
        
    def seed_definitions(self):
        """Popula as definições iniciais"""
        return self.repo.seed_definitions()