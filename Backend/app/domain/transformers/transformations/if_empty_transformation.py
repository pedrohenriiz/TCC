from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class IfEmptyTransformation(BaseTransformation):
    """
    Transformação que retorna um valor padrão se o valor estiver vazio.
    """
    
    @property
    def code(self) -> str:
        return "IF_EMPTY"
    
    def validate_params(self) -> bool:
        if 'default_value' not in self.params:
            raise ValueError("Parâmetro 'default_value' é obrigatório para IF_EMPTY")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Retorna valor padrão se o valor estiver vazio.
        
        Args:
            value: Valor a verificar
            
        Returns:
            Valor original ou valor padrão se vazio
            
        Exemplos:
            "", default="N/A" → "N/A"
            "   ", default="N/A" → "N/A" (se trim_before=true)
            "João", default="N/A" → "João"
            None, default="0" → "0"
        """
        # Verifica se deve fazer trim antes de verificar se está vazio
        trim_before = self.params.get('trim_before', 'true')
        
        # Converte string "true"/"false" para boolean
        if isinstance(trim_before, str):
            trim_before = trim_before.lower() == 'true'
        else:
            trim_before = bool(trim_before)
        
        # Processa o valor
        if value is None:
            is_empty = True
        elif isinstance(value, str):
            check_value = value.strip() if trim_before else value
            is_empty = check_value == ""
        else:
            # Outros tipos (números, booleanos, etc)
            is_empty = False
        
        if is_empty:
            default_value = self.params.get('default_value', '')
            return default_value
        else:
            return value