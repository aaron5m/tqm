from fastapi import FastAPI, Depends, HTTPException, Query
from sqlmodel import Session, select
from sqlalchemy import text
from .auth import hash_password
from .models import Link, Compeer # SQLModel class
from .db import engine

# CHECK FOR A USERNAME
def check_username(username: str) -> bool:
    with Session(engine) as session:
        statement = select(Compeer).where(Compeer.username == username)
        result = session.exec(statement).first()
        return result is not None
