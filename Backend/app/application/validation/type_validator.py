# application/validation/type_validator.py

from typing import Any, Optional, Callable
from application.validation.validation_error import ValidationError

class TypeValidator:
    """
    Valida compatibilidade entre tipos de dados origem e destino
    
    Implementa Opção 3 (Híbrida):
    - Conversões seguras são permitidas automaticamente
    - Conversões arriscadas geram erro/warning
    - Validação usa tipos explícitos (não infere)
    """
    
    # ============================================================
    # CONVERSÕES SEGURAS (sem perda de dados)
    # ============================================================
    SAFE_CONVERSIONS: dict[tuple[str, str], Callable | str] = {
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ORIGEM: NUMBER
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Number → Texto (sempre seguro)
        ('number', 'varchar'): lambda x: str(x),
        ('number', 'text'): lambda x: str(x),
        
        # Number → Number (sempre seguro se destino é maior/igual)
        ('number', 'int'): 'validate_integer',
        ('number', 'decimal'): lambda x: float(x),
        ('number', 'float'): lambda x: float(x),
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ORIGEM: TEXT
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Text → Text (sempre seguro)
        ('text', 'varchar'): lambda x: str(x),
        ('text', 'text'): lambda x: str(x),
        
        # Text → Number (VALIDA se é numérico)
        ('text', 'int'): 'validate_integer',
        ('text', 'decimal'): 'validate_decimal',
        ('text', 'float'): 'validate_decimal',
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ORIGEM: DATE
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Date → Texto (sempre seguro)
        ('date', 'varchar'): lambda x: str(x),
        ('date', 'text'): lambda x: str(x),
        
        # Date → Date (sempre seguro)
        ('date', 'date'): lambda x: str(x),
        ('date', 'datetime'): lambda x: str(x),
        ('date', 'timestamp'): lambda x: str(x),
        
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # ORIGEM: BOOLEAN
        # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        # Boolean → Number (sempre seguro)
        ('boolean', 'int'): lambda x: 1 if x in ['true', 'True', '1', True] else 0,
        ('boolean', 'decimal'): lambda x: 1.0 if x in ['true', 'True', '1', True] else 0.0,
        ('boolean', 'float'): lambda x: 1.0 if x in ['true', 'True', '1', True] else 0.0,
        
        # Boolean → Texto (sempre seguro)
        ('boolean', 'varchar'): lambda x: str(x).lower(),
        ('boolean', 'text'): lambda x: str(x).lower(),
        
        # Boolean → Boolean (sempre seguro)
        ('boolean', 'boolean'): lambda x: x,
    }
    
    # ============================================================
    # CONVERSÕES QUE REQUEREM TRANSFORMAÇÃO EXPLÍCITA
    # ============================================================
    REQUIRES_TRANSFORMATION: set[tuple[str, str]] = {
        # Text → Date (formato pode variar)
        ('text', 'date'),
        ('text', 'datetime'),
        ('text', 'timestamp'),
        
        # Text → Boolean (representação varia: "sim", "yes", "1", "true")
        ('text', 'boolean'),
        
        # Number → Date (qual formato? Timestamp? YYYYMMDD?)
        ('number', 'date'),
        ('number', 'datetime'),
        ('number', 'timestamp'),
        
        # Date → Number (qual formato? Timestamp? YYYYMMDD?)
        ('date', 'int'),
        ('date', 'decimal'),
        ('date', 'float'),
    }
    
    def validate_value(
        self,
        value: Any,
        origin_type: str,
        origin_size: Optional[int],
        destiny_type: str,
        destiny_size: Optional[int],
        column_name: str,
        row_index: int,
        table_name: str
    ) -> Optional[ValidationError]:
        """
        Valida se valor é compatível com tipo de destino
        
        Args:
            value: Valor a ser validado
            origin_type: Tipo da coluna origem (ex: 'varchar')
            origin_size: Tamanho da coluna origem (ex: 80)
            destiny_type: Tipo da coluna destino (ex: 'int')
            destiny_size: Tamanho da coluna destino
            column_name: Nome da coluna
            row_index: Índice da linha
            table_name: Nome da tabela
        
        Returns:
            ValidationError se incompatível, None se válido
        """
        
        # NULL/vazio será validado por outro validator
        if value is None or value == '':
            return None
        
        # Normaliza tipos para lowercase
        origin_type = origin_type.lower() if origin_type else 'varchar'
        destiny_type = destiny_type.lower() if destiny_type else 'varchar'
        
        # Tipos idênticos - só valida tamanho
        if origin_type == destiny_type:
            return self._validate_size(
                value, origin_type, origin_size, destiny_size,
                column_name, row_index, table_name
            )
        
        conversion_key = (origin_type, destiny_type)
        
        # ✅ Conversão segura permitida
        if conversion_key in self.SAFE_CONVERSIONS:
            return self._validate_safe_conversion(
                value, conversion_key,
                column_name, row_index, table_name,
                origin_type, destiny_type, destiny_size
            )
        
        # ⚠️ Conversão precisa de transformação
        elif conversion_key in self.REQUIRES_TRANSFORMATION:
            return ValidationError(
                row_index=row_index,
                table=table_name,
                column=column_name,
                error_type='type_requires_transformation',
                message=f"Conversão {origin_type} → {destiny_type} requer transformação explícita",
                value=value,
                severity='warning',
                related_error=self._get_transformation_suggestion(origin_type, destiny_type)
            )
        
        # ❌ Tipos incompatíveis
        else:
            return ValidationError(
                row_index=row_index,
                table=table_name,
                column=column_name,
                error_type='type_incompatible',
                message=f"Tipos incompatíveis: {origin_type} → {destiny_type}",
                value=value,
                severity='error',
                related_error="Revise o mapeamento - esses tipos não podem ser convertidos"
            )
    
    def _validate_safe_conversion(
        self,
        value: Any,
        conversion_key: tuple[str, str],
        column_name: str,
        row_index: int,
        table_name: str,
        origin_type: str,
        destiny_type: str,
        destiny_size: Optional[int]
    ) -> Optional[ValidationError]:
        """Valida conversões marcadas como seguras"""
        
        converter = self.SAFE_CONVERSIONS[conversion_key]
        
        # Se é função, tenta converter
        if callable(converter):
            try:
                converted = converter(value)
                
                # Se converteu para string, valida tamanho
                if destiny_type in ['varchar', 'text'] and destiny_size:
                    if len(str(converted)) > destiny_size:
                        return ValidationError(
                            row_index=row_index,
                            table=table_name,
                            column=column_name,
                            error_type='string_too_long',
                            message=f"Texto excede tamanho máximo de {destiny_size} caracteres",
                            value=value,
                            severity='error',
                            related_error=f"Valor tem {len(str(converted))} caracteres, máximo é {destiny_size}"
                        )
                
                return None  # Conversão OK
                
            except Exception as e:
                return ValidationError(
                    row_index=row_index,
                    table=table_name,
                    column=column_name,
                    error_type='conversion_failed',
                    message=f"Falha ao converter {origin_type} → {destiny_type}",
                    value=value,
                    severity='error',
                    related_error=f"Erro: {str(e)}"
                )
        
        # Se é string, chama validador específico
        elif converter == 'validate_integer':
            if not self._is_valid_integer(value):
                return ValidationError(
                    row_index=row_index,
                    table=table_name,
                    column=column_name,
                    error_type='not_numeric_integer',
                    message=f"Valor '{value}' não é um número inteiro válido",
                    value=value,
                    severity='error',
                    related_error="Use transformação REGEX_EXTRACT ou STRING_TO_INT, ou corrija o valor na origem"
                )
        
        elif converter == 'validate_decimal':
            if not self._is_valid_decimal(value):
                return ValidationError(
                    row_index=row_index,
                    table=table_name,
                    column=column_name,
                    error_type='not_numeric_decimal',
                    message=f"Valor '{value}' não é um número decimal válido",
                    value=value,
                    severity='error',
                    related_error="Use transformação STRING_TO_DECIMAL ou corrija o valor na origem"
                )
        
        return None
    
    def _validate_size(
        self,
        value: Any,
        data_type: str,
        origin_size: Optional[int],
        destiny_size: Optional[int],
        column_name: str,
        row_index: int,
        table_name: str
    ) -> Optional[ValidationError]:
        """Valida se valor cabe no tamanho definido"""
        
        # Só valida tamanho para VARCHAR
        if data_type not in ['varchar'] or not destiny_size:
            return None
        
        value_length = len(str(value))
        
        if value_length > destiny_size:
            return ValidationError(
                row_index=row_index,
                table=table_name,
                column=column_name,
                error_type='string_too_long',
                message=f"Texto excede tamanho máximo de {destiny_size} caracteres",
                value=value,
                severity='error',
                related_error=f"Valor tem {value_length} caracteres, máximo é {destiny_size}"
            )
        
        return None
    
    def _is_valid_integer(self, value: Any) -> bool:
        """Verifica se valor pode ser convertido para INT"""
        try:
            str_value = str(value).strip()
            
            # Remove espaços e tenta converter
            int_value = int(str_value)
            
            # Verifica se não perdeu informação
            # "25" OK, "25.0" OK, mas "25.7" falha
            float_value = float(str_value)
            return float_value == int_value
            
        except (ValueError, TypeError):
            return False
    
    def _is_valid_decimal(self, value: Any) -> bool:
        """Verifica se valor pode ser convertido para DECIMAL/FLOAT"""
        try:
            float(str(value).strip())
            return True
        except (ValueError, TypeError):
            return False
    
    def _get_transformation_suggestion(self, origin: str, destiny: str) -> str:
        """Sugere transformação apropriada"""
        
        suggestions = {
            # Text → Date
            ('text', 'date'): "Use DATE_FORMAT para converter (ex: DD/MM/YYYY → YYYY-MM-DD)",
            ('text', 'datetime'): "Use DATETIME_FORMAT para converter",
            ('text', 'timestamp'): "Use TIMESTAMP_FORMAT para converter",
            
            # Text → Boolean
            ('text', 'boolean'): "Use STRING_TO_BOOLEAN (aceita: true/false, yes/no, 1/0, sim/não)",
            
            # Number → Date
            ('number', 'date'): "Use TIMESTAMP_TO_DATE ou NUMBER_TO_DATE (especifique formato: YYYYMMDD ou timestamp)",
            ('number', 'datetime'): "Use TIMESTAMP_TO_DATETIME",
            ('number', 'timestamp'): "Use NUMBER_TO_TIMESTAMP",
            
            # Date → Number
            ('date', 'int'): "Use DATE_TO_TIMESTAMP ou DATE_TO_INT (formato YYYYMMDD)",
            ('date', 'decimal'): "Use DATE_TO_TIMESTAMP",
            ('date', 'float'): "Use DATE_TO_TIMESTAMP",
        }
        
        return suggestions.get(
            (origin, destiny),
            f"Configure transformação {origin.upper()}_TO_{destiny.upper()}"
        )