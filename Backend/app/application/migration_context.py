class MigrationContext:
    def __init__(self):
        self._registry: dict[str, dict[str, int]] = {}

    def register(
        self,
        entity: str,
        natural_key: str,
        destination_id: int
    ):
        if entity not in self._registry:
            self._registry[entity] = {}

        self._registry[entity][natural_key] = destination_id

    def resolve(
        self,
        entity: str,
        natural_key: str
    ) -> int | None:
        return self._registry.get(entity, {}).get(natural_key)

    def has_entity(self, entity: str) -> bool:
        return entity in self._registry
