from domain.csv_reader import CSVReader

class ProcessCSV:
    def __init__(self, csv_reader: CSVReader):
        self.csv_reader = csv_reader

    def exec(self, file_content: str):
        """
        @input Conteúdo csv em string
        @ouput Retorna as colunas do CSV
        """
    
        columns = self.csv_reader.get_csv_columns(file_content)

        return { "columns": columns }