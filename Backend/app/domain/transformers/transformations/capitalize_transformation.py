from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class CapitalizeTransformation(BaseTransformation):
    """
    Transformação que capitaliza o texto (primeira letra maiúscula, resto minúscula).
    """
    
    @property
    def code(self) -> str:
        return "CAPITALIZE"
    
    def transform(self, value: Any) -> Any:
        """
        Capitaliza o texto.
        
        Exemplos:
            "joão silva" → "João silva"
            "MARIA" → "Maria"
        """
        if value is None or value == "":
            return value
        
        return str(value).capitalize()