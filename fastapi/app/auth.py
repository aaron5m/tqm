from passlib.context import CryptContext

# Define the hashing algorithm once
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password_input: str) -> str:
    return pwd_context.hash(password_input)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)