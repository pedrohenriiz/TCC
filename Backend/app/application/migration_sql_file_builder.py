from pathlib import Path

class MigrationSQLFileBuilder:
    def __init__(self, path: str):
        self.path = Path(path)
        self.path.mkdir(parents=True, exist_ok=True)

    def write(self, migration_project_name: str, sql_blocks: list[str]):
        file_path = self.path / f"{migration_project_name}.sql"

        with file_path.open("w", encoding="utf-8") as f:
            for block in sql_blocks:
                f.write(block)
                f.write("\n")

        return file_path