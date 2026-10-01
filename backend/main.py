from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config import DB_HOST, FRONTEND_URL
from db import SessionDep, create_all_tables
from routers import users, videos, comments

app = FastAPI(
    title="Plataforma de Videos",
    description="Examen practico - Arquitectura en la Nube. FastAPI en EC2, RDS PostgreSQL y S3",
    version="1.0.0",
    lifespan=create_all_tables,
)

# solo se permite el frontend del bucket y el localhost de vite para pruebas
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(videos.router)
app.include_router(comments.router)


@app.get("/", tags=["estado"], summary="Estado de la API")
def root():
    return {"mensaje": "API funcionando", "documentacion": "/docs"}


@app.get("/check_db", tags=["estado"], summary="Verifica la conexion con Amazon RDS")
def check_db(session: SessionDep):
    # consulta directa a la base para comprobar que la conexion esta viva
    version = session.execute(text("select version()")).scalar()
    return {"conectado": True, "host_rds": DB_HOST, "version_postgres": version}
