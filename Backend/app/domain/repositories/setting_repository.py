from sqlalchemy.orm import Session, selectinload
from domain.entities.setting import SettingDefinition, SettingValue
from interfaces.schemas.setting_schema import SettingDefinitionCreate, SettingValueUpdate
from typing import Optional, List
import json

class SettingRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_definition_by_key(self, key: str) -> Optional[SettingDefinition]:
        """Busca uma definição de configuração pela chave."""
        return self.db.query(SettingDefinition).filter(
            SettingDefinition.key == key
        ).first()
    
    def list_definitions(self, category: Optional[str] = None) -> List[SettingDefinition]:
        """
        Retorna todas as definições de configurações.
        
        Args:
            category: Filtra por categoria (opcional)
        """
        query = self.db.query(SettingDefinition)
        
        if category:
            query = query.filter(SettingDefinition.category == category)
        
        return query.order_by(
            SettingDefinition.category,
            SettingDefinition.display_order
        ).all()
    
    def create_definition(self, request: SettingDefinitionCreate) -> SettingDefinition:
        """Cria uma nova definição de configuração."""
        definition = SettingDefinition(
            key=request.key,
            default_value=request.default_value,
            data_type=request.data_type,
            category=request.category,
            description=request.description,
            allowed_values=request.allowed_values,
            display_order=request.display_order
        )
        self.db.add(definition)
        self.db.commit()
        self.db.refresh(definition)
        return definition

    def get_value_by_key(
        self, 
        key: str, 
        owner_type: str = "global", 
        owner_id: Optional[int] = None
    ) -> Optional[SettingValue]:
        """
        Busca um valor de configuração específico.
        
        Args:
            key: Chave da configuração
            owner_type: Tipo do dono (global, user, project)
            owner_id: ID do dono (NULL para global)
        """
        definition = self.get_definition_by_key(key)
        if not definition:
            return None
        
        return self.db.query(SettingValue).filter(
            SettingValue.setting_definition_id == definition.id,
            SettingValue.owner_type == owner_type,
            SettingValue.owner_id == owner_id
        ).first()
    
    def list_values(
        self, 
        owner_type: str = "global", 
        owner_id: Optional[int] = None
    ) -> List[SettingValue]:
        """
        Retorna todos os valores de configuração para um owner específico.
        
        Args:
            owner_type: Tipo do dono (global, user, project)
            owner_id: ID do dono (NULL para global)
        """
        return (
            self.db.query(SettingValue)
            .options(selectinload(SettingValue.definition))
            .filter(
                SettingValue.owner_type == owner_type,
                SettingValue.owner_id == owner_id
            )
            .all()
        )
    
    def create_or_update_value(
        self, 
        key: str, 
        value: str,
        owner_type: str = "global",
        owner_id: Optional[int] = None
    ) -> SettingValue:
        """
        Cria ou atualiza um valor de configuração.
        
        Args:
            key: Chave da configuração
            value: Valor a ser salvo
            owner_type: Tipo do dono (global, user, project)
            owner_id: ID do dono (NULL para global)
        """
        definition = self.get_definition_by_key(key)
        if not definition:
            raise ValueError(f"Definição de configuração '{key}' não encontrada")
        
        # Busca se já existe um valor
        setting_value = self.get_value_by_key(key, owner_type, owner_id)
        
        if setting_value:
            # Atualiza valor existente
            setting_value.value = value
        else:
            # Cria novo valor
            setting_value = SettingValue(
                setting_definition_id=definition.id,
                value=value,
                owner_type=owner_type,
                owner_id=owner_id
            )
            self.db.add(setting_value)
        
        self.db.commit()
        self.db.refresh(setting_value)
        return setting_value
    
    def delete_value(
        self,
        key: str,
        owner_type: str = "global",
        owner_id: Optional[int] = None
    ) -> bool:
        """
        Remove um valor de configuração (volta para o default).
        
        Args:
            key: Chave da configuração
            owner_type: Tipo do dono (global, user, project)
            owner_id: ID do dono (NULL para global)
        """
        setting_value = self.get_value_by_key(key, owner_type, owner_id)
        
        if setting_value:
            self.db.delete(setting_value)
            self.db.commit()
            return True
        
        return False
    
    # ==================== HELPERS ====================
    
    def get_effective_value(
        self,
        key: str,
        owner_type: str = "global",
        owner_id: Optional[int] = None
    ) -> str:
        """
        Retorna o valor efetivo de uma configuração.
        
        Se não houver valor customizado, retorna o default_value.
        
        Args:
            key: Chave da configuração
            owner_type: Tipo do dono (global, user, project)
            owner_id: ID do dono (NULL para global)
        
        Returns:
            Valor efetivo (customizado ou default)
        """
        definition = self.get_definition_by_key(key)
        if not definition:
            raise ValueError(f"Definição de configuração '{key}' não encontrada")
        
        # Busca valor customizado
        setting_value = self.get_value_by_key(key, owner_type, owner_id)
        
        if setting_value and setting_value.value is not None:
            return setting_value.value
        
        # Retorna default
        return definition.default_value
    
    def get_all_effective_values(
        self,
        owner_type: str = "global",
        owner_id: Optional[int] = None,
        category: Optional[str] = None
    ) -> dict:
        """
        Retorna todas as configurações efetivas (customizadas + defaults).
        
        Args:
            owner_type: Tipo do dono (global, user, project)
            owner_id: ID do dono (NULL para global)
            category: Filtra por categoria (opcional)
        
        Returns:
            Dict com {key: valor_efetivo}
        """
        definitions = self.list_definitions(category=category)
        result = {}
        
        for definition in definitions:
            effective_value = self.get_effective_value(
                key=definition.key,
                owner_type=owner_type,
                owner_id=owner_id
            )
            result[definition.key] = effective_value
        
        return result
    
    def update_multiple_values(
        self,
        values: dict,
        owner_type: str = "global",
        owner_id: Optional[int] = None
    ) -> List[SettingValue]:
        """
        Atualiza múltiplos valores de configuração de uma vez.
        
        Args:
            values: Dict com {key: value}
            owner_type: Tipo do dono (global, user, project)
            owner_id: ID do dono (NULL para global)
        
        Returns:
            Lista de SettingValue criados/atualizados
        """
        results = []
        
        for key, value in values.items():
            setting_value = self.create_or_update_value(
                key=key,
                value=str(value),
                owner_type=owner_type,
                owner_id=owner_id
            )
            results.append(setting_value)
        
        return results
    
    
    def seed_definitions(self):
        """
        Popula as definições iniciais de configuração.
        Deve ser chamado apenas uma vez na inicialização.
        """
        definitions = [
            {
                "key": "allow_duplicates",
                "default_value": "false",
                "data_type": "boolean",
                "category": "migration",
                "description": "Permite chaves naturais duplicadas",
                "allowed_values": json.dumps(["true", "false"]),
                "display_order": 1
            },
            {
                "key": "duplicate_strategy",
                "default_value": "first",
                "data_type": "string",
                "category": "migration",
                "description": "Estratégia para resolver duplicatas",
                "allowed_values": json.dumps(["first", "last", "all"]),
                "display_order": 2
            },
            {
                "key": "error_strategy",
                "default_value": "abort_on_first",
                "data_type": "string",
                "category": "migration",
                "description": "Estratégia de tratamento de erros durante migração",
                "allowed_values": json.dumps([
                    "abort_on_first",
                    "validate_all", 
                    "skip_invalid"
                ]),
                "display_order": 3
            },
        ]
        
        for def_data in definitions:
            # Verifica se já existe
            existing = self.get_definition_by_key(def_data["key"])
            if not existing:
                definition = SettingDefinition(**def_data)
                self.db.add(definition)
                print(f"✅ Definição '{def_data['key']}' criada")
            else:
                print(f"ℹ️  Definição '{def_data['key']}' já existe")
        
        self.db.commit()