from typing import Dict, Any, Optional, List

class IdMappingRegistry:
    """
    Registra mapeamento de IDs antigos → novos
    
    Usado para resolver FKs que referenciam IDs que foram convertidos.
    
    Exemplo:
        >>> registry = IdMappingRegistry()
        
        # Registra que ID 1 virou 1000
        >>> registry.register('customers', 1, 1000)
        
        # Resolve FK
        >>> registry.resolve('customers', 1)
        1000
    """
    
    def __init__(self):
        # Estrutura: {entity: {old_id: new_id}}
        # Exemplo: {'customers': {'1': 1000, '2': 1001}}
        self._mappings: Dict[str, Dict[str, Any]] = {}
    
    def register(self, entity: str, old_id: Any, new_id: Any):
        """
        Registra mapeamento old_id → new_id
        
        Args:
            entity: Nome da entidade/tabela (ex: 'customers')
            old_id: ID original do CSV
            new_id: Novo ID gerado
        """
        if entity not in self._mappings:
            self._mappings[entity] = {}
        
        # Converte para string para garantir consistência
        key = str(old_id)
        self._mappings[entity][key] = new_id
    
    def resolve(self, entity: str, old_id: Any) -> Optional[Any]:
        """
        Resolve old_id para new_id
        
        Returns:
            new_id correspondente ou None se não encontrado
        """
        if entity not in self._mappings:
            return None
        
        key = str(old_id)
        return self._mappings[entity].get(key)
    
    def has_mapping(self, entity: str, old_id: Any) -> bool:
        """Verifica se existe mapeamento para este ID"""
        return self.resolve(entity, old_id) is not None
    
    def get_all_mappings(self, entity: str) -> Dict[str, Any]:
        """Retorna todos os mapeamentos de uma entidade"""
        return self._mappings.get(entity, {})
    
    def get_entities(self) -> List[str]:
        """Retorna lista de entidades que têm mapeamentos"""
        return list(self._mappings.keys())
    
    def clear(self, entity: Optional[str] = None):
        """Limpa mapeamentos"""
        if entity:
            self._mappings.pop(entity, None)
        else:
            self._mappings.clear()
    
    def get_stats(self) -> Dict[str, int]:
        """Retorna estatísticas de mapeamentos"""
        return {
            entity: len(mappings)
            for entity, mappings in self._mappings.items()
        }
    
    def print_summary(self):
        """Imprime resumo dos mapeamentos"""
        print("\n📊 RESUMO DE MAPEAMENTOS DE IDs:")
        print("="*60)
        
        if not self._mappings:
            print("  Nenhum mapeamento registrado")
            print("="*60)
            return
        
        for entity, mappings in self._mappings.items():
            print(f"\n  {entity}: {len(mappings)} mapeamento(s)")
            
            # Mostra primeiros 5 exemplos
            examples = list(mappings.items())[:5]
            for old_id, new_id in examples:
                print(f"    {old_id} → {new_id}")
            
            if len(mappings) > 5:
                print(f"    ... e mais {len(mappings) - 5}")
        
        print("\n" + "="*60)
    
    def __len__(self) -> int:
        """Retorna total de mapeamentos"""
        return sum(len(mappings) for mappings in self._mappings.values())
    
    def __repr__(self) -> str:
        """Representação string"""
        total = len(self)
        entities = len(self._mappings)
        return f"<IdMappingRegistry: {total} mapeamentos em {entities} entidade(s)>"