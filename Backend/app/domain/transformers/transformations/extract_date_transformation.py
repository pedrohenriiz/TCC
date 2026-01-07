from typing import Any
from datetime import datetime
from domain.transformers.transformations.base_transformation import BaseTransformation

class ExtractDateTransformation(BaseTransformation):
    """
    Transformação que extrai uma parte específica de uma data.
    """
    
    @property
    def code(self) -> str:
        return "EXTRACT_DATE"
    
    def validate_params(self) -> bool:
        if 'input_format' not in self.params:
            raise ValueError("Parâmetro 'input_format' é obrigatório para EXTRACT_DATE")
        if 'extract_part' not in self.params:
            raise ValueError("Parâmetro 'extract_part' é obrigatório para EXTRACT_DATE")
        return True
    
    def transform(self, value: Any) -> Any:
        """
        Extrai parte específica de uma data.
        
        Args:
            value: Data no formato de entrada
            
        Returns:
            Parte extraída da data
            
        Exemplos:
            "15/01/2024", input="DD/MM/YYYY", extract="day" → "15"
            "15/01/2024", input="DD/MM/YYYY", extract="month" → "01"
            "15/01/2024", input="DD/MM/YYYY", extract="year" → "2024"
            "15/01/2024", input="DD/MM/YYYY", extract="month_name" → "Janeiro"
            "15/01/2024", input="DD/MM/YYYY", extract="weekday" → "Segunda-feira"
        """
        if value is None or value == "":
            return value
        
        text = str(value).strip()
        input_format = self.params.get('input_format', 'DD/MM/YYYY')
        extract_part = self.params.get('extract_part', 'day')
        
        # Converte formato user-friendly para formato Python
        python_format = self._convert_to_python_format(input_format)
        
        try:
            # Parse da data
            date_obj = datetime.strptime(text, python_format)
            
            # Extrai a parte solicitada
            return self._extract_part(date_obj, extract_part)
            
        except ValueError as e:
            print(f"⚠️ Erro ao extrair parte da data '{value}': {e}")
            return value
    
    def _extract_part(self, date_obj: datetime, part: str) -> str:
        """
        Extrai parte específica do objeto datetime.
        """
        extractors = {
            'day': lambda d: f"{d.day:02d}",
            'month': lambda d: f"{d.month:02d}",
            'year': lambda d: str(d.year),
            'year_short': lambda d: f"{d.year % 100:02d}",  # 2024 → 24
            'month_name': lambda d: self._get_month_name(d.month),
            'month_name_short': lambda d: self._get_month_name_short(d.month),
            'weekday': lambda d: self._get_weekday_name(d.weekday()),
            'weekday_short': lambda d: self._get_weekday_name_short(d.weekday()),
            'day_of_year': lambda d: str(d.timetuple().tm_yday),  # 1-366
            'week_of_year': lambda d: str(d.isocalendar()[1]),  # 1-53
            'quarter': lambda d: str((d.month - 1) // 3 + 1),  # 1-4
        }
        
        extractor = extractors.get(part)
        
        if extractor:
            return extractor(date_obj)
        else:
            print(f"⚠️ Parte '{part}' não reconhecida")
            return str(date_obj)
    
    def _get_month_name(self, month: int) -> str:
        """Retorna nome do mês em português"""
        months = {
            1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
            5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
            9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
        }
        return months.get(month, '')
    
    def _get_month_name_short(self, month: int) -> str:
        """Retorna nome abreviado do mês em português"""
        months = {
            1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr',
            5: 'Mai', 6: 'Jun', 7: 'Jul', 8: 'Ago',
            9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
        }
        return months.get(month, '')
    
    def _get_weekday_name(self, weekday: int) -> str:
        """Retorna nome do dia da semana em português (0=Segunda)"""
        weekdays = {
            0: 'Segunda-feira', 1: 'Terça-feira', 2: 'Quarta-feira',
            3: 'Quinta-feira', 4: 'Sexta-feira', 5: 'Sábado', 6: 'Domingo'
        }
        return weekdays.get(weekday, '')
    
    def _get_weekday_name_short(self, weekday: int) -> str:
        """Retorna nome abreviado do dia da semana em português"""
        weekdays = {
            0: 'Seg', 1: 'Ter', 2: 'Qua',
            3: 'Qui', 4: 'Sex', 5: 'Sáb', 6: 'Dom'
        }
        return weekdays.get(weekday, '')
    
    def _convert_to_python_format(self, format_str: str) -> str:
        """Converte formato user-friendly para formato Python"""
        conversions = {
            'YYYY': '%Y', 'YY': '%y',
            'MM': '%m', 'M': '%m',
            'DD': '%d', 'D': '%d',
            'HH': '%H', 'mm': '%M', 'ss': '%S',
        }
        
        result = format_str
        for pattern in sorted(conversions.keys(), key=len, reverse=True):
            result = result.replace(pattern, conversions[pattern])
        
        return result