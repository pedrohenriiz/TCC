import csv
from typing import List
from io import StringIO

class CSVReader:
    @staticmethod
    def get_csv_columns(content: str) -> List[str]:
        """
        @input Conteúdo CSV em STR \n
        @output Retorna colunas do arquivo CSV
        """

        # Transforma a string em um arquivo buffero que  em memória
        csvFile = StringIO(content)

        fileReader = csv.reader(csvFile)
        csvHeaders = next(fileReader, [])

        return csvHeaders