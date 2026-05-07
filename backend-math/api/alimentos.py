from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.db import get_db
from models.alimento import Alimento

# APIRouter nos permite separar las rutas en distintos archivos
router = APIRouter()

@router.get("/alimentos")
def obtener_alimentos(db: Session = Depends(get_db)):
    # ¡Aquí ocurre la magia! Usamos el molde de SQLAlchemy para buscar todo
    lista_alimentos = db.query(Alimento).all()
    return lista_alimentos
