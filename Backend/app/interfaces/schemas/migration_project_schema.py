from pydantic import BaseModel
from typing import Optional

class MigrationProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class MigrationProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None