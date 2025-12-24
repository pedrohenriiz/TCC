from application.migration_context import MigrationContext

class NaturalKeyResolver:
    def __init__(self, context: MigrationContext):
        self.context = context

    def resolve_rows(
        self,
        rows: list[dict],
        *,
        source_column: str,
        target_column: str,
        entity: str
    ) -> list[dict]:
        resolved_rows = []

        for row in rows:
            natural_value = row.get(source_column)

            destination_id = self.context.resolve(
                entity=entity,
                natural_key=natural_value
            )

            if destination_id is None:
                raise ValueError(
                    f"Chave natural não encontrada: "
                    f"{entity}.{natural_value}"
                )

            new_row = dict(row)
            new_row[target_column] = destination_id
            
            # Só remove se for coluna diferente!
            if source_column != target_column:
                new_row.pop(source_column)

            resolved_rows.append(new_row)

        return resolved_rows
