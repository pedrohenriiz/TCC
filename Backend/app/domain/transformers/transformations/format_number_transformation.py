from typing import Any, Callable
from domain.transformers.transformations.base_transformation import BaseTransformation

class FormatNumberTransformation(BaseTransformation):
    """
    Transformação que formata números em diferentes estilos.
    """
    
    @property
    def code(self) -> str:
        return "FORMAT_NUMBER"
    
    def validate_params(self) -> bool:
        """
        Valida se o parâmetro 'format_type' foi fornecido.
        """
        if 'format_type' not in self.params:
            raise ValueError("Parâmetro 'format_type' é obrigatório para FORMAT_NUMBER")
        
        valid_formats = ['BRL', 'USD', 'EUR', 'PERCENT', 'DECIMAL']
        if self.params['format_type'] not in valid_formats:
            raise ValueError(f"format_type deve ser um de: {valid_formats}")
        
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Formata número de acordo com o tipo especificado.
        
        Args:
            value: Valor numérico a ser formatado
            
        Returns:
            Número formatado como string
            
        Exemplos:
            value=1234.56, format_type="BRL" → "R$ 1.234,56"
            value=1234.56, format_type="USD" → "$ 1,234.56"
            value=0.85, format_type="PERCENT" → "85%"
            value=1234.567, format_type="DECIMAL", decimals=2 → "1.234,57"
        """
        if value is None or value == "":
            return value
        
        try:
            # Converte para float
            num = float(str(value).replace(',', '.'))
        except ValueError:
            print(f"⚠️ Não foi possível converter '{value}' para número")
            return value
        
        format_type = self.params.get('format_type', 'DECIMAL')
        decimals = int(self.params.get('decimals', 2))
        
        # ✨ Dicionário de estratégias de formatação
        formatters: dict[str, Callable[[float, int], str]] = {
            'BRL': self._format_brl,
            'USD': self._format_usd,
            'EUR': self._format_eur,
            'PERCENT': self._format_percent,
            'DECIMAL': self._format_decimal,
        }
        
        # Pega o formatter ou retorna valor original se não encontrar
        formatter = formatters.get(format_type)
        
        if formatter:
            return formatter(num, decimals)
        else:
            print(f"⚠️ Formato '{format_type}' não reconhecido")
            return value
    
    def _format_brl(self, num: float, decimals: int) -> str:
        """Formata como Real Brasileiro: 1234.56 → "R$ 1.234,56" """
        formatted = self._format_with_separators(num, decimals, '.', ',')
        return f"R$ {formatted}"
    
    def _format_usd(self, num: float, decimals: int) -> str:
        """Formata como Dólar Americano: 1234.56 → "$ 1,234.56" """
        formatted = self._format_with_separators(num, decimals, ',', '.')
        return f"$ {formatted}"
    
    def _format_eur(self, num: float, decimals: int) -> str:
        """Formata como Euro: 1234.56 → "€ 1.234,56" """
        formatted = self._format_with_separators(num, decimals, '.', ',')
        return f"€ {formatted}"
    
    def _format_percent(self, num: float, decimals: int) -> str:
        """Formata como porcentagem: 0.85 → "85%" """
        percent = num * 100
        formatted = f"{percent:.{decimals}f}".replace('.', ',')
        return f"{formatted}%"
    
    def _format_decimal(self, num: float, decimals: int) -> str:
        """Formata como decimal (padrão brasileiro): 1234.567 → "1.234,57" """
        return self._format_with_separators(num, decimals, '.', ',')
    
    def _format_with_separators(self, num: float, decimals: int, 
                                 thousand_sep: str, decimal_sep: str) -> str:
        """
        Formata número com separadores customizados.
        
        Args:
            num: Número a formatar
            decimals: Casas decimais
            thousand_sep: Separador de milhar
            decimal_sep: Separador decimal
        """
        # Arredonda
        rounded = round(num, decimals)
        
        # Separa inteiro e decimal
        int_part = int(abs(rounded))
        dec_part = abs(rounded) - int_part
        
        # Formata parte inteira com separador de milhar
        int_str = str(int_part)
        
        # Adiciona separadores de milhar
        if len(int_str) > 3:
            parts = []
            for i in range(len(int_str), 0, -3):
                start = max(0, i - 3)
                parts.insert(0, int_str[start:i])
            int_str = thousand_sep.join(parts)
        
        # Formata parte decimal
        if decimals > 0:
            dec_str = f"{dec_part:.{decimals}f}".split('.')[1]
            result = f"{int_str}{decimal_sep}{dec_str}"
        else:
            result = int_str
        
        # Adiciona sinal negativo se necessário
        if num < 0:
            result = f"-{result}"
        
        return result