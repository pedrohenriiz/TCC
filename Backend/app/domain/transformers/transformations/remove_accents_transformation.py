from typing import Any
import unicodedata
from domain.transformers.transformations.base_transformation import BaseTransformation

class RemoveAccentsTransformation(BaseTransformation):
    """
    Transformação que remove acentuação de caracteres.
    """
    
    @property
    def code(self) -> str:
        return "REMOVE_ACCENTS"
    
    def transform(self, value: Any) -> Any:
        """
        Remove acentos e diacríticos.
        
        Exemplos:
            "José María" → "Jose Maria"
            "São Paulo" → "Sao Paulo"
            "Ação" → "Acao"
        """
        if value is None or value == "":
            return value
        
        text = str(value)
        # Normaliza para NFD (decompõe caracteres acentuados)
        nfd = unicodedata.normalize('NFD', text)
        # Remove marcas diacríticas (categoria Mn)
        return ''.join(char for char in nfd if unicodedata.category(char) != 'Mn')