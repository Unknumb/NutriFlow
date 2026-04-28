from fastapi import APIRouter, HTTPException
from schemas.calculos import DatosPaciente, ResultadoTMB
from services.calculadora_tmb import calcular_todas_tmb

router = APIRouter()

@router.post("/tmb", response_model=ResultadoTMB, summary="Calcular TMB Inteligente")
def calcular_tmb(datos: DatosPaciente):
    if datos.sexo.upper() not in ['M', 'F']:
        raise HTTPException(status_code=400, detail="El sexo debe ser 'M' (masculino) o 'F' (femenino)")
        
    resultado = calcular_todas_tmb(
        peso=datos.peso_kg,
        talla=datos.talla_cm,
        edad=datos.edad,
        sexo=datos.sexo,
        porcentaje_grasa=datos.porcentaje_grasa
    )
    
    return resultado
