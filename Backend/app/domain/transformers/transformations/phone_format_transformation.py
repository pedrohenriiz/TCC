from typing import Any
import re
from domain.transformers.transformations.base_transformation import BaseTransformation

class PhoneFormatTransformation(BaseTransformation):
    """
    Transformação que formata ou desformata números de telefone brasileiros.
    """
    
    @property
    def code(self) -> str:
        return "PHONE_FORMAT"
    
    def validate_params(self) -> bool:
        if 'action' not in self.params:
            raise ValueError("Parâmetro 'action' é obrigatório para PHONE_FORMAT")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Formata ou desformata telefones brasileiros (com ou sem DDI).
        """
        if value is None or value == "":
            return value
        
        action = self.params.get('action', 'format')
        on_incomplete = self.params.get('on_incomplete', 'keep_original')
        
        if action == 'format':
            return self._format_phone(value, on_incomplete)
        elif action == 'unformat':
            return self._unformat_phone(value)
        else:
            print(f"⚠️ Ação '{action}' não reconhecida")
            return value
    
    def _format_phone(self, value: Any, on_incomplete: str) -> str:
        """
        Formata número de telefone brasileiro.
        """
        text = str(value).strip()
        
        # Verifica se já tem o sinal de +
        has_plus_sign = text.startswith('+')
        
        # Remove tudo que não é dígito
        digits = re.sub(r'\D', '', text)
        
        # Se estiver vazio após limpeza
        if not digits:
            return str(value)
        
        # Valida tamanho mínimo
        if len(digits) < 8:
            return self._handle_incomplete(str(value), digits, on_incomplete, f"muito curto ({len(digits)} dígitos)")
        
        # Detecta DDI Brasil (55)
        has_ddi = False
        ddi = ""
        
        if digits.startswith('55') and len(digits) >= 12:
            if len(digits) in [12, 13]:
                has_ddi = True
                ddi = digits[:2]
                digits = digits[2:]
        
        # 0800 (11 dígitos: 0800 XXX XXXX)
        if digits.startswith('0800'):
            if len(digits) == 11:
                result = f"0800 {digits[4:7]} {digits[7:]}"
                return f"+{ddi} {result}" if has_ddi else result
            else:
                return self._handle_incomplete(str(value), digits, on_incomplete, f"0800 incompleto ({len(digits)} dígitos, esperado 11)")
        
        # Celular com DDD (11 dígitos: XX 9XXXX-XXXX)
        if len(digits) == 11:
            ddd = digits[:2]
            primeira_parte = digits[2:7]
            segunda_parte = digits[7:]
            result = f"({ddd}) {primeira_parte}-{segunda_parte}"
            
            if has_ddi or has_plus_sign:
                return f"+{ddi or '55'} {result}"
            return result
        
        # Fixo com DDD (10 dígitos: XX XXXX-XXXX)
        if len(digits) == 10:
            ddd = digits[:2]
            primeira_parte = digits[2:6]
            segunda_parte = digits[6:]
            result = f"({ddd}) {primeira_parte}-{segunda_parte}"
            
            if has_ddi or has_plus_sign:
                return f"+{ddi or '55'} {result}"
            return result
        
        # Celular sem DDD (9 dígitos: 9XXXX-XXXX)
        if len(digits) == 9:
            if on_incomplete == 'format_partial':
                primeira_parte = digits[:5]
                segunda_parte = digits[5:]
                return f"{primeira_parte}-{segunda_parte}"
            else:
                return self._handle_incomplete(str(value), digits, on_incomplete, "sem DDD (9 dígitos)")
        
        # Fixo sem DDD (8 dígitos: XXXX-XXXX)
        if len(digits) == 8:
            if on_incomplete == 'format_partial':
                primeira_parte = digits[:4]
                segunda_parte = digits[4:]
                return f"{primeira_parte}-{segunda_parte}"
            else:
                return self._handle_incomplete(str(value), digits, on_incomplete, "sem DDD (8 dígitos)")
        
        # Tamanho não reconhecido
        return self._handle_incomplete(str(value), digits, on_incomplete, f"tamanho não reconhecido ({len(digits)} dígitos)")
    
    def _handle_incomplete(self, original_value: str, digits: str, on_incomplete: str, reason: str) -> str:
        """
        Lida com telefones incompletos baseado na estratégia configurada.
        """
        if on_incomplete == 'keep_original':
            return original_value
        
        elif on_incomplete == 'format_partial':
            if len(digits) >= 4:
                meio = len(digits) // 2
                return f"{digits[:meio]}-{digits[meio:]}"
            return digits
        
        elif on_incomplete == 'pad_zeros':
            # ✨ NOVO: Preenche com zeros até completar
            # Decide se é celular (11) ou fixo (10) baseado no tamanho atual
            if len(digits) >= 9:
                # Provavelmente celular - completa para 11 dígitos
                target_length = 11
            elif len(digits) >= 8:
                # Provavelmente fixo - completa para 10 dígitos
                target_length = 10
            else:
                # Muito curto - assume celular (11)
                target_length = 11
            
            # Preenche com zeros à esquerda
            padded = digits.zfill(target_length)
            
            # Formata o número completo (chama recursivamente sem pad_zeros)
            return self._format_phone(padded, 'keep_original')
        
        elif on_incomplete == 'error':
            print(f"❌ ERRO: Telefone incompleto - {reason}: '{original_value}'")
            return original_value
        
        elif on_incomplete == 'empty':
            return ""
        
        else:
            return original_value
    
    def _unformat_phone(self, value: Any) -> str:
        """
        Remove formatação de telefone, deixando apenas dígitos.
        """
        return re.sub(r'\D', '', str(value))