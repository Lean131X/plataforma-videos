import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

# carga las variables del archivo .env
load_dotenv()

# base de datos en RDS
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")

# buckets de s3
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
BUCKET_VIDEOS = os.getenv("BUCKET_VIDEOS")
BUCKET_MINIATURAS = os.getenv("BUCKET_MINIATURAS")

# secreto del login y url del frontend
JWT_SECRET = os.getenv("JWT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# si falta alguna variable es mejor avisar aca y no fallar despues
if not all([DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, BUCKET_VIDEOS, BUCKET_MINIATURAS, JWT_SECRET]):
    raise RuntimeError("Faltan variables de entorno, revisa el archivo .env")

# el quote_plus escapa los simbolos raros de la contrasena
DATABASE_URL = (
    f"postgresql+psycopg://{DB_USER}:{quote_plus(DB_PASSWORD)}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
