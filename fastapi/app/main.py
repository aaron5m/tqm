from fastapi import FastAPI, Depends
from sqlmodel import Session, select
from .auth import hash_password
from .models import engine, User # SQLModel class
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
def create_user(user_data: User):
    with Session(engine) as session:
        # 1. Overwrite the input with the hash
        user_data.password_input = hash_password(user_data.password_input)
        
        # 2. Save to Postgres
        session.add(user_data)
        session.commit()
        session.refresh(user_data)
        return {"status": "success", "username": user_data.username}