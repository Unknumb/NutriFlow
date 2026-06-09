import uuid
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from schemas.pautas import PorcionesInput

class InputGenerador(BaseModel):
    porciones_disponibles: PorcionesInput
    alimentos_rechazados: List[str] = Field(default_factory=list)

class IngredienteOut(BaseModel):
    nombre: str
    marca: Optional[str] = None
    cantidad_g: float

class RecetaOut(BaseModel):
    id: str | uuid.UUID
    nombre: str
    descripcion: Optional[str] = None
    instrucciones: Optional[str] = None
    ingredientes: List[IngredienteOut]
    porciones_requeridas: Dict[str, float]

class OutputGenerador(BaseModel):
    matches_exactos: List[RecetaOut]
    matches_parciales: List[RecetaOut]
