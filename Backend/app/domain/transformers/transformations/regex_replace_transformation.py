from typing import Any
import re
from domain.transformers.transformations.base_transformation import BaseTransformation


class RegexReplaceTransformation(BaseTransformation):
    """
    Transformação que substitui texto usando expressões regulares.
    """
    
    @property
    def code(self) -> str:
        return "REGEX_REPLACE"
    
    def validate_params(self) -> bool:
        if 'pattern' not in self.params:
            raise ValueError("Parâmetro 'pattern' é obrigatório para REGEX_REPLACE")
        if 'replacement' not in self.params:
            raise ValueError("Parâmetro 'replacement' é obrigatório para REGEX_REPLACE")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Substitui texto usando expressões regulares.
        
        Args:
            value: Texto a processar
            
        Returns:
            Texto com substituições aplicadas
            
        Exemplos:
            "João123Silva", pattern=r"\d+", replacement="" → "JoãoSilva"
            "abc-def-ghi", pattern=r"-", replacement=" " → "abc def ghi"
            "Email: joao@test.com", pattern=r"[a-z]+@[a-z]+\.[a-z]+", replacement="***" → "Email: ***"
            "  espaços  ", pattern=r"\s+", replacement=" " → " espaços "
        """
        if value is None or value == "":
            return value
        
        text = str(value)
        pattern = self.params.get('pattern', '')
        replacement = self.params.get('replacement', '')
        
        # Flags opcionais
        case_insensitive = self.params.get('case_insensitive', 'false')
        
        # Converte string "true"/"false" para boolean
        if isinstance(case_insensitive, str):
            case_insensitive = case_insensitive.lower() == 'true'
        else:
            case_insensitive = bool(case_insensitive)
        
        try:
            # Aplica flags
            flags = re.IGNORECASE if case_insensitive else 0
            
            # Realiza a substituição
            result = re.sub(pattern, replacement, text, flags=flags)
            
            return result
            
        except re.error as e:
            print(f"⚠️ Erro na expressão regular '{pattern}': {e}")
            return value
        except Exception as e:
            print(f"⚠️ Erro ao aplicar regex replace: {e}")
            return value