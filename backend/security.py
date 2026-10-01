import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import JWT_SECRET

ALGORITMO = "HS256"
HORAS_VALIDEZ = 24

# esto agrega el boton "Authorize" en /docs para pegar el token
esquema = HTTPBearer(auto_error=False)


def hashear_clave(clave: str) -> str:
    return bcrypt.hashpw(clave.encode(), bcrypt.gensalt()).decode()


def verificar_clave(clave: str, clave_hash: str) -> bool:
    return bcrypt.checkpw(clave.encode(), clave_hash.encode())


def crear_token(id: int, name: str) -> str:
    payload = {
        "id": id,
        "name": name,
        "exp": datetime.now(timezone.utc) + timedelta(hours=HORAS_VALIDEZ),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITMO)


def usuario_actual(credenciales: HTTPAuthorizationCredentials | None = Depends(esquema)) -> dict:
    # el frontend manda el token asi: Authorization: Bearer <token>
    if not credenciales:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tienes que iniciar sesion",
        )
    try:
        return jwt.decode(credenciales.credentials, JWT_SECRET, algorithms=[ALGORITMO])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado",
        )


UsuarioActual = Annotated[dict, Depends(usuario_actual)]
