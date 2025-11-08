from fastapi import FastAPI
from infra.controllers.csv_controller import router
from fastapi.middleware.cors import CORSMiddleware
from infra.controllers.sql_controller import sql_router
from infra.controllers.migrate_controller import teste
from infra.controllers.table_config_controller import router
from infra.controllers.migration_project_controller import migration_project_router
from infra.database.connection import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"],       # quem pode acessar
    allow_credentials=True,
    allow_methods=["*"],         # quais métodos HTTP são permitidos
    allow_headers=["*"]   )      # quais headers são permitidos)

app.include_router(router)
app.include_router(sql_router)
app.include_router(teste)
app.include_router(router)
app.include_router(migration_project_router)
