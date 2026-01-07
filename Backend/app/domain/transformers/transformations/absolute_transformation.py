from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class AbsoluteTransformation(BaseTransformation):
    """
    Transformação que retorna o valor absoluto.
    """
    
    @property
    def code(self) -> str:
        return "ABSOLUTE"
    
    def transform(self, value: Any) -> Any:
        """
        Retorna valor absoluto.
        
        Exemplos:
            -50 → 50
            -123.45 → 123.45
            10 → 10
        """
        if value is None or value == "":
            return value
        
        try:
            num = float(str(value).replace(',', '.'))
            return abs(num)
        except ValueError:
            return value