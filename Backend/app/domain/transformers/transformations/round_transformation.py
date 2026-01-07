from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class RoundTransformation(BaseTransformation):
    """
    Transformação que arredonda números.
    """
    
    @property
    def code(self) -> str:
        return "ROUND"
    
    def transform(self, value: Any) -> Any:
        """
        Arredonda número.
        
        Exemplos:
            123.456, decimals=2 → 123.46
            123.454, decimals=2 → 123.45
            123.5, decimals=0 → 124
        """
        if value is None or value == "":
            return value
        
        try:
            num = float(str(value).replace(',', '.'))
        except ValueError:
            return value
        
        decimals = int(self.params.get('decimals', 0))
        return round(num, decimals)