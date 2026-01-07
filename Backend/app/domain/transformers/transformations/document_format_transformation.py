from typing import Any
import re
from domain.transformers.transformations.base_transformation import BaseTransformation

class DocumentFormatTransformation(BaseTransformation):
    """
    Transformação que formata ou desformata documentos brasileiros.
    """
    
    @property
    def code(self) -> str:
        return "DOCUMENT_FORMAT"
    
    def validate_params(self) -> bool:
        if 'document_type' not in self.params:
            raise ValueError("Parâmetro 'document_type' é obrigatório para DOCUMENT_FORMAT")
        if 'action' not in self.params:
            raise ValueError("Parâmetro 'action' é obrigatório para DOCUMENT_FORMAT")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Formata ou desformata documentos brasileiros.
        
        Args:
            value: Documento
            
        Returns:
            Documento formatado ou desformatado
            
        Exemplos:
            CPF FORMAT: "12345678900" → "123.456.789-00"
            CPF UNFORMAT: "123.456.789-00" → "12345678900"
            
            CNPJ FORMAT: "12345678000190" → "12.345.678/0001-90"
            CNPJ UNFORMAT: "12.345.678/0001-90" → "12345678000190"
        """
        if value is None or value == "":
            return value
        
        document_type = self.params.get('document_type', 'CPF')
        action = self.params.get('action', 'format')
        on_incomplete = self.params.get('on_incomplete', 'keep_original')
        
        if action == 'format':
            return self._format_document(value, document_type, on_incomplete)
        elif action == 'unformat':
            return self._unformat_document(value)
        else:
            print(f"⚠️ Ação '{action}' não reconhecida")
            return value
    
    def _format_document(self, value: Any, document_type: str, on_incomplete: str) -> str:
        """
        Formata documento baseado no tipo.
        """
        # Remove tudo que não é dígito
        digits = re.sub(r'\D', '', str(value))
        
        if not digits:
            return str(value)
        
        formatters = {
            'CPF': (self._format_cpf, 11),
            'CNPJ': (self._format_cnpj, 14),
            'RG': (self._format_rg, [7, 8, 9]),  # RG aceita múltiplos tamanhos
            'CNH': (self._format_cnh, 11),
            'PIS': (self._format_pis, 11),
            'TITULO_ELEITOR': (self._format_titulo_eleitor, 12),
        }
        
        formatter_data = formatters.get(document_type.upper())
        
        if not formatter_data:
            print(f"⚠️ Tipo de documento '{document_type}' não reconhecido")
            return str(value)
        
        formatter, expected_length = formatter_data
        
        # Valida tamanho
        is_valid_length = False
        if isinstance(expected_length, list):
            # RG aceita múltiplos tamanhos
            is_valid_length = len(digits) in expected_length
            expected_str = f"entre {min(expected_length)} e {max(expected_length)}"
        else:
            is_valid_length = len(digits) == expected_length
            expected_str = str(expected_length)
        
        if not is_valid_length:
            return self._handle_incomplete(
                str(value), 
                digits,
                on_incomplete, 
                document_type,
                f"tamanho inválido ({len(digits)} dígitos, esperado {expected_str})"
            )
        
        return formatter(digits)
    
    def _handle_incomplete(self, original_value: str, digits: str, on_incomplete: str, 
                          document_type: str, reason: str) -> str:
        """
        Lida com documentos incompletos baseado na estratégia configurada.
        
        Args:
            original_value: Valor original
            digits: Apenas os dígitos
            on_incomplete: Estratégia (keep_original, format_partial, pad_zeros, error, empty)
            document_type: Tipo do documento
            reason: Motivo de estar incompleto
        """
        if on_incomplete == 'keep_original':
            # Mantém valor original
            return original_value
        
        elif on_incomplete == 'format_partial':
            # Formata o que for possível (sem validar tamanho)
            if document_type == 'CPF' and len(digits) >= 9:
                return f"{digits[:3]}.{digits[3:6]}.{digits[6:9]}" + (f"-{digits[9:]}" if len(digits) > 9 else "")
            elif document_type == 'CNPJ' and len(digits) >= 12:
                return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}/{digits[8:12]}" + (f"-{digits[12:]}" if len(digits) > 12 else "")
            else:
                return digits
        
        elif on_incomplete == 'pad_zeros':
            # Preenche com zeros à esquerda até o tamanho correto
            expected_lengths = {
                'CPF': 11,
                'CNPJ': 14,
                'RG': 9,
                'CNH': 11,
                'PIS': 11,
                'TITULO_ELEITOR': 12,
            }
            
            expected_length = expected_lengths.get(document_type, len(digits))
            padded = digits.zfill(expected_length)
            
            # Formata o documento com zeros adicionados
            return self._format_document(padded, document_type, 'keep_original')
        
        elif on_incomplete == 'error':
            # Registra erro e retorna original
            print(f"❌ ERRO: Documento {document_type} incompleto - {reason}: '{original_value}'")
            return original_value
        
        elif on_incomplete == 'empty':
            # Retorna vazio
            return ""
        
        else:
            # Padrão: mantém original
            return original_value
    
    def _format_cpf(self, digits: str) -> str:
        """Formata CPF: 12345678900 → 123.456.789-00"""
        return f"{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}"
    
    def _format_cnpj(self, digits: str) -> str:
        """Formata CNPJ: 12345678000190 → 12.345.678/0001-90"""
        return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}/{digits[8:12]}-{digits[12:]}"
    
    def _format_rg(self, digits: str) -> str:
        """
        Formata RG: 123456789 → 12.345.678-9
        Aceita RGs de 7 a 9 dígitos (varia por estado)
        """
        if len(digits) == 9:
            return f"{digits[:2]}.{digits[2:5]}.{digits[5:8]}-{digits[8]}"
        elif len(digits) == 8:
            return f"{digits[0]}.{digits[1:4]}.{digits[4:7]}-{digits[7]}"
        elif len(digits) == 7:
            return f"{digits[:3]}.{digits[3:6]}-{digits[6]}"
        else:
            return digits
    
    def _format_cnh(self, digits: str) -> str:
        """Formata CNH: 12345678900 → 123456789-00"""
        return f"{digits[:9]}-{digits[9:]}"
    
    def _format_pis(self, digits: str) -> str:
        """Formata PIS/PASEP: 12345678901 → 123.45678.90-1"""
        return f"{digits[:3]}.{digits[3:8]}.{digits[8:10]}-{digits[10]}"
    
    def _format_titulo_eleitor(self, digits: str) -> str:
        """Formata Título de Eleitor: 123456789012 → 1234 5678 9012"""
        return f"{digits[:4]} {digits[4:8]} {digits[8:]}"
    
    def _unformat_document(self, value: Any) -> str:
        """Remove formatação de documento, deixando apenas dígitos."""
        return re.sub(r'\D', '', str(value))