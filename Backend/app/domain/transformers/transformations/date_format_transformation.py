from typing import Any
from datetime import datetime
from domain.transformers.transformations.base_transformation import BaseTransformation

class DateFormatTransformation(BaseTransformation):
    """
    Transformação que formata datas de um formato para outro.
    """
    
    @property
    def code(self) -> str:
        return "DATE_FORMAT"
    
    def validate_params(self) -> bool:
        if 'input_format' not in self.params:
            raise ValueError("Parâmetro 'input_format' é obrigatório para DATE_FORMAT")
        if 'output_format' not in self.params:
            raise ValueError("Parâmetro 'output_format' é obrigatório para DATE_FORMAT")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Converte data de um formato para outro.
        
        Args:
            value: Data no formato de entrada
            
        Returns:
            Data no formato de saída
            
        Exemplos:
            "15/01/2024", input="DD/MM/YYYY", output="YYYY-MM-DD" → "2024-01-15"
            "2024-01-15", input="YYYY-MM-DD", output="DD/MM/YYYY" → "15/01/2024"
            "01-15-2024", input="MM-DD-YYYY", output="DD/MM/YYYY" → "15/01/2024"
        """
        if value is None or value == "":
            return value
        
        text = str(value).strip()
        input_format = self.params.get('input_format', 'DD/MM/YYYY')
        output_format = self.params.get('output_format', 'YYYY-MM-DD')
        
        # Converte formato user-friendly para formato Python
        python_input = self._convert_to_python_format(input_format)
        python_output = self._convert_to_python_format(output_format)
        
        try:
            # Parse da data no formato de entrada
            date_obj = datetime.strptime(text, python_input)
            
            # Formata no formato de saída
            return date_obj.strftime(python_output)
        except ValueError as e:
            print(f"⚠️ Erro ao converter data '{value}' de '{input_format}' para '{output_format}': {e}")
            return value
    
    def _convert_to_python_format(self, format_str: str) -> str:
        """
        Converte formato user-friendly (DD/MM/YYYY) para formato Python (%d/%m/%Y).
        
        Args:
            format_str: Formato user-friendly
            
        Returns:
            Formato Python
        """
        conversions = {
            'YYYY': '%Y',  # Ano com 4 dígitos
            'YY': '%y',    # Ano com 2 dígitos
            'MM': '%m',    # Mês com 2 dígitos
            'M': '%m',     # Mês (aceita 1 ou 2 dígitos)
            'DD': '%d',    # Dia com 2 dígitos
            'D': '%d',     # Dia (aceita 1 ou 2 dígitos)
            'HH': '%H',    # Hora (00-23)
            'mm': '%M',    # Minutos
            'ss': '%S',    # Segundos
        }
        
        result = format_str
        # Ordena por tamanho decrescente para evitar substituições parciais
        for pattern in sorted(conversions.keys(), key=len, reverse=True):
            result = result.replace(pattern, conversions[pattern])
        
        return result