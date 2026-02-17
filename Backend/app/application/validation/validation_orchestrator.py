# application/validation/validation_orchestrator.py

from typing import Dict, List
from application.validation.validation_result import ValidationResult
from application.validation.validation_error import ValidationError
from application.validation.fk_validator import ForeignKeyValidator
from application.validation.type_validator import TypeValidator
from application.validation.not_null_validator import NotNullValidator  # ✨ NOVO
from application.migration_context import MigrationContext
from domain.enum.error_strategy import ErrorStrategy

class ValidationOrchestrator:
    """
    Orquestra todas as validações em uma ordem lógica
    """
    
    def __init__(self, context: MigrationContext):
        self.context = context
        self.fk_validator = ForeignKeyValidator(context)
        self.type_validator = TypeValidator()
        self.not_null_validator = NotNullValidator()  # ✨ NOVO
    
    def validate_all(
        self,
        rows: List[Dict],
        table_name: str,
        table_id: int,
        fk_configs: List[Dict],
        column_configs: List[Dict],
        error_strategy: ErrorStrategy,
        start_row_index: int = 0
    ) -> tuple[List[Dict], ValidationResult]:
        """
        Executa todas as validações e retorna linhas válidas + resultado
        
        Args:
            rows: Linhas a validar
            table_name: Nome da tabela
            table_id: ID da tabela
            fk_configs: Configurações de FK
            column_configs: Configurações de colunas (para validação de tipo)
            error_strategy: Estratégia de erro
            start_row_index: Índice inicial (para mensagens de erro)
        
        Returns:
            (linhas_válidas, ValidationResult)
        """
        result = ValidationResult()
        valid_rows = []
        
        for idx, row in enumerate(rows):
            row_index = start_row_index + idx
            result.total_rows += 1
            
            row_errors = []
            
            # ========================================
            # VALIDAÇÃO 1: NOT NULL
            # ========================================
            if column_configs:
                not_null_errors = self.not_null_validator.validate_row(
                    row=row,
                    row_index=row_index,
                    table_name=table_name,
                    column_configs=column_configs
                )
                row_errors.extend(not_null_errors)
            
            # ========================================
            # VALIDAÇÃO 2: Foreign Keys
            # ========================================
            if fk_configs:
                fk_errors = self.fk_validator.validate_row(
                    row=row,
                    row_index=row_index,
                    table_name=table_name,
                    fk_configs=fk_configs
                )
                row_errors.extend(fk_errors)
            
            # ========================================
            # VALIDAÇÃO 3: Tipos de Dados
            # ========================================
            if column_configs:
                type_errors = self._validate_row_types(
                    row=row,
                    row_index=row_index,
                    table_name=table_name,
                    column_configs=column_configs
                )
                row_errors.extend(type_errors)
            
            # ========================================
            # Processar Erros
            # ========================================
            if row_errors:
                # Adiciona erros ao resultado
                for error in row_errors:
                    result.add_error(error)
                
                # Se abort_on_first, para imediatamente
                if error_strategy == ErrorStrategy.ABORT_ON_FIRST:
                    return valid_rows, result
            else:
                # Linha válida
                valid_rows.append(row)
                result.valid_rows += 1
        
        return valid_rows, result
    
    def _validate_row_types(
        self,
        row: Dict,
        row_index: int,
        table_name: str,
        column_configs: List[Dict]
    ) -> List[ValidationError]:
        """
        Valida tipos de dados de uma linha
        
        Args:
            column_configs: Lista de dicts com:
                - column_name
                - origin_type
                - origin_size
                - destiny_type
                - destiny_size
        """
        errors = []
        
        for col_config in column_configs:
            column_name = col_config['column_name']
            
            if column_name not in row:
                continue
            
            value = row[column_name]
            
            error = self.type_validator.validate_value(
                value=value,
                origin_type=col_config['origin_type'],
                origin_size=col_config.get('origin_size'),
                destiny_type=col_config['destiny_type'],
                destiny_size=col_config.get('destiny_size'),
                column_name=column_name,
                row_index=row_index,
                table_name=table_name
            )
            
            if error:
                errors.append(error)
        
        return errors