from pydantic import BaseModel, Field
from typing import Optional

class PorcionesInput(BaseModel):
    cereales_papas_legumbres_frescas: float = Field(0.0, ge=0)
    verduras_general: float = Field(0.0, ge=0)
    verduras_libre_consumo: float = Field(0.0, ge=0)
    frutas: float = Field(0.0, ge=0)
    lacteos_bajos_grasa: float = Field(0.0, ge=0)
    lacteos_medios_grasa: float = Field(0.0, ge=0)
    lacteos_altos_grasa: float = Field(0.0, ge=0)
    carnes_bajas_grasa: float = Field(0.0, ge=0)
    carnes_altas_grasa: float = Field(0.0, ge=0)
    leguminosas_secas: float = Field(0.0, ge=0)
    alimentos_ricos_en_lipidos: float = Field(0.0, ge=0)
    aceites_y_grasas: float = Field(0.0, ge=0)
    azucares: float = Field(0.0, ge=0)

class MetasInput(BaseModel):
    kcal: float = Field(..., ge=0)
    prot: float = Field(..., ge=0)
    lip: float = Field(..., ge=0)
    cho: float = Field(..., ge=0)

class InputPauta(BaseModel):
    porciones: PorcionesInput
    metas_cuadrador: Optional[MetasInput] = None

class TotalesNutricionales(BaseModel):
    kcal: float
    prot: float
    lip: float
    cho: float

class OutputPauta(BaseModel):
    totales_acumulados: TotalesNutricionales
    diferencias: Optional[TotalesNutricionales] = None
