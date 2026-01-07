from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class LowercaseTransformation(BaseTransformation):
    """
    Transformação que converte texto para minúscula.
    """
    
    @property
    def code(self) -> str:
        return "LOWERCASE"
    
    def transform(self, value: Any) -> Any:
        """
        Converte o valor para minúscula.
        
        Args:
            value: Valor a ser convertido
            
        Returns:
            Valor em minúscula ou None se o valor for None
        """
        if value is None:
            return None
        
        return str(value).lower()