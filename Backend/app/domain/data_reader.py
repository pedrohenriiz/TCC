import os
import pandas as pd
from typing import List, Dict
from pathlib import Path

class DataReader:
    def __init__(self, path: str = "data"):
        self.path = path
    
    def read_project_tables(self, project_name: str, tables: List[str]) -> Dict[str, pd.DataFrame]:
        """
        Lê os arquivos da pasta do projeto
        """

        BASE_PATH = "data"
        project_path = os.path.join(BASE_PATH, project_name)

        print(project_path)

        test_file = os.path.join(BASE_PATH, "teste.txt")
        os.makedirs(project_path, exist_ok=True)  # garante que a pasta existe
        with open(test_file, "w") as f:
            f.write("Arquivo de teste!")

        if not os.path.exists(project_path):
            raise FileNotFoundError(f"Pasta do projeto '{project_name}' não encontrada!")
        
        dataframes = {}
        for table in tables:
            file_path = self._find_table_file(project_path, table)
            if file_path:
                data = self._read_file(file_path)
                dataframes[table] = data
            else:
                raise FileNotFoundError(f"Arquivo para a tabela '{table} não encontrada!")
        return dataframes
    
    def _find_table_file(self, project_path: str, table_name: str) -> str | None:
        """
        Procura um arquivo com o nome da tabela
        """
        supported_extensions = [".csv"]

        for extension in supported_extensions:
            file_path = os.path.join(project_path, f"{table_name}{extension}")
            if os.path.exists(file_path):
                return file_path
        return None

    def _read_file(self, file_path: str) -> pd.DataFrame:
        """
        Lê um arquivo de dados para um dataframe
        """
        _, extension = os.path.splitext(file_path)

        if extension == ".csv":
            return pd.read_csv(file_path)
        else:
            raise ValueError(f"Extensão de arquivo não suportada: {extension}!")