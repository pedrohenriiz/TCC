import csv
from io import StringIO
from typing import List, Any


class SQLGenerator:
    @staticmethod
    def format_value(value: str):
        v = value.strip()
        
        # Boolean
        if v.lower() in ["true", "false"]:
            return v.upper()  # TRUE ou FALSE

        # Inteiro
        try:
            i = int(v)
            return str(i)
        except ValueError:
            pass

        # Float
        try:
            f = float(v)
            return str(f)
        except ValueError:
            pass

        # String padrão
        return f"'{v}'"

    @staticmethod
    def generate_insert_sql(
        table_name: str, 
        columns: List[str], 
        rows: List[List[Any]]
    ) -> List[str]:
        """
        Gera os INSERTs com formatação correta de tipos
        """
        sql_statements = []

        for row in rows:
            # Usa format_value para cada célula
            formatted_values = [SQLGenerator.format_value(str(v)) for v in row]
            
            sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(formatted_values)});"
            sql_statements.append(sql)

        return sql_statements

    @staticmethod
    def parse_csv(content: str) -> List[List[str]]:
        """
        Converte CSV em lista de listas
        """
        csv_file = StringIO(content)
        reader = csv.reader(csv_file)
        next(reader, None)  # pular cabeçalho
        return list(reader)
