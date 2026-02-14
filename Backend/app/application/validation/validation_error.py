from dataclasses import dataclass
from typing import Optional, Any


@dataclass
class ValidationError:
    """
    Representa um erro de validação encontrado durante a migração.
    
    Attributes:
        row_index: Índice da linha no CSV (começa em 0)
        table: Nome da tabela de destino
        column: Nome da coluna com problema
        error_type: Tipo do erro (ex: 'fk_not_found', 'orphan_row', 'duplicate')
        message: Mensagem descritiva do erro
        value: Valor que causou o erro
        severity: Severidade ('error', 'warning', 'info')
        related_error: Mensagem de erro relacionado (para órfãos em cascata)
    """
    row_index: int
    table: str
    column: str
    error_type: str
    message: str
    value: Any
    severity: str = "error"
    related_error: Optional[str] = None
    
    def to_dict(self):
        """Converte para dicionário para serialização JSON"""
        return {
            "row_index": self.row_index,
            "table": self.table,
            "column": self.column,
            "error_type": self.error_type,
            "message": self.message,
            "value": str(self.value) if self.value is not None else None,
            "severity": self.severity,
            "related_error": self.related_error
        }
    
    def __str__(self):
        """Representação legível do erro"""
        msg = f"[{self.severity.upper()}] Linha {self.row_index} | {self.table}.{self.column}"
        msg += f"\n  Tipo: {self.error_type}"
        msg += f"\n  Mensagem: {self.message}"
        msg += f"\n  Valor: {self.value}"
        if self.related_error:
            msg += f"\n  Relacionado: {self.related_error}"
        return msg