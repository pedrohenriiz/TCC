from typing import Any
import re
from domain.transformers.transformations.base_transformation import BaseTransformation

class RemoveSpecialCharsTransformation(BaseTransformation):
    """
    Transformação que remove caracteres especiais.
    """
    
    @property
    def code(self) -> str:
        return "REMOVE_SPECIAL_CHARS"
    
    def transform(self, value: Any) -> Any:
        """
        Remove caracteres especiais, mantendo apenas letras, números e espaços.
        
        Exemplos:
            "João@#Silva!" → "JoãoSilva"
            "Teste-123_ok" → "Teste123ok"
        """
        if value is None or value == "":
            return value
        
        text = str(value)
        
        # ✨ Converte string "true"/"false" para boolean
        keep_spaces_param = self.params.get('keep_spaces', 'true')
        
        # Se vier como string, converte para boolean
        if isinstance(keep_spaces_param, str):
            keep_spaces = keep_spaces_param.lower() == 'true'
        else:
            keep_spaces = bool(keep_spaces_param)
        
        print(f"🔍 REMOVE_SPECIAL_CHARS: keep_spaces={keep_spaces} (type: {type(keep_spaces)})")
        
        if keep_spaces:
            # Mantém letras, números e espaços
            return re.sub(r'[^a-zA-Z0-9\u00C0-\u017F\s]', '', text)
        else:
            # Mantém apenas letras e números
            return re.sub(r'[^a-zA-Z0-9\u00C0-\u017F]', '', text)