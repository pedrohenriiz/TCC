from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from infra.controllers.csv_controller import router as csv_router
from infra.controllers.sql_controller import sql_router
from infra.controllers.migrate_controller import router as migrate_router
from infra.controllers.table_config_controller import router as table_config_router
from infra.controllers.migration_project_controller import migration_project_router
from infra.controllers.migration_project_origin_table_controller import migration_project_origin_table_router
from infra.controllers.transformation_controller import transformation_router
from infra.controllers.mapping_controller import mapping_router
from infra.controllers.setting_controller import router as setting_router
from infra.controllers.download_controller import router as download_router
from infra.database.connection import Base, engine, init_db
import logging

logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

Base.metadata.create_all(bind=engine)

app = FastAPI()

init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(csv_router)
app.include_router(sql_router)
app.include_router(migrate_router)
app.include_router(table_config_router)
app.include_router(migration_project_router)
app.include_router(migration_project_origin_table_router)
app.include_router(transformation_router)
app.include_router(mapping_router)
app.include_router(setting_router)
app.include_router(download_router)