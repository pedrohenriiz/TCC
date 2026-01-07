from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class IfNullTransformation(BaseTransformation):
    """
    Transformação que retorna um valor padrão se o valor for null/None.
    """
    
    @property
    def code(self) -> str:
        return "IF_NULL"
    
    def validate_params(self) -> bool:
        if 'default_value' not in self.params:
            raise ValueError("Parâmetro 'default_value' é obrigatório para IF_NULL")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Retorna valor padrão se o valor for null/None.
        
        Args:
            value: Valor a verificar
            
        Returns:
            Value original ou valor padrão se null
            
        Exemplos:
            None, default="0" → "0"
            null, default="N/A" → "N/A"
            "", default="N/A" → "" (vazio não é null)
            "João", default="N/A" → "João"
            0, default="N/A" → 0 (zero não é null)
        """
        # Verifica se deve considerar strings vazias como null
        treat_empty_as_null = self.params.get('treat_empty_as_null', 'false')
        
        # Converte string "true"/"false" para boolean
        if isinstance(treat_empty_as_null, str):
            treat_empty_as_null = treat_empty_as_null.lower() == 'true'
        else:
            treat_empty_as_null = bool(treat_empty_as_null)
        
        # Verifica se é null
        is_null = value is None
        
        # Se configurado, também considera strings vazias como null
        if treat_empty_as_null and isinstance(value, str) and value.strip() == "":
            is_null = True
        
        if is_null:
            default_value = self.params.get('default_value', '')
            return default_value
        else:
            return value