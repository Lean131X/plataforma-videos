from fastapi import APIRouter, HTTPException, status, Form, File, UploadFile
from sqlmodel import select, desc

from config import BUCKET_VIDEOS, BUCKET_MINIATURAS
from db import SessionDep
from models import Video, VideoUpdate, User, Comment
from security import UsuarioActual
from s3 import subir_archivo, eliminar_archivo

router = APIRouter(prefix="/videos", tags=["videos"])

TAMANO_MAXIMO = 100 * 1024 * 1024  # 100 MB


def armar_video(video: Video, session) -> dict:
    # agrega el nombre del usuario para mostrarlo en el frontend
    usuario = session.get(User, video.user_id)
    datos = video.model_dump()
    if usuario:
        datos["user_name"] = usuario.name
    else:
        datos["user_name"] = "Desconocido"
    return datos


def buscar_video(id: int, session) -> Video:
    video = session.get(Video, id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El video no fue encontrado"
        )
    return video


@router.post("", summary="Publicar un video")
def create_video(
    session: SessionDep,
    usuario: UsuarioActual,
    title: str = Form(),
    description: str = Form(""),
    video: UploadFile = File(),
    thumbnail: UploadFile = File(),
):
    # validaciones del enunciado: mp4 de maximo 100 MB y miniatura jpg o png
    if video.content_type != "video/mp4":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El video tiene que ser MP4"
        )
    if video.size and video.size > TAMANO_MAXIMO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El video no puede pesar mas de 100 MB"
        )
    if thumbnail.content_type == "image/jpeg":
        extension = "jpg"
    elif thumbnail.content_type == "image/png":
        extension = "png"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La miniatura tiene que ser JPG o PNG"
        )

    # primero se suben los archivos a s3 y en rds solo se guardan las urls
    video_url = subir_archivo(video.file, BUCKET_VIDEOS, "mp4", "video/mp4")
    thumbnail_url = subir_archivo(thumbnail.file, BUCKET_MINIATURAS, extension, thumbnail.content_type)

    nuevo = Video(
        title=title,
        description=description,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        user_id=usuario["id"]
    )
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return armar_video(nuevo, session)


@router.get("", summary="Listar todos los videos")
def get_videos(session: SessionDep):
    videos = session.exec(select(Video).order_by(desc(Video.created_at))).all()
    lista = []
    for video in videos:
        lista.append(armar_video(video, session))
    return lista


@router.get("/{id}", summary="Obtener un video (suma una vista)")
def get_video_by_id(id: int, session: SessionDep):
    video = buscar_video(id, session)
    # cada vez que alguien abre el video se cuenta una vista
    video.views = video.views + 1
    session.add(video)
    session.commit()
    session.refresh(video)
    return armar_video(video, session)


@router.get("/{id}/recommended", summary="Videos recomendados")
def get_recommended(id: int, session: SessionDep):
    buscar_video(id, session)
    # recomienda los otros videos mas vistos
    query = select(Video).where(Video.id != id).order_by(desc(Video.views)).limit(6)
    videos = session.exec(query).all()
    lista = []
    for video in videos:
        lista.append(armar_video(video, session))
    return lista


@router.put("/{id}", summary="Actualizar titulo o descripcion")
def update_video(id: int, datos: VideoUpdate, session: SessionDep, usuario: UsuarioActual):
    video = buscar_video(id, session)
    if video.user_id != usuario["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes editar tus propios videos"
        )
    if datos.title:
        video.title = datos.title
    if datos.description is not None:
        video.description = datos.description
    session.add(video)
    session.commit()
    session.refresh(video)
    return armar_video(video, session)


@router.delete("/{id}", summary="Eliminar un video")
def delete_video(id: int, session: SessionDep, usuario: UsuarioActual):
    video = buscar_video(id, session)
    if video.user_id != usuario["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes eliminar tus propios videos"
        )

    # primero los comentarios porque tienen llave foranea al video
    comentarios = session.exec(select(Comment).where(Comment.video_id == id)).all()
    for comentario in comentarios:
        session.delete(comentario)

    # tambien se borran los archivos de los buckets
    eliminar_archivo(video.video_url, BUCKET_VIDEOS)
    eliminar_archivo(video.thumbnail_url, BUCKET_MINIATURAS)

    session.delete(video)
    session.commit()
    return {"ok": True}
