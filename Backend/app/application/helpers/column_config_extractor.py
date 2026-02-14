# application/helpers/column_config_extractor.py

from typing import List, Dict
from sqlalchemy.orm import Session

class ColumnConfigExtractor:
    """
    Extrai configurações de colunas para validação de tipos
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def extract_for_validation(
        self,
        mapping_columns: List,
        table_id: int
    ) -> List[Dict]:
        """
        Extrai configurações de colunas no formato esperado pelo TypeValidator
        
        Args:
            mapping_columns: Lista de MappingColumn do SQLAlchemy
            table_id: ID da tabela de destino
        
        Returns:
            Lista de dicts com configurações:
            [
                {
                    'column_name': 'age',
                    'origin_type': 'varchar',
                    'origin_size': None,
                    'destiny_type': 'int',
                    'destiny_size': None
                },
                ...
            ]
        """
        configs = []
        
        for mc in mapping_columns:
            # Filtra apenas colunas desta tabela
            if mc.destiny_table_id != table_id:
                continue
            
            # Monta configuração
            config = {
                'column_name': mc.destiny_column.name,
                'origin_type': mc.origin_column.type,
                'origin_size': None,  # Modelo atual não tem size na origem
                'destiny_type': mc.destiny_column.type,
                'destiny_size': mc.destiny_column.size,
            }
            
            configs.append(config)
        
        return configs