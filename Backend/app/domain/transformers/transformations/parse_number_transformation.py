from typing import Any
import re
from domain.transformers.transformations.base_transformation import BaseTransformation

class ParseNumberTransformation(BaseTransformation):
    """
    Transformação que remove formatação de números e retorna valor numérico puro.
    """
    
    @property
    def code(self) -> str:
        return "PARSE_NUMBER"
    
    def transform(self, value: Any) -> Any:
        """
        Remove formatação de número e retorna valor puro.
        
        Args:
            value: Valor formatado a ser parseado
            
        Returns:
            Número sem formatação
            
        Exemplos:
            "R$ 1.234,56" → 1234.56
            "$ 1,234.56" → 1234.56
            "€ 1.234,56" → 1234.56
            "85%" → 0.85
            "1.234.567,89" → 1234567.89
            "-R$ 500,00" → -500.0
        """
        if value is None or value == "":
            return value
        
        text = str(value).strip()
        
        # Detecta se é porcentagem
        is_percent = '%' in text
        
        # Remove símbolos de moeda e outros caracteres não numéricos
        # Mantém apenas: dígitos, vírgula, ponto, sinal negativo
        cleaned = re.sub(r'[^\d,.\-]', '', text)
        
        # Se estiver vazio após limpeza, retorna o valor original
        if not cleaned or cleaned == '-':
            print(f"⚠️ Não foi possível parsear '{value}'")
            return value
        
        # Detecta o formato (vírgula ou ponto como separador decimal)
        # Se tem vírgula depois de ponto, formato BR (1.234,56)
        # Se tem ponto depois de vírgula, formato US (1,234.56)
        if ',' in cleaned and '.' in cleaned:
            last_comma = cleaned.rfind(',')
            last_dot = cleaned.rfind('.')
            
            if last_comma > last_dot:
                # Formato BR: 1.234,56 ou formato EU
                cleaned = cleaned.replace('.', '').replace(',', '.')
            else:
                # Formato US: 1,234.56
                cleaned = cleaned.replace(',', '')
        elif ',' in cleaned:
            # Só tem vírgula - pode ser decimal ou separador de milhar
            # Se tem mais de uma vírgula, é separador de milhar
            # Se tem só uma vírgula, provavelmente é decimal
            comma_count = cleaned.count(',')
            if comma_count == 1:
                # Verifica se tem dígitos depois da vírgula
                parts = cleaned.split(',')
                if len(parts[1]) <= 2:
                    # Provavelmente decimal: 1234,56
                    cleaned = cleaned.replace(',', '.')
                else:
                    # Provavelmente milhar: 1,234
                    cleaned = cleaned.replace(',', '')
            else:
                # Múltiplas vírgulas, é separador de milhar
                cleaned = cleaned.replace(',', '')
        # Se só tem ponto, deixa como está (já é formato US)
        
        try:
            num = float(cleaned)
            
            # Se era porcentagem, divide por 100
            if is_percent:
                num = num / 100
            
            return num
        except ValueError:
            print(f"⚠️ Erro ao converter '{value}' (cleaned: '{cleaned}') para número")
            return value