from fastapi import APIRouter, HTTPException, status
from sqlmodel import select, desc

from db import SessionDep
from models import User, UserCreate, UserLogin, Video
from security import hashear_clave, verificar_clave, crear_token
from routers.videos import armar_video

router = APIRouter(tags=["users"])


@router.post("/users", summary="Registrar usuario")
def create_user(data: UserCreate, session: SessionDep):
    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contrasena debe tener al menos 6 caracteres"
        )

    existe = session.exec(select(User).where(User.email == data.email)).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ese correo ya esta registrado"
        )

    # nunca se guarda la contrasena tal cual, solo el hash
    usuario = User(
        name=data.name,
        email=data.email,
        password_hash=hashear_clave(data.password)
    )
    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return {"id": usuario.id, "name": usuario.name, "email": usuario.email}


@router.post("/login", summary="Iniciar sesion")
def login(data: UserLogin, session: SessionDep):
    usuario = session.exec(select(User).where(User.email == data.email)).first()
    if not usuario or not verificar_clave(data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contrasena incorrectos"
        )

    token = crear_token(usuario.id, usuario.name)
    return {
        "token": token,
        "user": {"id": usuario.id, "name": usuario.name, "email": usuario.email}
    }


@router.get("/users/{id}", summary="Perfil del usuario con sus videos")
def get_user(id: int, session: SessionDep):
    usuario = session.get(User, id)
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no fue encontrado"
        )

    query = select(Video).where(Video.user_id == id).order_by(desc(Video.created_at))
    videos = session.exec(query).all()
    lista = []
    for video in videos:
        lista.append(armar_video(video, session))

    # la pagina de perfil necesita la info, la cantidad y la lista de videos
    return {
        "id": usuario.id,
        "name": usuario.name,
        "email": usuario.email,
        "total_videos": len(lista),
        "videos": lista
    }
