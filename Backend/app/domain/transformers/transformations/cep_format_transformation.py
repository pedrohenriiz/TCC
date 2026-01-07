from typing import Any
import re
from domain.transformers.transformations.base_transformation import BaseTransformation

class CepFormatTransformation(BaseTransformation):
    """
    Transformação que formata ou desformata CEP brasileiro.
    """
    
    @property
    def code(self) -> str:
        return "CEP_FORMAT"
    
    def validate_params(self) -> bool:
        if 'action' not in self.params:
            raise ValueError("Parâmetro 'action' é obrigatório para CEP_FORMAT")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Formata ou desformata CEP brasileiro.
        
        Args:
            value: CEP
            
        Returns:
            CEP formatado ou desformatado
            
        Exemplos:
            FORMAT:
                "01310100" → "01310-100"
                "12345678" → "12345-678"
            
            UNFORMAT:
                "01310-100" → "01310100"
                "12345-678" → "12345678"
        """
        if value is None or value == "":
            return value
        
        action = self.params.get('action', 'format')
        on_incomplete = self.params.get('on_incomplete', 'keep_original')
        
        if action == 'format':
            return self._format_cep(value, on_incomplete)
        elif action == 'unformat':
            return self._unformat_cep(value)
        else:
            print(f"⚠️ Ação '{action}' não reconhecida")
            return value
    
    def _format_cep(self, value: Any, on_incomplete: str) -> str:
        """
        Formata CEP brasileiro: 01310100 → 01310-100
        """
        # Remove tudo que não é dígito
        digits = re.sub(r'\D', '', str(value))
        
        if not digits:
            return str(value)
        
        # CEP deve ter 8 dígitos
        if len(digits) == 8:
            return f"{digits[:5]}-{digits[5:]}"
        else:
            return self._handle_incomplete(str(value), digits, on_incomplete, f"tamanho inválido ({len(digits)} dígitos, esperado 8)")
    
    def _handle_incomplete(self, original_value: str, digits: str, on_incomplete: str, reason: str) -> str:
        """
        Lida com CEPs incompletos baseado na estratégia configurada.
        """
        if on_incomplete == 'keep_original':
            # Mantém valor original
            return original_value
        
        elif on_incomplete == 'format_partial':
            # Formata o que for possível
            if len(digits) >= 5:
                return f"{digits[:5]}-{digits[5:]}"
            return digits
        
        elif on_incomplete == 'pad_zeros':
            # Preenche com zeros à esquerda até 8 dígitos
            padded = digits.zfill(8)
            return f"{padded[:5]}-{padded[5:]}"
        
        elif on_incomplete == 'error':
            # Registra erro e retorna original
            print(f"❌ ERRO: CEP incompleto - {reason}: '{original_value}'")
            return original_value
        
        elif on_incomplete == 'empty':
            # Retorna vazio
            return ""
        
        else:
            # Padrão: mantém original
            return original_value
    
    def _unformat_cep(self, value: Any) -> str:
        """
        Remove formatação de CEP, deixando apenas dígitos.
        """
        return re.sub(r'\D', '', str(value))