from fastapi import APIRouter, HTTPException
from schemas.calculos import DatosPaciente, ResultadoTMB
from schemas.cuadrador import InputCuadrador, OutputCuadrador
from services.calculadora_tmb import calcular_todas_tmb
from services.distribucion_service import calcular_distribucion_macros

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

@router.post("/cuadrador", response_model=OutputCuadrador, summary="Cuadrador Dinámico de Macronutrientes")
def cuadrar_macros(datos: InputCuadrador):
    resultado = calcular_distribucion_macros(
        estrategia_calculo=datos.estrategia_calculo,
        peso_kg=datos.peso_kg,
        calorias_totales=datos.calorias_totales,
        pct_proteina=datos.porcentaje_proteina,
        pct_grasa=datos.porcentaje_grasa,
        pct_carbos=datos.porcentaje_carbohidrato,
        g_kg_proteina=datos.g_kg_proteina,
        g_kg_grasa=datos.g_kg_grasa
    )
    return resultado
