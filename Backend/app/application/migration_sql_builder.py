from typing import List


class MigrationSQLBuilder:
    def __init__(self):
        pass

    def build_insert_sql(self, table_name: str, rows: List[dict]) -> str:
        if not rows:
            return ""

        columns = rows[0].keys()
        columns_sql = ", ".join(columns)

        values_sql = []

        for row in rows:
            values = []
            for value in row.values():
                if value is None:
                    values.append("NULL")
                elif isinstance(value, (int, float)):
                    values.append(str(value))
                else:
                    escaped = str(value).replace("'", "''")
                    values.append(f"'{escaped}'")

            values_sql.append(f"({', '.join(values)})")

        values_block = ",\n".join(values_sql)

        sql = (
            f"INSERT INTO {table_name} ({columns_sql})\n"
            f"VALUES\n{values_block};\n"
        )

        return sql
