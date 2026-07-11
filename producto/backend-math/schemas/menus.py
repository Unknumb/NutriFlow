import uuid
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from schemas.pautas import PorcionesInput

class InputGenerador(BaseModel):
    porciones_disponibles: PorcionesInput
    # Tiempo de comida para el que se genera (desayuno|almuerzo|cena|colacion).
    # None = sin filtro. Las preparaciones sin tipo_comida (sin clasificar)
    # nunca se excluyen por este filtro.
    tipo_comida: Optional[str] = None
    # Nombres de alimentos rechazados (texto libre). El match es por palabra
    # completa normalizada sin acentos: "pan" NO rechaza "panqueques".
    alimentos_rechazados: List[str] = Field(default_factory=list)
    # Vocabulario controlado (ver core/restricciones.py). Valores desconocidos
    # se ignoran con warning; backend-core valida con @IsIn antes de llamar.
    restricciones_dieteticas: List[str] = Field(default_factory=list)
    # Si viene informado, el generador considera solo las preparaciones del
    # sistema (nutricionista_id NULL) + las propias de ese nutricionista.
    nutricionista_id: Optional[str] = None

class IngredienteOut(BaseModel):
    nombre: str
    marca: Optional[str] = None
    cantidad_g: float
    # True si el alimento no tiene tags de restricción en el catálogo: con
    # restricciones activas, el filtrado NO pudo evaluarlo (sin datos ≠ seguro).
    sin_etiquetar: bool = False

class RecetaOut(BaseModel):
    id: str | uuid.UUID
    nombre: str
    descripcion: Optional[str] = None
    instrucciones: Optional[str] = None
    tipo_comida: Optional[str] = None
    imagen_url: Optional[str] = None
    calorias_totales: float = 0.0
    # % de las porciones disponibles de la comida que la receta utiliza (0-100).
    cobertura: float = 0.0
    ingredientes: List[IngredienteOut]
    porciones_requeridas: Dict[str, float]

class OutputGenerador(BaseModel):
    matches_exactos: List[RecetaOut]
    matches_parciales: List[RecetaOut]
