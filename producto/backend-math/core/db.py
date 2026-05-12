import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Conectamos con el link de tu .env
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Creamos la "fábrica" de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Esta función abre y cierra la puerta de la BD de forma segura
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
