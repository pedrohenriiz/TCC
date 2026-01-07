from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class ReplaceTransformation(BaseTransformation):
    """
    Transformação que substitui um texto por outro.
    """
    
    @property
    def code(self) -> str:
        return "REPLACE"
    
    def validate_params(self) -> bool:
        """
        Valida se os parâmetros 'search' e 'replace' foram fornecidos.
        """
        if 'search' not in self.params:
            raise ValueError("Parâmetro 'search' é obrigatório para REPLACE")
        
        if 'replace' not in self.params:
            raise ValueError("Parâmetro 'replace' é obrigatório para REPLACE")
        
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Substitui todas as ocorrências de um texto por outro.
        
        Args:
            value: Valor a ser processado
            
        Returns:
            Valor com substituições realizadas
            
        Exemplos:
            value="João-Silva", search="-", replace=" " → "João Silva"
            value="123.456.789-00", search=".", replace="" → "123456789-00"
        """
        if value is None or value == "":
            return value
        
        search = self.params.get('search', '')
        replace_with = self.params.get('replace', '')
        
        return str(value).replace(search, replace_with)