import pandas as pd
from typing import Dict, Any

class DataTransformer: 
    def apply_transformations(self, df:pd.DataFrame, transformations: list[Dict[str, Any]]) -> pd.DataFrame:
        """
        Recebe um dataframe e as transformações e retorna o dataframe com os dados transformados
        """
        for transform in transformations:
            transform_type = transform.get("transform_type") # Tipo de transformação
            column = transform.get("column") # Nome da coluna que irá receber a transformação

            if transform_type == "split":
                df = self._apply_split(df, transform, column)

        return df
    
    def _apply_split(self, df: pd.DataFrame, transform: Dict[str, any], column: str) -> pd.DataFrame:
        """
        Faz um split na coluna por um delimitador e salva o valor desejado
        """
        delimiter = transform.get("params", {}).get("delimiter", " ")
        position = transform.get("params", {}).get("position", 0)
        new_column = transform.get("new_column", f"{column}_split_{position}")

        # Separar essa validação em uma função a parte caso ela seja reutilizada futuramente
        if column not in df.columns:
            raise ValueError(f"Coluna '{column}' não encontrada no DataFrame!")
        
        df[new_column] = df[column].astype(str).apply(
            lambda x: x.split(delimiter)[position] if len(x.split(delimiter)) > position else None
        )

        return df