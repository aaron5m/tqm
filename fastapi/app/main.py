from fastapi import FastAPI, Depends, HTTPException, Request
from sqlmodel import Session, select
from sqlalchemy import text
from .auth import hash_password
from .models import Link, Compeer # SQLModel class
from .db import engine
from .utils import *
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

API_SECRET = os.getenv("API_SECRET")

# MIDDLEWARE FOR REACT/VITE DEVELOPMENT
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
        "http://localhost:8080", 
        "http://localhost:5174",
        "http://localhost:80",
        "http://localhost:443"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# SIGNUP PROCESSING *Note *requires API_SECRET
@app.post("/pyapi/signup")
def create_user(user_data: Compeer, request: Request):
    token = request.headers.get("X-API-KEY")
    if token != API_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        with Session(engine) as session:
            session.add(user_data)
            session.commit()
            session.refresh(user_data)
        return {"status": "success", "username": user_data.username}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error")



# UPLOAD PROCESSING *Note *requires API_SECRET
@app.post("/pyapi/upload")
def create_link(link_data: Link, request: Request):
    token = request.headers.get("X-API-KEY")
    if token != API_SECRET:
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        with Session(engine) as session:
            session.add(link_data)
            session.commit()
            session.refresh(link_data)
        return {"id": link_data.id, "status": "created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# CHECK FOR A USERNAME
@app.get("/pyapi/compeer")
def compeer(username: str = Query(...)):
    exists = check_username(username)
    return {"exists": exists}
# actual function check_username returns true if username exists
def check_username(username: str) -> bool:
    with Session(engine) as session:
        statement = select(Compeer).where(Compeer.username == username)
        result = session.exec(statement).first()
        return result is not None


# GET PASSWORD HASH FOR A USERNAME
@app.get("/pyapi/get-hash")
def get_hash(username: str = Query(...)):
    with Session(engine) as session:
        statement = select(Compeer).where(Compeer.username == username)
        user = session.exec(statement).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"hash": user.password_input}



# SEE TEN ENTRIES
@app.get("/pyapi/items")
def get_items():
    try:
        with Session(engine) as session:
            result = session.execute(
                text("SELECT * FROM link ORDER BY id LIMIT 10")
            )
            items = [dict(row._mapping) for row in result]
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))