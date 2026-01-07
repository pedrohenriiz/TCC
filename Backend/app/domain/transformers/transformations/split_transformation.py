from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class SplitTransformation(BaseTransformation):
    """
    Transformação que divide um texto usando um separador 
    e retorna a parte especificada pelo índice.
    """
    
    @property
    def code(self) -> str:
        return "SPLIT"
    
    def validate_params(self) -> bool:
        """
        Valida se os parâmetros 'separator' e 'index' foram fornecidos.
        """
        if 'separator' not in self.params:
            raise ValueError("Parâmetro 'separator' é obrigatório para SPLIT")
        
        if 'index' not in self.params:
            raise ValueError("Parâmetro 'index' é obrigatório para SPLIT")
        
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Divide o valor usando o separador e retorna o elemento no índice especificado.
        
        Args:
            value: Valor a ser dividido
            
        Returns:
            Parte do texto no índice especificado ou valor original se o índice for inválido
            
        Exemplos:
            value="João Silva Santos", separator=" ", index=0 → "João"
            value="João Silva Santos", separator=" ", index=1 → "Silva"
            value="João Silva Santos", separator=" ", index=-1 → "Santos"
        """
        if value is None or value == "":
            return value
        
        separator = self.params.get('separator', ' ')
        index = int(self.params.get('index', 0))
        
        # Divide o texto
        parts = str(value).split(separator)
        
        # Retorna a parte no índice especificado
        try:
            return parts[index]
        except IndexError:
            # Se o índice não existir, retorna o valor original
            print(f"⚠️ Índice {index} fora do range para '{value}' (total de partes: {len(parts)})")
            return value