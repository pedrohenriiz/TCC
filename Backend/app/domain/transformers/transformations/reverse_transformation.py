from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class ReverseTransformation(BaseTransformation):
    """
    Transformação que inverte o texto.
    """
    
    @property
    def code(self) -> str:
        return "REVERSE"
    
    def transform(self, value: Any) -> Any:
        """
        Inverte o texto.
        
        Exemplos:
            "abc" → "cba"
            "12345" → "54321"
        """
        if value is None or value == "":
            return value
        
        return str(value)[::-1]