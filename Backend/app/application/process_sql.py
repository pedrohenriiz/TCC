from typing import Dict, Any
from domain.sql_generator import SQLGenerator

class ProcessSQL:
    def __init__(self, sql_generator: SQLGenerator):
        self.sql_generator = sql_generator

    def exec(self, schema: Dict[str, Any], mapping: Dict[str, Dict[str, str]], csv_content: str):
        rows = self.sql_generator.parse_csv(csv_content)

        sql_queries = []

        for table_name, table_info in schema.items():
            table_columns = table_info["columns"]

            mapped_columns = mapping.get(table_name, {})

            table_rows = []
            for row in rows:
                reordered_row = []
                for col in table_columns:
                    csv_col = mapped_columns.get(col)
                    if csv_col is None:
                        reordered_row.append(None)
                    else:
                        try:
                            index = list(mapped_columns.values()).index(csv_col)
                            reordered_row.append(row[index])
                        except ValueError:
                            reordered_row.append(None)
                table_rows.append(reordered_row)
            sql_statements = self.sql_generator.generate_insert_sql(table_name=table_name, columns=table_columns, rows=table_rows)

            sql_queries.append(sql_statements)
        
        return { "sql": sql_queries }