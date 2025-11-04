from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from domain.data_reader import DataReader
from domain.transformers.data_transformer import DataTransformer

teste = APIRouter(prefix="", tags=["CSV"])

class SplitParams(BaseModel):
    delimiter: str
    position: int

class Transformation(BaseModel):
    column: str
    transform_type: str
    params: SplitParams
    new_column: str

class MigrateRequest(BaseModel):
    project_name: str
    tables: List[str]
    transformations: List[Transformation]

@teste.post("/migrate")
async def migrate(request: MigrateRequest):
    try:
        reader = DataReader()
        dataframes = reader.read_project_tables(request.project_name, request.tables)

        dataframes_serializable = {
            table_name: df.to_dict(orient="records")
            for table_name, df in dataframes.items()
        }

        df_transformed = {}

        transformations = [
            {
                "column": "Nome",
                "transform_type": "split",
                "params": { "delimiter": " ", "position": 1},
                "new_column": "sobrenome"
            }
        ]

        transformer = DataTransformer()


        for table_name, df in dataframes.items():
            df_transformed[table_name] = transformer.apply_transformations(df, transformations)

        # dataframes_serializable = {
        #     table_name: df.to_dict(orient="records")
        #     for table_name, df in df_transformed.items()
        # }

        print(dataframes)

        return {
            "message": "Arquivos lidos com sucesso!",
            "tables": {table_name: df.to_dict(orient="records") for table_name, df in df_transformed.items()}
        }  
    except Exception as error:
        raise HTTPException(status_code = 500, detail=str(error))