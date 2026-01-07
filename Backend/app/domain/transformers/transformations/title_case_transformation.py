from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class TitleCaseTransformation(BaseTransformation):
    """
    Transformação que converte para Title Case (primeira letra de cada palavra maiúscula).
    """
    
    @property
    def code(self) -> str:
        return "TITLE_CASE"
    
    def transform(self, value: Any) -> Any:
        """
        Converte para Title Case.
        
        Exemplos:
            "joão silva santos" → "João Silva Santos"
            "maria DE souza" → "Maria De Souza"
        """
        if value is None or value == "":
            return value
        
        return str(value).title()