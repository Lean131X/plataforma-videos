from typing import Annotated

from fastapi import Depends, FastAPI
from sqlmodel import Session, SQLModel, create_engine

from config import DATABASE_URL

# echo=True imprime en consola el SQL que se manda a RDS (sirve para ver los logs en pm2)
engine = create_engine(DATABASE_URL, echo=True)


def create_all_tables(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
