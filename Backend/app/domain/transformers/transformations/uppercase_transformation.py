from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class UppercaseTransformation(BaseTransformation):
    """
    Transformação que converte texto para maiúsculas.
    """
    
    @property
    def code(self) -> str:
        return "UPPERCASE"
    
    def transform(self, value: Any) -> Any:
        """
        Converte o valor para maiúsculas.
        
        Args:
            value: Valor a ser convertido
            
        Returns:
            Valor em maiúsculas ou None se o valor for None
        """
        if value is None:
            return None
        
        return str(value).upper()