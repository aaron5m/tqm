from sqlmodel import create_engine, SQLModel, Field
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, JSON
import os

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

class Link(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    url: str
    description: Optional[str] = None
    # Use default_factory so the timestamp is generated at the moment of creation
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    upvotes: int = Field(default=0)
    
    # For simplicity in prototyping, we use a JSON-type column for photo URLs
    photos: Optional[List[str]] = Field(default=[], sa_column=Column(JSON))

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    password_input: str  # Never store plain text passwords!
    timestamp: datetime = Field(default_factory=datetime.utcnow)