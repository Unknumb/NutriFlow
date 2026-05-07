from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from schemas.pautas import PorcionesInput

class InputGenerador(BaseModel):
    porciones_disponibles: PorcionesInput
    alimentos_rechazados: List[str] = Field(default_factory=list)

class RecetaOut(BaseModel):
    id: int
    nombre: str
    ingredientes: List[str]
    porciones_requeridas: Dict[str, float]

class OutputGenerador(BaseModel):
    matches_exactos: List[RecetaOut]
    matches_parciales: List[RecetaOut]
