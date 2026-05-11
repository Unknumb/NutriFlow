from pydantic import BaseModel, model_validator
from typing import Dict, Any
from schemas.pautas import PorcionesInput

class InputPizarra(BaseModel):
    pauta_total: PorcionesInput
    distribucion: Dict[str, PorcionesInput]

    @model_validator(mode='after')
    def validar_distribucion_porciones(self) -> 'InputPizarra':
        totales_esperados = self.pauta_total.model_dump()
        totales_distribuidos = {k: 0.0 for k in totales_esperados.keys()}
        
        # Sum portions across all meal times
        for tiempo_comida, porciones_tiempo in self.distribucion.items():
            porciones_dict = porciones_tiempo.model_dump()
            for grupo, cantidad in porciones_dict.items():
                totales_distribuidos[grupo] += cantidad
                
        # Validate that sums match exactly, otherwise accumulate errors
        errores = []
        for grupo, cantidad_esperada in totales_esperados.items():
            cantidad_distribuida = totales_distribuidos[grupo]
            # Use a small tolerance for floating point comparisons just in case
            if abs(cantidad_esperada - cantidad_distribuida) > 0.001:
                errores.append(f"Error en {grupo}: La pauta indica {cantidad_esperada} porciones, pero distribuiste {cantidad_distribuida}.")
                
        if errores:
            raise ValueError(" | ".join(errores))
            
        return self

class OutputPizarra(BaseModel):
    mensaje: str
    datos_validados: InputPizarra
