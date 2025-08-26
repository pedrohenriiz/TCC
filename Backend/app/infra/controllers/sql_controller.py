import os
from fastapi import APIRouter, UploadFile, Form
from application.process_sql import ProcessSQL
from domain.sql_generator import SQLGenerator
from datetime import datetime
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

    current_path = os.getcwd()
    dump_dir = os.path.join(current_path, "SQL_Dumps")
    os.makedirs(dump_dir, exist_ok=True)

    file_name = f"dump_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
    file_path = os.path.join(dump_dir, file_name)

    flat_sql = []

    for item in result:
        if isinstance(item, list):
            flat_sql.extend(item)
        else:
            flat_sql.append(item)

    sql_dump_data = ";\n".join(flat_sql) + ";"

    with open(file_path, "w", encoding='utf-8') as f:
        f.write(sql_dump_data)

