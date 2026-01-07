from typing import Any
from domain.transformers.transformations.base_transformation import BaseTransformation

class PadTransformation(BaseTransformation):
    """
    Transformação que preenche o texto com caracteres até atingir um tamanho.
    """
    
    @property
    def code(self) -> str:
        return "PAD"
    
    def validate_params(self) -> bool:
        if 'length' not in self.params:
            raise ValueError("Parâmetro 'length' é obrigatório para PAD")
        if 'direction' not in self.params:
            raise ValueError("Parâmetro 'direction' é obrigatório para PAD")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Preenche o texto com caracteres.
        
        Exemplos:
            "123", length=6, char="0", direction="left" → "000123"
            "abc", length=5, char="*", direction="right" → "abc**"
            "hi", length=10, char="ab", direction="left" → "abababhi"
        """
        if value is None or value == "":
            return value
        
        text = str(value)
        length = int(self.params.get('length', 10))
        char = self.params.get('char', '0')
        direction = self.params.get('direction', 'left')
        
        # Se já tem o tamanho ou é maior, não faz nada
        if len(text) >= length:
            return text
        
        # Calcula quantos caracteres faltam
        padding_needed = length - len(text)
        
        # ✨ Se char tem múltiplos caracteres, repete o padrão
        if len(char) == 0:
            char = '0'  # padrão se vier vazio
        
        # Repete o padrão até ter caracteres suficientes
        padding = (char * ((padding_needed // len(char)) + 1))[:padding_needed]
        
        if direction == 'left':
            return padding + text
        else:  # right
            return text + padding