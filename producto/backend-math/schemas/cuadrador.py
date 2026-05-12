from pydantic import BaseModel, Field, model_validator
from typing import Dict, Optional, Literal

class InputCuadrador(BaseModel):
    estrategia_calculo: Literal['porcentajes', 'gramos_por_kilo'] = Field(..., description="Estrategia a utilizar para el cuadre")
    peso_kg: float = Field(..., gt=0, description="Peso del paciente en kg para cálculo de gramos relativos")
    calorias_totales: float = Field(..., gt=0, description="Calorías totales objetivo")
    
    # Campos para porcentajes
    porcentaje_proteina: Optional[float] = Field(None, ge=0, le=100)
    porcentaje_grasa: Optional[float] = Field(None, ge=0, le=100)
    porcentaje_carbohidrato: Optional[float] = Field(None, ge=0, le=100)
    
    # Campos para gramos por kilo
    g_kg_proteina: Optional[float] = Field(None, ge=0)
    g_kg_grasa: Optional[float] = Field(None, ge=0)

    @model_validator(mode='after')
    def validar_estrategia(self):
        if self.estrategia_calculo == 'porcentajes':
            if None in (self.porcentaje_proteina, self.porcentaje_grasa, self.porcentaje_carbohidrato):
                raise ValueError("Para la estrategia 'porcentajes' debes proveer los 3 porcentajes.")
            
            suma = self.porcentaje_proteina + self.porcentaje_grasa + self.porcentaje_carbohidrato
            if not (99.9 <= suma <= 100.1):
                raise ValueError(f"Los porcentajes deben sumar 100. Suma actual: {suma}")
                
        elif self.estrategia_calculo == 'gramos_por_kilo':
            if None in (self.g_kg_proteina, self.g_kg_grasa):
                raise ValueError("Para la estrategia 'gramos_por_kilo' debes proveer g_kg_proteina y g_kg_grasa.")
                
        return self

class MacroResult(BaseModel):
    porcentaje: float
    calorias: float
    gramos: float
    gramos_por_kg: float

class OutputCuadrador(BaseModel):
    estrategia_utilizada: str
    calorias_totales: float
    peso_kg: float
    distribucion: Dict[str, MacroResult]
