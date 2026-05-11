from fastapi import APIRouter
from schemas.menus import InputGenerador, OutputGenerador
from services.menus_service import generar_menu

router = APIRouter(prefix="/menus", tags=["Generador de Menús"])

@router.post("/generar-menu", response_model=OutputGenerador)
def generar_menu_endpoint(input_data: InputGenerador):
    """
    Recibe las porciones disponibles en un tiempo de comida y los alimentos rechazados.
    Retorna dos listas de preparaciones sugeridas: matches_exactos y matches_parciales.
    """
    resultado = generar_menu(input_data)
    return resultado
