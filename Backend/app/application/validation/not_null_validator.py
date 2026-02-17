
from typing import Any, Optional, List, Dict
from application.validation.validation_error import ValidationError

class NotNullValidator:
    """
    Valida se campos obrigatórios (NOT NULL) estão preenchidos
    """
    
    def validate_value(
        self,
        value: Any,
        is_nullable: bool,
        column_name: str,
        row_index: int,
        table_name: str
    ) -> Optional[ValidationError]:
        """
        Valida se valor obrigatório está preenchido
        
        Args:
            value: Valor a ser validado
            is_nullable: Se a coluna aceita NULL (True = aceita, False = obrigatório)
            column_name: Nome da coluna
            row_index: Índice da linha
            table_name: Nome da tabela
        
        Returns:
            ValidationError se campo obrigatório está vazio, None se válido
        """
        
        # Se coluna ACEITA null, não precisa validar
        if is_nullable:
            return None
        
        # Se coluna NÃO aceita null, valida se está preenchido
        if self._is_empty(value):
            return ValidationError(
                row_index=row_index,
                table=table_name,
                column=column_name,
                error_type="null_constraint_violation",
                message=f"Campo obrigatório '{column_name}' está vazio",
                value=value,
                severity="error",
                related_error=f"A coluna '{column_name}' não aceita valores nulos. Forneça um valor válido ou configure a coluna como nullable."
            )
        
        return None
    
    def validate_row(
        self,
        row: Dict[str, Any],
        row_index: int,
        table_name: str,
        column_configs: List[Dict]
    ) -> List[ValidationError]:
        """
        Valida NOT NULL de todas as colunas de uma linha
        
        Args:
            row: Dados da linha
            row_index: Índice da linha
            table_name: Nome da tabela
            column_configs: Lista de configurações de colunas com:
                - column_name: Nome da coluna
                - is_nullable: Se aceita NULL
        
        Returns:
            Lista de erros encontrados
        """
        errors = []
        
        for col_config in column_configs:
            column_name = col_config['column_name']
            is_nullable = col_config.get('is_nullable', True)  # Default: aceita NULL
            
            # Pega valor da coluna
            value = row.get(column_name)
            
            # Valida
            error = self.validate_value(
                value=value,
                is_nullable=is_nullable,
                column_name=column_name,
                row_index=row_index,
                table_name=table_name
            )
            
            if error:
                errors.append(error)
        
        return errors
    
    def _is_empty(self, value: Any) -> bool:
        """
        Verifica se valor está vazio/nulo
        
        Considera vazio:
        - None
        - String vazia ""
        - String só com espaços "   "
        
        NÃO considera vazio:
        - 0 (zero é um valor válido)
        - False (booleano falso é válido)
        - "0" (string "0" é válida)
        """
        
        # None é vazio
        if value is None:
            return True
        
        # String vazia ou só espaços é vazio
        if isinstance(value, str):
            return value.strip() == ''
        
        # Qualquer outro valor (incluindo 0, False, "0") é válido
        return False