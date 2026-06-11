from pydantic import BaseModel, Field
from typing import Optional, Dict

class DatosPaciente(BaseModel):
    sexo: str = Field(..., description="'M' para masculino o 'F' para femenino")
    edad: int = Field(..., gt=0, description="Edad en años")
    talla_cm: float = Field(..., gt=0, description="Estatura en centímetros")
    peso_kg: float = Field(..., gt=0, description="Peso actual en kilogramos")
    porcentaje_grasa: Optional[float] = Field(None, ge=0, le=100, description="Porcentaje de grasa corporal (opcional)")

class ResultadoTMB(BaseModel):
    resultados_individuales: Dict[str, float]
    promedio_calculado: float
