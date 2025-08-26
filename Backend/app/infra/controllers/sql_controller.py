

from fastapi import APIRouter, UploadFile, Form
from application.process_sql import ProcessSQL
from domain.sql_generator import SQLGenerator
import json

sql_router = APIRouter(prefix="", tags=["SQL"])

@sql_router.post("/generate-sql")
async def generate_sql(file: UploadFile, schema: str = Form(...), mapping: str = Form(...)):
    content = await file.read()
    csv_content = content.decode("utf-8")

    schema_dict = json.loads(schema)
    mapping_dict = json.loads(mapping)

    service = ProcessSQL(SQLGenerator())
    result = service.exec(schema=schema_dict, mapping=mapping_dict, csv_content=csv_content)

    return result
