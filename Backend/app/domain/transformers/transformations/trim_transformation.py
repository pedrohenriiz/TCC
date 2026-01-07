from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class TrimTransformation(BaseTransformation):
    """
    Transformação que remove espaços em branco do início e fim do texto.
    """
    
    @property
    def code(self) -> str:
        return "TRIM"
    
    def transform(self, value: Any) -> Any:
        """
        Remove espaços em branco do início e fim.
        
        Args:
            value: Valor a ser processado
            
        Returns:
            Valor sem espaços nas extremidades
            
        Exemplos:
            "  João Silva  " → "João Silva"
            "Maria   " → "Maria"
        """
        if value is None or value == "":
            return value
        
        return str(value).strip()