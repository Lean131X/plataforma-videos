from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from db import SessionDep
from models import Comment, CommentCreate, Video, User
from security import UsuarioActual

router = APIRouter(prefix="/videos/{id}/comments", tags=["comments"])


def armar_comentario(comentario: Comment, session) -> dict:
    usuario = session.get(User, comentario.user_id)
    datos = comentario.model_dump()
    if usuario:
        datos["user_name"] = usuario.name
    else:
        datos["user_name"] = "Desconocido"
    return datos


@router.get("", summary="Listar comentarios de un video")
def get_comments(id: int, session: SessionDep):
    video = session.get(Video, id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El video no fue encontrado"
        )

    query = select(Comment).where(Comment.video_id == id).order_by(Comment.created_at)
    comentarios = session.exec(query).all()
    lista = []
    for comentario in comentarios:
        lista.append(armar_comentario(comentario, session))
    return lista


@router.post("", summary="Comentar un video")
def create_comment(id: int, data: CommentCreate, session: SessionDep, usuario: UsuarioActual):
    video = session.get(Video, id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El video no fue encontrado"
        )
    if not data.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El comentario no puede estar vacio"
        )

    nuevo = Comment(
        content=data.content,
        user_id=usuario["id"],
        video_id=id
    )
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return armar_comentario(nuevo, session)
