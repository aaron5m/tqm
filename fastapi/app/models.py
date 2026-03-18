from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, JSON, String, text

class Link(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    url: str
    title: str = Field(default="", sa_column=Column(String))
    description: Optional[str] = None
    # Use default_factory so the timestamp is generated at the moment of creation
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    upvotes: int = Field(default=0)
    # For simplicity in prototyping, we use a JSON-type column for photo URLs
    photos: Optional[List[str]] = Field(default=[], sa_column=Column(JSON))

class Compeer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    password_input: str  # Never store plain text passwords!
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    signup_verification: str = Field(nullable=True)
    verified: bool = Field(
        default=False,                     # Python default for new objects
        sa_column_kwargs={"server_default": text("false")}  # DB default for migration
    )
    balance: float = Field(
        default=0.0,
        sa_column_kwargs={"server_default": text("0.0")}
    )