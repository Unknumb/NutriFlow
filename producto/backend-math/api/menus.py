from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.menus import InputGenerador, OutputGenerador
from services.menus_service import generar_menu
from core.db import get_db

router = APIRouter(prefix="/menus", tags=["Generador de Menús"])

@router.post("/generar-menu", response_model=OutputGenerador)
def generar_menu_endpoint(input_data: InputGenerador, db: Session = Depends(get_db)):
    """
    Recibe las porciones disponibles en un tiempo de comida y los alimentos rechazados.
    Retorna dos listas de preparaciones sugeridas: matches_exactos y matches_parciales.
    """
    resultado = generar_menu(input_data, db)
    return resultado
