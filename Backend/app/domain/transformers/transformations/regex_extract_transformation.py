from typing import Any
import re
from domain.transformers.transformations.base_transformation import BaseTransformation

class RegexExtractTransformation(BaseTransformation):
    """
    Transformação que extrai texto usando expressões regulares.
    """
    
    @property
    def code(self) -> str:
        return "REGEX_EXTRACT"
    
    def validate_params(self) -> bool:
        if 'pattern' not in self.params:
            raise ValueError("Parâmetro 'pattern' é obrigatório para REGEX_EXTRACT")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Extrai texto usando expressões regulares.
        
        Args:
            value: Texto a processar
            
        Returns:
            Texto extraído ou vazio se não encontrar
            
        Exemplos:
            "Email: joao@example.com", pattern=r"[\w\.-]+@[\w\.-]+" → "joao@example.com"
            "Tel: (11) 99988-7766", pattern=r"\d+" → "11" (primeiro match)
            "CEP: 01310-100", pattern=r"\d{5}-?\d{3}" → "01310-100"
            "Código: ABC123", pattern=r"[A-Z]+" → "ABC"
        """
        if value is None or value == "":
            return value
        
        text = str(value)
        pattern = self.params.get('pattern', '')
        group_index = self.params.get('group_index', '0')
        on_not_found = self.params.get('on_not_found', 'keep_original')
        
        # Flags opcionais
        case_insensitive = self.params.get('case_insensitive', 'false')
        
        # Converte string "true"/"false" para boolean
        if isinstance(case_insensitive, str):
            case_insensitive = case_insensitive.lower() == 'true'
        else:
            case_insensitive = bool(case_insensitive)
        
        # Converte group_index para int
        try:
            group_index = int(group_index)
        except ValueError:
            group_index = 0
        
        try:
            # Aplica flags
            flags = re.IGNORECASE if case_insensitive else 0
            
            # Busca o padrão
            match = re.search(pattern, text, flags=flags)
            
            if match:
                # Se group_index = 0, retorna o match completo
                # Se group_index > 0, retorna o grupo capturado
                if group_index == 0:
                    return match.group(0)
                else:
                    if group_index <= len(match.groups()):
                        return match.group(group_index)
                    else:
                        print(f"⚠️ Grupo {group_index} não encontrado (total de grupos: {len(match.groups())})")
                        return self._handle_not_found(text, on_not_found)
            else:
                # Padrão não encontrado
                return self._handle_not_found(text, on_not_found)
                
        except re.error as e:
            print(f"⚠️ Erro na expressão regular '{pattern}': {e}")
            return value
        except Exception as e:
            print(f"⚠️ Erro ao aplicar regex extract: {e}")
            return value
    
    def _handle_not_found(self, original_value: str, on_not_found: str) -> str:
        """
        Lida com casos onde o padrão não é encontrado.
        """
        if on_not_found == 'keep_original':
            return original_value
        elif on_not_found == 'empty':
            return ""
        elif on_not_found == 'error':
            print(f"❌ ERRO: Padrão não encontrado em '{original_value}'")
            return original_value
        else:
            return original_value