# application/validation/fk_validator.py

from typing import Dict, List, Any, Optional
from application.validation.validation_error import ValidationError
from application.migration_context import MigrationContext

class ForeignKeyValidator:
    """
    Valida Foreign Keys usando o contexto de migração
    """
    
    def __init__(self, context: MigrationContext):
        self.context = context
    
    def validate_row(
        self,
        row: Dict[str, Any],
        row_index: int,
        table_name: str,
        fk_configs: List[Dict]
    ) -> List[ValidationError]:
        """
        Valida FKs de uma linha
        
        Args:
            row: Dados da linha
            row_index: Índice da linha
            table_name: Nome da tabela
            fk_configs: Configurações de FK [{source_column, reference_entity, ...}]
        
        Returns:
            Lista de erros encontrados
        """
        errors = []
        
        for fk_config in fk_configs:
            source_column = fk_config['source_column']
            reference_entity = fk_config['reference_entity']
            
            # Pega valor da FK
            if source_column not in row:
                continue
            
            fk_value = row[source_column]
            
            # Ignora NULL/vazio
            if fk_value is None or fk_value == '':
                continue
            
            # Tenta resolver natural key
            try:
                resolved_id = self.context.resolve(
                    entity=reference_entity,
                    natural_key=str(fk_value)
                )
                
                # Se não encontrou
                if resolved_id is None:
                    errors.append(ValidationError(
                        row_index=row_index,
                        table=table_name,
                        column=source_column,
                        error_type="natural_key_not_found",
                        message=f"Chave natural '{fk_value}' não encontrada em {reference_entity}",
                        value=fk_value,
                        severity="error",
                        related_error=f"O valor '{fk_value}' não existe na tabela {reference_entity}"
                    ))
                    
            except Exception as e:
                errors.append(ValidationError(
                    row_index=row_index,
                    table=table_name,
                    column=source_column,
                    error_type="resolution_error",
                    message=f"Erro ao resolver FK: {str(e)}",
                    value=fk_value,
                    severity="error"
                ))
        
        return errors
    
    def validate_rows(
        self,
        rows: List[Dict],
        table_name: str,
        fk_configs: List[Dict]
    ) -> List[ValidationError]:
        """
        Valida FKs de múltiplas linhas
        
        Returns:
            Lista de todos os erros encontrados
        """
        all_errors = []
        
        for row_index, row in enumerate(rows):
            errors = self.validate_row(
                row=row,
                row_index=row_index,
                table_name=table_name,
                fk_configs=fk_configs
            )
            all_errors.extend(errors)
        
        return all_errors