# domain/enums/error_strategy.py

from enum import Enum


class ErrorStrategy(str, Enum):
    """
    Estratégias de tratamento de erros durante migração.
    
    ABORT_ON_FIRST:
        Para na primeira falha encontrada.
        Não insere nenhum dado no banco.
        Retorna erro imediatamente.
        
    VALIDATE_ALL:
        Valida todos os dados sem inserir nada (modo dry-run).
        Acumula TODOS os erros encontrados.
        Gera relatório completo.
        
    SKIP_INVALID:
        Pula linhas com erro e insere apenas as válidas.
        Acumula erros das linhas puladas.
        Pode gerar dados incompletos (órfãos são removidos em cascata).
    """
    
    ABORT_ON_FIRST = "abort_on_first"
    VALIDATE_ALL = "validate_all"
    SKIP_INVALID = "skip_invalid"
    
    def __str__(self):
        return self.value
    
    @property
    def description(self) -> str:
        """Retorna descrição da estratégia"""
        descriptions = {
            self.ABORT_ON_FIRST: "Para no primeiro erro encontrado",
            self.VALIDATE_ALL: "Valida tudo sem inserir (dry-run)",
            self.SKIP_INVALID: "Pula linhas inválidas e insere válidas"
        }
        return descriptions.get(self, "")
    
    @property
    def inserts_data(self) -> bool:
        """Verifica se a estratégia insere dados no banco"""
        return self in [self.SKIP_INVALID]
    
    @property
    def stops_on_error(self) -> bool:
        """Verifica se a estratégia para ao encontrar erro"""
        return self == self.ABORT_ON_FIRST