import uuid
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from schemas.pautas import PorcionesInput

class InputGenerador(BaseModel):
    porciones_disponibles: PorcionesInput
    # Nombres de alimentos rechazados (texto libre). El match es por palabra
    # completa normalizada sin acentos: "pan" NO rechaza "panqueques".
    alimentos_rechazados: List[str] = Field(default_factory=list)
    # Vocabulario controlado (ver core/restricciones.py). Valores desconocidos
    # se ignoran con warning; backend-core valida con @IsIn antes de llamar.
    restricciones_dieteticas: List[str] = Field(default_factory=list)
    # Texto libre de preferencias. Hoy es informativo (no afecta el filtrado);
    # se acepta para mantener estable el contrato con backend-core.
    preferencias_texto: Optional[str] = None
    # Si viene informado, el generador considera solo las preparaciones del
    # sistema (nutricionista_id NULL) + las propias de ese nutricionista.
    nutricionista_id: Optional[str] = None

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
