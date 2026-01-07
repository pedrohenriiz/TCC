from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class ConcatTransformation(BaseTransformation):
    """
    Transformação que concatena o valor com um texto adicional.
    """
    
    @property
    def code(self) -> str:
        return "CONCAT"
    
    def validate_params(self) -> bool:
        """
        Valida se pelo menos um dos parâmetros foi fornecido.
        """
        if 'prefix' not in self.params and 'suffix' not in self.params:
            raise ValueError("Pelo menos um parâmetro ('prefix' ou 'suffix') é obrigatório para CONCAT")
        
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Concatena prefixo e/ou sufixo ao valor.
        
        Args:
            value: Valor a ser processado
            
        Returns:
            Valor concatenado
            
        Exemplos:
            value="João", prefix="Sr. " → "Sr. João"
            value="Silva", suffix=" Jr." → "Silva Jr."
            value="Maria", prefix="Dra. ", suffix=" Santos" → "Dra. Maria Santos"
        """
        if value is None:
            value = ""
        
        text = str(value)
        prefix = self.params.get('prefix', '')
        suffix = self.params.get('suffix', '')
        
        # ✨ DEBUG
        print(f"🔍 CONCAT Debug:")
        print(f"  Valor original: '{text}'")
        print(f"  Params recebidos: {self.params}")
        print(f"  Prefix: '{prefix}'")
        print(f"  Suffix: '{suffix}'")
        
        result = f"{prefix}{text}{suffix}"
        
        print(f"  Resultado: '{result}'")
        
        return result