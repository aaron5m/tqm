from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy import text
from .auth import hash_password
from .models import Link, Compeer # SQLModel class
from .db import engine
from .utils import *
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()



# MIDDLEWARE FOR LOCALHOST
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



# CHECK FOR A USERNAME
@app.get("/compeer")
def compeer(username: str = Query(...)):
    exists = check_username(username)
    return {"exists": exists}



# GET PASSWORD HASH FOR A USERNAME
@app.get("/get-hash")
def get_hash(username: str = Query(...)):
    with Session(engine) as session:
        statement = select(Compeer).where(Compeer.username == username)
        user = session.exec(statement).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"hash": user.password_input}



# SIGNUP PROCESSING
@app.post("/signup")
def create_user(user_data: Compeer):
    with Session(engine) as session:
        # 1. Overwrite the input with the hash
        # user_data.password_input = hash_password(user_data.password_input)
        
        # 2. Save to Postgres
        session.add(user_data)
        session.commit()
        session.refresh(user_data)
        return {"status": "success", "username": user_data.username}



# UPLOAD PROCESSING
@app.post("/upload")
def create_link(link_data: dict):
    """
    Expects JSON from Node.js like:
    {
        "username": "mockuser",
        "url": "...",
        "description": "...",
        "photos": {"front": "front.jpg", "back": "back.jpg"}
    }
    """
    try:
        link = Link(
            username=link_data["username"],
            url=link_data["url"],
            description=link_data.get("description"),
            photos=link_data.get("photos", {}),
        )
        with Session(engine) as session:
            session.add(link)
            session.commit()
            session.refresh(link)
        return {"id": link.id, "status": "created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# SEE TEN ENTRIES
@app.get("/items")
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