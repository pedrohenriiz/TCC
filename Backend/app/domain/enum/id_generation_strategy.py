
from enum import Enum

class IdGenerationStrategy(str, Enum):
    """
    Estratégias de geração de ID
    """
    
    # Mantém ID original do CSV
    KEEP = "keep"
    
    # Gera IDs sequenciais (1, 2, 3, ...)
    AUTO_INCREMENT = "auto_increment"
    
    # UUID v4 (aleatório, não ordenado)
    UUID_V4 = "uuid_v4"
    
    # UUID v5 (determinístico - mesmo input = mesmo UUID)
    # Útil para manter consistência entre execuções
    UUID_FROM_VALUE = "uuid_from_value"
    
    # UUID v7 (ordenado por timestamp - melhor para índices)
    UUID_SEQUENTIAL = "uuid_sequential"
    
    def __str__(self):
        return self.value
    
    @property
    def description(self) -> str:
        """Descrição amigável da estratégia"""
        descriptions = {
            self.KEEP: "Mantém ID original",
            self.AUTO_INCREMENT: "Gera IDs sequenciais (1, 2, 3...)",
            self.UUID_V4: "Gera UUID aleatório (padrão)",
            self.UUID_FROM_VALUE: "Gera UUID determinístico (mesmo valor = mesmo UUID)",
            self.UUID_SEQUENTIAL: "Gera UUID ordenado por timestamp (melhor performance)",
        }
        return descriptions.get(self, "Estratégia desconhecida")
    
    @property
    def requires_mapping(self) -> bool:
        """Indica se a estratégia requer mapeamento old_id → new_id"""
        # KEEP não precisa de mapeamento (mantém o mesmo)
        return self != self.KEEP