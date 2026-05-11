from fastapi import APIRouter
from schemas.pautas import InputPauta, OutputPauta
from services.armador_service import armar_pauta

router = APIRouter(prefix="/pautas", tags=["Armador de Pautas"])

@router.post("/armar-pauta", response_model=OutputPauta)
def calcular_pauta(input_data: InputPauta):
    """
    Recibe la cantidad de porciones asignadas a los grupos de alimentos y opcionalmente metas (del cuadrador).
    Retorna la sumatoria total de Kcal y Macronutrientes, y las diferencias respecto a las metas si se envían.
    """
    resultado = armar_pauta(input_data)
    return resultado
