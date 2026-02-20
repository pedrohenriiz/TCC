
import uuid
from typing import Any, Dict
from domain.enum.id_generation_strategy import IdGenerationStrategy

class IdGenerator:
    """
    Gera IDs baseado em estratégias configuradas
    
    Versão minimalista - usa apenas id_start_value
    """
    
    def __init__(self):
        # Contadores para auto_increment (por entidade)
        self._counters: Dict[str, int] = {}
        
        # Namespace UUID para uuid_from_value
        self._namespace = uuid.UUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')
    
    def generate(
        self,
        strategy: IdGenerationStrategy,
        original_value: Any,
        entity: str,
        start_value: int = 1
    ) -> Any:
        """
        Gera novo ID baseado na estratégia
        
        Args:
            strategy: Estratégia de geração
            original_value: Valor original do ID
            entity: Nome da entidade (tabela)
            start_value: Valor inicial (usado apenas em auto_increment)
        
        Returns:
            Novo ID gerado
        
        Examples:
            gen = IdGenerator()
            gen.generate(IdGenerationStrategy.KEEP, 123, 'customers')
            123
            gen.generate(IdGenerationStrategy.AUTO_INCREMENT, 1, 'customers', start_value=1000)
            1000
            gen.generate(IdGenerationStrategy.AUTO_INCREMENT, 2, 'customers', start_value=1000)
            1001
        """
        
        if strategy == IdGenerationStrategy.KEEP:
            return original_value
        
        elif strategy == IdGenerationStrategy.AUTO_INCREMENT:
            return self._auto_increment(entity, start_value)
        
        elif strategy == IdGenerationStrategy.UUID_V4:
            return self._uuid_v4()
        
        elif strategy == IdGenerationStrategy.UUID_FROM_VALUE:
            return self._uuid_from_value(original_value, entity)
        
        elif strategy == IdGenerationStrategy.UUID_SEQUENTIAL:
            return self._uuid_sequential()
        
        else:
            raise ValueError(f"Estratégia desconhecida: {strategy}")
    
    def _auto_increment(self, entity: str, start_value: int) -> int:
        """
        Gera ID sequencial
        
        Args:
            entity: Nome da entidade
            start_value: Valor inicial
        
        Returns:
            Próximo ID da sequência
        """
        if entity not in self._counters:
            # Primeira vez: usa start_value
            self._counters[entity] = start_value
        else:
            # Incrementa
            self._counters[entity] += 1
        
        return self._counters[entity]
    
    def _uuid_v4(self) -> str:
        """Gera UUID v4 aleatório"""
        return str(uuid.uuid4())
    
    def _uuid_from_value(self, original_value: Any, entity: str) -> str:
        """
        Gera UUID v5 determinístico
        
        Mesmo input sempre gera mesmo UUID.
        Útil para migrations reexecutáveis.
        """
        # Namespace baseado na entidade
        namespace_uuid = uuid.uuid5(self._namespace, entity)
        
        # Gera UUID baseado no valor original
        value_str = str(original_value)
        return str(uuid.uuid5(namespace_uuid, value_str))
    
    def _uuid_sequential(self) -> str:
        """
        Gera UUID v7 ordenado por timestamp
        
        Melhor performance em índices B-tree.
        """
        import time
        
        # Timestamp em milissegundos
        timestamp = int(time.time() * 1000)
        
        # Gera UUID v4 e injeta timestamp
        random_uuid = uuid.uuid4()
        uuid_int = random_uuid.int
        
        # Injeta timestamp nos primeiros bits
        timestamp_shifted = timestamp << 80
        sequential_int = (timestamp_shifted & 0xFFFFFFFFFFFF000000000000000000000000) | \
                        (uuid_int & 0x0000000000000FFFFFFFFFFFFFFFFFFFF)
        
        return str(uuid.UUID(int=sequential_int))
    
    def reset(self):
        """Reseta contadores (útil para testes)"""
        self._counters.clear()
    
    def get_current_value(self, entity: str) -> int:
        """Retorna valor atual do contador para uma entidade"""
        return self._counters.get(entity, 0)