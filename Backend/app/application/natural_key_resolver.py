# application/natural_key_resolver.py

from application.migration_context import MigrationContext

class NaturalKeyResolver:
    def __init__(self, context: MigrationContext):
        self.context = context
        self._next_id_by_table = {}  # Rastreia próximo ID por tabela

    def resolve_rows(
        self,
        rows: list[dict],
        *,
        source_column: str,
        target_column: str,
        entity: str,
        table_name: str = None  # Nome da tabela para gerar IDs únicos
    ) -> list[dict]:
        """
        Resolve natural keys para IDs.
        
        Se duplicate_strategy='all', expande linhas para cada ID duplicado.
        Gera IDs únicos para linhas expandidas.
        """
        resolved_rows = []

        # Encontra o maior ID atual para esta tabela
        if table_name and table_name not in self._next_id_by_table:
            max_id = max((int(row.get('id', 0)) for row in rows), default=0)
            self._next_id_by_table[table_name] = max_id + 1
            print(f"  📊 {table_name}: Próximo ID disponível = {self._next_id_by_table[table_name]}")

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

            # Verifica se retornou lista (strategy='all')
            if isinstance(destination_id, list):
                print(f"  🔀 Expandindo linha ('{natural_value}' -> {destination_id})")
                
                # Expande: cria uma linha para cada ID
                for idx, single_id in enumerate(destination_id):
                    new_row = dict(row)
                    new_row[target_column] = single_id
                    
                    # DEBUG: Mostra condições
                    print(f"    🔍 DEBUG idx={idx}, table_name={table_name}, has_id={'id' in new_row}")
                    
                    # Gera novo ID para linhas expandidas (exceto a primeira)
                    if idx > 0 and table_name and 'id' in new_row:
                        old_id = new_row['id']
                        new_id = self._next_id_by_table[table_name]
                        new_row['id'] = str(new_id)
                        self._next_id_by_table[table_name] += 1
                        print(f"    ✏️  Linha {idx+1}/{len(destination_id)}: ID {old_id} -> {new_id} (customer_id={single_id})")
                    else:
                        print(f"    ✓ Linha {idx+1}/{len(destination_id)}: ID {new_row.get('id', 'SEM ID')} mantido (customer_id={single_id})")
                    
                    # Só remove se for coluna diferente!
                    if source_column != target_column:
                        new_row.pop(source_column)
                    
                    resolved_rows.append(new_row)
            else:
                # Comportamento normal: um ID único
                new_row = dict(row)
                new_row[target_column] = destination_id
                
                # Só remove se for coluna diferente!
                if source_column != target_column:
                    new_row.pop(source_column)

                resolved_rows.append(new_row)

        return resolved_rows