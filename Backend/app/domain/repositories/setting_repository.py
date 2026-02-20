from sqlalchemy.orm import Session
from domain.entities.setting import SettingDefinition, SettingValue
from typing import Optional, List
import json


class SettingRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, category: Optional[str] = None) -> List[dict]:
        """
        Retorna todas as configurações com seus valores efetivos.
        Uma query com LEFT JOIN — sem N+1.
        """
        definitions = (
            self.db.query(SettingDefinition)
            .filter(SettingDefinition.category == category if category else True)
            .order_by(SettingDefinition.category, SettingDefinition.display_order)
            .all()
        )

        if not definitions:
            return []

        # Busca todos os valores globais de uma vez
        definition_ids = [d.id for d in definitions]
        values_by_definition = {
            v.setting_definition_id: v.value
            for v in self.db.query(SettingValue).filter(
                SettingValue.setting_definition_id.in_(definition_ids),
                SettingValue.owner_type == "global",
                SettingValue.owner_id == None,
            ).all()
        }

        return [
            {
                "key": d.key,
                "value": values_by_definition.get(d.id, d.default_value),
                "default_value": d.default_value,
                "data_type": d.data_type,
                "category": d.category,
                "description": d.description,
                "allowed_values": d.allowed_values,
                "is_customized": d.id in values_by_definition,
            }
            for d in definitions
        ]

    def get(self, key: str) -> Optional[str]:
        """
        Retorna o valor efetivo de uma configuração.
        Retorna o valor customizado se existir, senão o default.
        Lança ValueError se a chave não existir.
        """
        definition = self._get_definition(key)
        if not definition:
            raise ValueError(f"Configuração '{key}' não encontrada")

        value = self.db.query(SettingValue).filter(
            SettingValue.setting_definition_id == definition.id,
            SettingValue.owner_type == "global",
            SettingValue.owner_id == None,
        ).first()

        return value.value if value else definition.default_value

    # ==================== ESCRITA ====================

    def set(self, key: str, value: str) -> None:
        """Cria ou atualiza o valor de uma configuração."""
        definition = self._get_definition(key)
        if not definition:
            raise ValueError(f"Configuração '{key}' não encontrada")

        existing = self.db.query(SettingValue).filter(
            SettingValue.setting_definition_id == definition.id,
            SettingValue.owner_type == "global",
            SettingValue.owner_id == None,
        ).first()

        if existing:
            existing.value = value
        else:
            self.db.add(SettingValue(
                setting_definition_id=definition.id,
                value=value,
                owner_type="global",
                owner_id=None,
            ))

        self.db.commit()

    def bulk_set(self, values: dict) -> None:
        """Atualiza múltiplos valores de uma vez."""
        for key, value in values.items():
            self.set(key, str(value))

    def reset(self, key: str) -> bool:
        """Remove o valor customizado, voltando para o default. Retorna False se não havia customização."""
        definition = self._get_definition(key)
        if not definition:
            raise ValueError(f"Configuração '{key}' não encontrada")

        existing = self.db.query(SettingValue).filter(
            SettingValue.setting_definition_id == definition.id,
            SettingValue.owner_type == "global",
            SettingValue.owner_id == None,
        ).first()

        if not existing:
            return False

        self.db.delete(existing)
        self.db.commit()
        return True

    # ==================== SEED ====================

    def seed(self):
        """
        Popula as definições iniciais e seus valores default.
        Idempotente — pode ser chamado múltiplas vezes sem duplicar dados.
        """
        definitions = [
            {
                "key": "allow_duplicates",
                "default_value": "false",
                "data_type": "boolean",
                "category": "migration",
                "description": "Permite chaves naturais duplicadas",
                "allowed_values": json.dumps(["true", "false"]),
                "display_order": 1,
            },
            {
                "key": "duplicate_strategy",
                "default_value": "first",
                "data_type": "string",
                "category": "migration",
                "description": "Estratégia para resolver duplicatas",
                "allowed_values": json.dumps(["first", "last", "all"]),
                "display_order": 2,
            },
            {
                "key": "error_strategy",
                "default_value": "abort_on_first",
                "data_type": "string",
                "category": "migration",
                "description": "Estratégia de tratamento de erros durante migração",
                "allowed_values": json.dumps(["abort_on_first", "validate_all", "skip_invalid"]),
                "display_order": 3,
            },
        ]

        for data in definitions:
            definition = self._get_definition(data["key"])

            if not definition:
                definition = SettingDefinition(**data)
                self.db.add(definition)
                self.db.flush()  # garante que definition.id está disponível

            # Cria o valor default se ainda não existe
            existing_value = self.db.query(SettingValue).filter(
                SettingValue.setting_definition_id == definition.id,
                SettingValue.owner_type == "global",
                SettingValue.owner_id == None,
            ).first()

            if not existing_value:
                self.db.add(SettingValue(
                    setting_definition_id=definition.id,
                    value=definition.default_value,
                    owner_type="global",
                    owner_id=None,
                ))

        self.db.commit()


    def _get_definition(self, key: str) -> Optional[SettingDefinition]:
        return self.db.query(SettingDefinition).filter(SettingDefinition.key == key).first()