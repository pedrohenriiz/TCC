# infra/controllers/download_controller.py

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

router = APIRouter(prefix="/download", tags=["Download"])

SQL_OUTPUT_DIR = Path("/app/sql_output")


@router.get("/{filename}")
def download_sql(filename: str):
    """
    Faz o download do arquivo SQL gerado pela migração.

    **Parâmetros:**
    - `filename`: Nome do arquivo retornado no campo `sql_file` da resposta da migração
    """
    safe_filename = Path(filename).name
    file_path = SQL_OUTPUT_DIR / safe_filename

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail={
                "error": "Not Found",
                "message": f"Arquivo '{safe_filename}' não encontrado."
            }
        )

    return FileResponse(
        path=str(file_path),
        filename=safe_filename,
        media_type="application/octet-stream",
    )