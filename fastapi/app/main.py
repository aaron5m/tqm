from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from .auth import hash_password
from .models import Link, Compeer # SQLModel class
from .db import engine

# THIS MIDDLEWARE IS SAFE ENOUGH BUT SHOULD BE REMOVED
from fastapi.middleware.cors import CORSMiddleware
# REMOVE MIDDLEWARE ABOVE

app = FastAPI()

# THIS MIDDLEWARE IS SAFE ENOUGH BUT SHOULD BE REMOVED
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# REMOVE THE MIDDLEWARE ABOVE

@app.post("/signup")
def create_user(user_data: Compeer):
    with Session(engine) as session:
        # 1. Overwrite the input with the hash
        user_data.password_input = hash_password(user_data.password_input)
        
        # 2. Save to Postgres
        session.add(user_data)
        session.commit()
        session.refresh(user_data)
        return {"status": "success", "username": user_data.username}

@app.post("/links")
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