from fastapi import APIRouter, UploadFile
from application.process_csv import ProcessCSV
from domain.csv_reader import CSVReader

router = APIRouter(prefix="", tags=["CSV"])

@router.post("/upload-csv")
async def upload_csv(file: UploadFile):
    content = await file.read()
    formatted_content = content.decode("utf-8")

    reader = CSVReader()
    process_csv = ProcessCSV(reader)

    result = process_csv.exec(formatted_content)

    return result