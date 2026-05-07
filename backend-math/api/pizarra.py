from fastapi import APIRouter
from schemas.pizarra import InputPizarra, OutputPizarra

router = APIRouter(prefix="/pizarra", tags=["Pizarra Visual"])

@router.post("/validar-pizarra", response_model=OutputPizarra)
def validar_pizarra(input_data: InputPizarra):
    """
    Recibe la pauta total y la distribución por tiempos de comida.
    El Schema 'InputPizarra' se encarga internamente de validar que
    las porciones distribuidas coincidan exactamente con la pauta total.
    """
    # Si llega hasta aquí, significa que la validación del modelo fue exitosa (código 200)
    # De lo contrario Pydantic lanza automáticamente un error 422 con los mensajes detallados.
    
    return OutputPizarra(
        mensaje="¡Distribución válida! Las porciones cuadran perfectamente con la pauta.",
        datos_validados=input_data
    )
