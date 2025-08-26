from fastapi import FastAPI
from infra.controllers.csv_controller import router
from fastapi.middleware.cors import CORSMiddleware
from infra.controllers.sql_controller import sql_router

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"],       # quem pode acessar
    allow_credentials=True,
    allow_methods=["*"],         # quais métodos HTTP são permitidos
    allow_headers=["*"]   )      # quais headers são permitidos)

app.include_router(router)
app.include_router(sql_router)

