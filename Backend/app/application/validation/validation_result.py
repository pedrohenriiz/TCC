# application/validation/validation_result.py

from dataclasses import dataclass
from typing import List, Dict, Any
from application.validation.validation_error import ValidationError


@dataclass
class ValidationResult:
    """
    Resultado da validação de uma migração.
    
    Attributes:
        total_rows: Total de linhas processadas
        valid_rows: Linhas que passaram na validação
        invalid_rows: Linhas que falharam na validação
        orphaned_rows: Linhas que são órfãs (FK referencia linha pulada)
        errors: Lista de erros encontrados
    """
    total_rows: int = 0
    valid_rows: int = 0
    invalid_rows: int = 0
    orphaned_rows: int = 0
    errors: List[ValidationError] = None
    
    def __post_init__(self):
        """Inicializa lista de erros vazia se não fornecida"""
        if self.errors is None:
            self.errors = []
    
    @property
    def has_errors(self) -> bool:
        """Verifica se há erros"""
        return len(self.errors) > 0
    
    @property
    def success_rate(self) -> float:
        """Calcula percentual de sucesso"""
        if self.total_rows == 0:
            return 0.0
        return (self.valid_rows / self.total_rows) * 100
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Converte para dicionário para retornar na API.
        Este é o formato que o frontend vai receber.
        """
        return {
            "total_rows": self.total_rows,
            "valid_rows": self.valid_rows,
            "invalid_rows": self.invalid_rows,
            "orphaned_rows": self.orphaned_rows,
            "success_rate": round(self.success_rate, 2),
            "has_errors": self.has_errors,
            "error_count": len(self.errors),
            "errors": [error.to_dict() for error in self.errors]
        }
    
    def to_summary_dict(self, max_errors: int = 10) -> Dict[str, Any]:
        """
        Converte para dicionário resumido (com limite de erros).
        Útil quando há muitos erros e você quer mostrar só os primeiros.
        
        Args:
            max_errors: Número máximo de erros a incluir (padrão: 10)
        """
        errors_to_show = self.errors[:max_errors]
        has_more_errors = len(self.errors) > max_errors
        
        return {
            "total_rows": self.total_rows,
            "valid_rows": self.valid_rows,
            "invalid_rows": self.invalid_rows,
            "orphaned_rows": self.orphaned_rows,
            "success_rate": round(self.success_rate, 2),
            "has_errors": self.has_errors,
            "error_count": len(self.errors),
            "errors": [error.to_dict() for error in errors_to_show],
            "has_more_errors": has_more_errors,
            "remaining_errors": len(self.errors) - max_errors if has_more_errors else 0
        }
    
    def get_errors_by_type(self) -> Dict[str, List[ValidationError]]:
        """
        Agrupa erros por tipo.
        Útil para o frontend mostrar erros organizados.
        
        Returns:
            {"fk_not_found": [...], "orphan_row": [...], ...}
        """
        errors_by_type = {}
        
        for error in self.errors:
            if error.error_type not in errors_by_type:
                errors_by_type[error.error_type] = []
            errors_by_type[error.error_type].append(error)
        
        return errors_by_type
    
    def get_errors_by_table(self) -> Dict[str, List[ValidationError]]:
        """
        Agrupa erros por tabela.
        "Tabela X tem 5 erros, Tabela Y tem 3 erros".
        
        Returns:
            {"orders": [...], "customers": [...], ...}
        """
        errors_by_table = {}
        
        for error in self.errors:
            if error.table not in errors_by_table:
                errors_by_table[error.table] = []
            errors_by_table[error.table].append(error)
        
        return errors_by_table
    
    def add_error(self, error: ValidationError):
        """Adiciona um erro à lista"""
        self.errors.append(error)
        self.invalid_rows += 1
    
    def print_summary(self):

        print("\n" + "="*60)
        print("📊 RESUMO DA VALIDAÇÃO")
        print("="*60)
        print(f"Total de linhas: {self.total_rows}")
        print(f"✅ Válidas: {self.valid_rows} ({self.success_rate:.1f}%)")
        print(f"❌ Inválidas: {self.invalid_rows}")
        print(f"🔗 Órfãs: {self.orphaned_rows}")
        print(f"Total de erros: {len(self.errors)}")
        print("="*60)
        
        if self.has_errors:
            print("\n⚠️ Erros encontrados:")
            for idx, error in enumerate(self.errors[:10], 1):
                print(f"\n{idx}. {error}")
            
            if len(self.errors) > 10:
                print(f"\n... e mais {len(self.errors) - 10} erro(s)")