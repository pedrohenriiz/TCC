from typing import Any, Optional
from application.id_mapping_registry import IdMappingRegistry

class MigrationContext:
    def __init__(self, allow_duplicates: bool = False, duplicate_strategy: str = 'first'):
        """
        Args:
            allow_duplicates: Se True, permite registrar múltiplos IDs para a mesma natural key
            duplicate_strategy: Estratégia quando há duplicatas ('first', 'last', 'all')
                - 'first': Usa o primeiro ID registrado
                - 'last': Usa o último ID registrado  
                - 'all': Retorna LISTA de todos os IDs (para expandir linhas)
        """
        self._registry: dict[str, dict[str, list[int]]] = {}
        self.allow_duplicates = allow_duplicates
        self.duplicate_strategy = duplicate_strategy
        self._duplicate_warnings: list[dict] = []
        self.id_mapping = IdMappingRegistry()

    def register(
        self,
        entity: str,
        natural_key: str,
        destination_id: int
    ):
        if entity not in self._registry:
            self._registry[entity] = {}
        
        if natural_key not in self._registry[entity]:
            self._registry[entity][natural_key] = []
        
        existing_ids = self._registry[entity][natural_key]
        
        # Verifica se já existe
        if destination_id in existing_ids:
            # Mesmo ID sendo registrado novamente, ignora
            return
        
        # Se já existe outro ID para essa natural key
        if existing_ids:
            if not self.allow_duplicates:
                # Modo estrito: lança erro
                raise ValueError(
                    f"⚠️ Chave natural duplicada detectada!\n"
                    f"  Entidade: {entity}\n"
                    f"  Chave: '{natural_key}'\n"
                    f"  ID existente: {existing_ids[0]}\n"
                    f"  Novo ID: {destination_id}\n"
                    f"  Dica: Ative 'allow_duplicates=True' para permitir duplicatas"
                )
            else:
                # Modo permissivo: registra e avisa
                self._duplicate_warnings.append({
                    'entity': entity,
                    'natural_key': natural_key,
                    'existing_ids': existing_ids.copy(),
                    'new_id': destination_id
                })
        
        self._registry[entity][natural_key].append(destination_id)

    def resolve(
        self,
        entity: str,
        natural_key: str
    ) -> int | list[int] | None:
        """
        Resolve uma natural key para um ID ou lista de IDs.
        Se houver múltiplos IDs, usa a estratégia configurada.
        
        IMPORTANTE: Se strategy='all', retorna LISTA de IDs para expandir linhas.
        """
        ids = self._registry.get(entity, {}).get(natural_key, [])
        
        if not ids:
            return None
        
        if len(ids) == 1:
            return ids[0]
        
        # Múltiplos IDs - aplica estratégia
        if self.duplicate_strategy == 'first':
            return ids[0]
        elif self.duplicate_strategy == 'last':
            return ids[-1]
        elif self.duplicate_strategy == 'all':
            # Retorna LISTA para expandir linhas
            return ids
        
        # Default: primeiro
        return ids[0]

    def has_entity(self, entity: str) -> bool:
        return entity in self._registry
    
    def get_duplicate_warnings(self) -> list[dict]:
        """
        Retorna lista de avisos sobre duplicatas encontradas.
        """
        return self._duplicate_warnings
    
    def has_duplicates(self) -> bool:
        """
        Verifica se há duplicatas registradas.
        """
        return len(self._duplicate_warnings) > 0
    
    def get_stats(self) -> dict:
        """
        Retorna estatísticas sobre o contexto.
        """
        stats = {
            'total_entities': len(self._registry),
            'total_keys': sum(len(keys) for keys in self._registry.values()),
            'duplicates': len(self._duplicate_warnings),
            'entities': {}
        }
        
        for entity, keys in self._registry.items():
            duplicate_keys = sum(1 for ids in keys.values() if len(ids) > 1)
            stats['entities'][entity] = {
                'total_keys': len(keys),
                'duplicate_keys': duplicate_keys,
                'unique_ids': len(set(id for ids in keys.values() for id in ids))
            }
        
        return stats
    
    def print_duplicate_report(self):
        """
        Imprime relatório de duplicatas encontradas.
        """
        if not self._duplicate_warnings:
            print("✅ Nenhuma duplicata encontrada!")
            return
        
        print(f"\n⚠️  RELATÓRIO DE DUPLICATAS ({len(self._duplicate_warnings)} encontrada(s)):")
        print("=" * 80)
        
        # Agrupa por entidade
        by_entity = {}
        for warning in self._duplicate_warnings:
            entity = warning['entity']
            if entity not in by_entity:
                by_entity[entity] = []
            by_entity[entity].append(warning)
        
        for entity, warnings in by_entity.items():
            print(f"\n📊 Entidade: {entity} ({len(warnings)} duplicata(s))")
            for w in warnings:
                print(f"  • '{w['natural_key']}':")
                print(f"    - IDs existentes: {w['existing_ids']}")
                print(f"    - Novo ID tentado: {w['new_id']}")
                
                if self.duplicate_strategy == 'all':
                    resolved = self.resolve(entity, w['natural_key'])
                    print(f"    - Estratégia usada: {self.duplicate_strategy} (criará {len(resolved)} linhas)")
                else:
                    print(f"    - Estratégia usada: {self.duplicate_strategy} (será usado ID {self.resolve(entity, w['natural_key'])})")
        
        print("=" * 80)
    
    def register_id_mapping(self, entity: str, old_id: Any, new_id: Any):
        """Registra mapeamento de ID"""
        self.id_mapping.register(entity, old_id, new_id)

    def resolve_id_mapping(self, entity: str, old_id: Any) -> Optional[Any]:
        """Resolve old_id para new_id"""
        return self.id_mapping.resolve(entity, old_id)

    def print_id_mapping_summary(self):
        """Imprime resumo de mapeamentos"""
        self.id_mapping.print_summary()