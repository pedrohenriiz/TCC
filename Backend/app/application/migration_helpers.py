from application.check_migration_project_and_origin_tables import ProjectFileService
import csv

class MigrationHelpers:
    def __init__(self):
        pass

    def normalize_mappings(self, raw_mappings):
        normalized = []

        for mapping in raw_mappings:
            for col in mapping.columns:
                normalized.append({
                    "migration_project": {
                        "id": mapping.migration_project.id,
                        "name": mapping.migration_project.name,
                    },
                    "origin_table": {
                        "id": col.origin_table.id,
                        "name": col.origin_table.name,
                    },
                    "origin_column": {
                        "id": col.origin_column.id,
                        "name": col.origin_column.name,
                    },
                    "destiny_table": {
                        "id": col.destiny_table.id,
                        "name": col.destiny_table.name,
                    },
                    "destiny_column": {
                        "id": col.destiny_column.id,
                        "name": col.destiny_column.name,
                    },
                })

        return normalized
    
    def build_migration_plan(self, mappings):
        plan = {
            "migration_project": {
                "id": mappings[0]["migration_project"]["id"],
                "name": mappings[0]["migration_project"]["name"],
            },
            "tables": {}
        }

        for m in mappings:
            destiny_table_name = m["destiny_table"]["name"]

            if destiny_table_name not in plan["tables"]:
                plan["tables"][destiny_table_name] = {
                    "destiny_table_id": m["destiny_table"]["id"],
                    "origin_table": m["origin_table"]["name"],
                    "columns": {}
                }

            origin_col = m["origin_column"]["name"]
            destiny_col = m["destiny_column"]["name"]

            plan["tables"][destiny_table_name]["columns"][origin_col] = destiny_col

        return plan
    
    def load_csv_data(self, migration_plan):
        migration_name = migration_plan["migration_project"]["name"]
        tables = migration_plan["tables"]

        result = {}

        for _, table_info in tables.items():
            
            origin_table = table_info["origin_table"]
            column_mapping = table_info["columns"]

            migration_name = migration_plan["migration_project"]["name"]
            origin_table = table_info["origin_table"]

            project_file_service = ProjectFileService(pasta_base="data")

            # 1️⃣ buscar o CSV correto
            csv_path = project_file_service.get_csv_by_name(
                migration_project_name=migration_name,
                origin_table_name=origin_table
            )

            if not csv_path:
                raise FileNotFoundError(
                    f"CSV não encontrado para tabela {origin_table}"
                )

            # 2️⃣ ler o CSV e mapear colunas
            rows = []
            with open(csv_path, newline="", encoding="utf-8") as csvfile:
                reader = csv.DictReader(csvfile, delimiter=",")

                for row in reader:
                    mapped_row = {
                        destiny_col: row[origin_col]
                        for origin_col, destiny_col in column_mapping.items()
                        if origin_col in row
                    }
                    rows.append(mapped_row)

            # 3️⃣ guardar dados prontos para INSERT
            result[table_info["destiny_table_id"]] = rows

        return result
