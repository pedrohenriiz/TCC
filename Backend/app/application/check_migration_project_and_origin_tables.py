from pathlib import Path
from typing import List, Optional, Dict

class ProjectFileService:
    def __init__(self, pasta_base: str):
        self.base_path = Path(pasta_base)

        if not self.base_path.exists():
            raise FileNotFoundError(
                f"Pasta base não encontrada: {self.base_path}"
            )

    def _get_project_path(self, migration_project_name: str) -> Path:
        project_path = self.base_path / migration_project_name

        if not project_path.exists() or not project_path.is_dir():
            raise FileNotFoundError(
                f"Pasta do projeto não encontrada: {project_path}"
            )

        return project_path

    def list_csv_files(self, migration_project_name: str) -> List[Path]:
        project_path = self._get_project_path(migration_project_name)

        csvs = list(project_path.glob("*.csv"))

        if not csvs:
            raise FileNotFoundError(
                f"Nenhum arquivo CSV encontrado em {project_path}"
            )

        return csvs

    def csv_exists_with_name(
        self,
        migration_project_name: str,
        origin_table_name: str
    ) -> bool:
        csvs = self.list_csv_files(migration_project_name)

        for csv in csvs:
            if csv.stem == origin_table_name:
                return True

        return False
    
    def get_csv_by_names(self, migration_project_name: str, origin_table_names: List[str]) -> Dict[str, Path]:
        project_path = self._get_project_path(migration_project_name)
        csvs_existentes = list(project_path.glob("*.csv"))


        resultado: Dict[str, Path] = {}

        for origin_table in origin_table_names:
            for csv in csvs_existentes:
                if csv.stem == origin_table:
                    resultado[origin_table] = csv
                    break

        return resultado


    def get_csv_by_name(
        self,
        migration_project_name: str,
        origin_table_name: str
    ) -> Optional[Path]:
        csvs = self.list_csv_files(migration_project_name)

        for csv in csvs:
            if csv.stem == origin_table_name:
                return csv

        return None

    def get_csv_by_prefix(
        self,
        migration_project_name: str,
        prefixo: str
    ) -> Optional[Path]:
        project_path = self._get_project_path(migration_project_name)

        for csv in project_path.glob("*.csv"):
            if csv.name.startswith(prefixo):
                return csv

        return None
