from typing import Any, Callable
from domain.transformers.transformations.base_transformation import BaseTransformation

class MathOperationTransformation(BaseTransformation):
    """
    Transformação que realiza operações matemáticas.
    """
    
    @property
    def code(self) -> str:
        return "MATH_OPERATION"
    
    def validate_params(self) -> bool:
        if 'operation' not in self.params:
            raise ValueError("Parâmetro 'operation' é obrigatório")
        if 'operand' not in self.params:
            raise ValueError("Parâmetro 'operand' é obrigatório")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Realiza operação matemática.
        
        Exemplos:
            10, operation="ADD", operand=5 → 15
            20, operation="MULTIPLY", operand=2 → 40
            100, operation="DIVIDE", operand=4 → 25
            50, operation="SUBTRACT", operand=10 → 40
        """
        if value is None or value == "":
            return value
        
        try:
            num = float(str(value).replace(',', '.'))
            operand = float(str(self.params.get('operand')).replace(',', '.'))
        except ValueError:
            print(f"⚠️ Erro ao converter valores para número")
            return value
        
        operation = self.params.get('operation', 'ADD')
        
        # ✨ Dicionário de operações matemáticas
        operations: dict[str, Callable[[float, float], float]] = {
            'ADD': lambda a, b: a + b,
            'SUBTRACT': lambda a, b: a - b,
            'MULTIPLY': lambda a, b: a * b,
            'DIVIDE': self._safe_divide,
        }
        
        # Executa a operação ou retorna valor original se não encontrar
        operation_func = operations.get(operation)
        
        if operation_func:
            return operation_func(num, operand)
        else:
            print(f"⚠️ Operação '{operation}' não reconhecida")
            return value
    
    def _safe_divide(self, num: float, operand: float) -> float:
        """Divisão segura que trata divisão por zero"""
        if operand == 0:
            print("⚠️ Divisão por zero detectada")
            raise ValueError("Divisão por zero")
        return num / operand