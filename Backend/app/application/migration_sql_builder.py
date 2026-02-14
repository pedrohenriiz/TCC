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
                # ✨ USA NOVA FUNÇÃO
                values.append(self._format_sql_value(value))

            values_sql.append(f"({', '.join(values)})")

        values_block = ",\n".join(values_sql)

        sql = (
            f"INSERT INTO {table_name} ({columns_sql})\n"
            f"VALUES\n{values_block};\n"
        )

        return sql
    
    def _format_sql_value(self, value) -> str:
        """
        Formata valor para SQL baseado no tipo
        
        LÓGICA:
        1. NULL → NULL
        2. Boolean Python (True/False) → TRUE/FALSE
        3. String "true"/"false" → TRUE/FALSE
        4. Número Python (int, float) → sem aspas
        5. String numérica ("25", "25.5") → sem aspas
        6. String normal ("João") → com aspas
        """
        
        # 1. NULL
        if value is None or value == '':
            return 'NULL'
        
        # 2. Boolean Python
        if isinstance(value, bool):
            return 'TRUE' if value else 'FALSE'
        
        # 3. String "true"/"false" do CSV
        if isinstance(value, str) and value.lower() in ['true', 'false']:
            return 'TRUE' if value.lower() == 'true' else 'FALSE'
        
        # 4. Número Python (int, float) - NÃO boolean!
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            return str(value)
        
        # 5. String numérica do CSV (ex: "25", "25.5")
        if isinstance(value, str):
            cleaned = value.strip()
            
            # Tenta detectar se é número
            if self._is_numeric(cleaned):
                return cleaned  # Retorna SEM aspas
        
        # 6. String normal (precisa de aspas e escape)
        if isinstance(value, str):
            escaped = value.replace("'", "''")
            return f"'{escaped}'"
        
        # Fallback
        return f"'{str(value)}'"
    
    def _is_numeric(self, value: str) -> bool:
        """
        Verifica se string é numérica
        
        Exemplos:
            "25" → True
            "25.5" → True
            "-10" → True
            "25 anos" → False
            "abc" → False
        """
        try:
            float(value)
            return True
        except (ValueError, TypeError):
            return False