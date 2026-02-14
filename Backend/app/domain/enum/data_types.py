# domain/enums/data_types.py

from enum import Enum

class DataType(str, Enum):
    """Tipos de dados suportados no sistema"""
    
    # Numéricos
    INT = "int"
    DECIMAL = "decimal"
    FLOAT = "float"
    
    # Texto
    VARCHAR = "varchar"
    TEXT = "text"
    
    # Data/Hora
    DATE = "date"
    DATETIME = "datetime"
    TIMESTAMP = "timestamp"
    
    # Booleano
    BOOLEAN = "boolean"
    
    # Binário
    BLOB = "blob"
    
    @property
    def is_numeric(self) -> bool:
        """Verifica se é tipo numérico"""
        return self in [DataType.INT, DataType.DECIMAL, DataType.FLOAT]
    
    @property
    def is_text(self) -> bool:
        """Verifica se é tipo texto"""
        return self in [DataType.VARCHAR, DataType.TEXT]
    
    @property
    def is_temporal(self) -> bool:
        """Verifica se é tipo data/hora"""
        return self in [DataType.DATE, DataType.DATETIME, DataType.TIMESTAMP]
    
    def __str__(self) -> str:
        return self.value