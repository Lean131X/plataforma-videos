from datetime import datetime, timezone
from sqlmodel import SQLModel, Field


def fecha_actual():
    # la version nueva de sqlmodel pide la fecha con zona horaria
    return datetime.now(timezone.utc)


# user es palabra reservada en postgres, por eso la tabla se llama users
class User(SQLModel, table=True):
    __tablename__ = "users"
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True)
    password_hash: str


class UserCreate(SQLModel):
    name: str
    email: str
    password: str


class UserLogin(SQLModel):
    email: str
    password: str


class Video(SQLModel, table=True):
    __tablename__ = "videos"
    id: int | None = Field(default=None, primary_key=True)
    title: str
    description: str = ""
    video_url: str
    thumbnail_url: str
    views: int = 0
    user_id: int = Field(foreign_key="users.id")
    # la pagina principal muestra la fecha, por eso se agrega
    created_at: datetime = Field(default_factory=fecha_actual)


class VideoUpdate(SQLModel):
    title: str | None = None
    description: str | None = None


class Comment(SQLModel, table=True):
    __tablename__ = "comments"
    id: int | None = Field(default=None, primary_key=True)
    content: str
    user_id: int = Field(foreign_key="users.id")
    video_id: int = Field(foreign_key="videos.id")
    created_at: datetime = Field(default_factory=fecha_actual)


class CommentCreate(SQLModel):
    content: str
