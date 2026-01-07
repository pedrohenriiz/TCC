from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

class BaseTransformation(ABC):
    """
    Classe base para todas as transformações.
    Cada transformação deve herdar desta classe e implementar o método transform.
    """
    
    def __init__(self, params: Optional[Dict[str, Any]] = None):
        """
        Args:
            params: Dicionário com os parâmetros da transformação
                   Ex: {'target_column': 'name', 'locale': 'pt-BR'}
        """
        self.params = params or {}
    
    @abstractmethod
    def transform(self, value: Any) -> Any:
        """
        Aplica a transformação no valor recebido.
        
        Args:
            value: Valor a ser transformado
            
        Returns:
            Valor transformado
        """
        pass
    
    @property
    @abstractmethod
    def code(self) -> str:
        """
        Código único que identifica a transformação.
        Deve corresponder ao campo 'code' na tabela transformation_type.
        
        Returns:
            Código da transformação (ex: 'UPPERCASE', 'LOWERCASE')
        """
        pass
    
    def validate_params(self) -> bool:
        """
        Valida se os parâmetros necessários foram fornecidos.
        Pode ser sobrescrito por transformações que precisam de parâmetros obrigatórios.
        
        Returns:
            True se os parâmetros são válidos
        """
        return True