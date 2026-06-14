import logging

from sqlalchemy import or_
from sqlalchemy.orm import Session
from models.preparacion import Preparacion
from schemas.menus import InputGenerador, OutputGenerador, RecetaOut, IngredienteOut
from core.valores_porciones import VALORES_PORCION
from core.restricciones import (
    RESTRICCIONES_DIETETICAS,
    nombre_contiene_rechazo,
    normalizar_texto,
    tags_excluidos_para,
)

logger = logging.getLogger(__name__)

# Mapeo entre las categorías REALES de la tabla `alimentos` (nombres exactos en DB)
# y los grupos de intercambio definidos en VALORES_PORCION.
MAPEO_CATEGORIAS = {
    "Cereales": "cereales_papas_legumbres_frescas",
    "Frutas": "frutas",
    "Lácteos Bajos en Grasa": "lacteos_bajos_grasa",
    "Lácteos Medios en Grasa": "lacteos_medios_grasa",
    "Lácteos Altos en Grasa": "lacteos_altos_grasa",
    "Verduras": "verduras_general",
    "Carnes Bajas en Grasa": "carnes_bajas_grasa",
    "Carnes Altas en Grasa": "carnes_altas_grasa",
    "Leguminosas": "leguminosas_secas",
    "Aceites y Grasas": "aceites_y_grasas",
    "Alimentos ricos en grasas": "alimentos_ricos_en_lipidos",
    "Galletas bajas en grasa": "galletas_bajas_grasa",
    "Azúcares": "azucares",
    # --- Alias heredados (datos antiguos o futuras importaciones con otro naming) ---
    "Verduras en general": "verduras_general",
    "Verduras libre consumo": "verduras_general",
    "Verduras de libre consumo": "verduras_general",
    "Legumbres": "leguminosas_secas",
    "Grasas": "aceites_y_grasas",
}

# Categorías presentes en la DB que NO aportan al cálculo de porciones y se
# ignoran de forma deliberada (no es un error de mapeo):
# - "Otros" (~108 alimentos): pendiente de reclasificación manual con criterio nutricional.
# - "Libre Consumo": misceláneos sin grupo de intercambio (galletas de soda, endulzantes, bebidas).
CATEGORIAS_IGNORADAS = {"Otros", "Libre Consumo"}

def ingrediente_violaciones(alimento, tags_excluidos: set, rechazos_normalizados: list) -> bool:
    """True si el alimento viola las restricciones del paciente.

    Dos mecanismos (ver convención en core/restricciones.py):
    1. Tags: intersección exacta entre `alimento.restricciones` y los tags
       incompatibles derivados de las restricciones dietéticas.
    2. Rechazos: match por palabra completa normalizada contra el nombre.

    Alimentos SIN tags no se excluyen por el mecanismo 1 (sin datos ≠ seguro;
    política documentada en core/restricciones.py).
    """
    if tags_excluidos and alimento.restricciones:
        if tags_excluidos & {normalizar_texto(t) for t in alimento.restricciones}:
            return True
    return nombre_contiene_rechazo(alimento.nombre, rechazos_normalizados)

def calcular_porciones_requeridas(ingredientes) -> dict:
    req = {}
    for ing in ingredientes:
        cat_db = ing.alimento.categoria
        if not cat_db:
            continue
        if cat_db in CATEGORIAS_IGNORADAS:
            continue
        mapped_cat = MAPEO_CATEGORIAS.get(cat_db)
        if not mapped_cat or mapped_cat not in VALORES_PORCION:
            # Categoría desconocida: la registramos para detectar desfases código/DB
            logger.warning(
                "Categoría de alimento sin mapeo a grupo de porciones: '%s' (alimento: %s)",
                cat_db,
                ing.alimento.nombre,
            )
            continue
            
        kcal_ingrediente = float(ing.cantidad_g) * float(ing.alimento.calorias_100g) / 100.0
        kcal_porcion = VALORES_PORCION[mapped_cat]["kcal"]
        
        porciones = round(kcal_ingrediente / kcal_porcion, 1)
        
        if mapped_cat not in req:
            req[mapped_cat] = 0.0
        req[mapped_cat] += porciones
    return req

def generar_menu(input_data: InputGenerador, db: Session) -> OutputGenerador:
    matches_exactos = []
    matches_parciales = []
    
    porciones_disp = input_data.porciones_disponibles.model_dump()

    restricciones_desconocidas = [
        r for r in input_data.restricciones_dieteticas
        if normalizar_texto(r) not in RESTRICCIONES_DIETETICAS
    ]
    if restricciones_desconocidas:
        logger.warning(
            "Restricciones dietéticas fuera del vocabulario (ignoradas): %s",
            restricciones_desconocidas,
        )

    tags_excluidos = tags_excluidos_para(input_data.restricciones_dieteticas)
    rechazos_normalizados = [
        normalizar_texto(r) for r in input_data.alimentos_rechazados if r.strip()
    ]

    query = db.query(Preparacion)
    if input_data.nutricionista_id:
        # Preparaciones del sistema + propias del nutricionista solicitante
        query = query.filter(
            or_(
                Preparacion.nutricionista_id.is_(None),
                Preparacion.nutricionista_id == input_data.nutricionista_id,
            )
        )
    preparaciones_db = query.all()
    
    for receta in preparaciones_db:
        # 1. Filtro de restricciones dietéticas y alimentos rechazados:
        #    la preparación queda excluida si CUALQUIER ingrediente viola.
        if any(
            ingrediente_violaciones(ing.alimento, tags_excluidos, rechazos_normalizados)
            for ing in receta.ingredientes
        ):
            continue
            
        # 2. Calcular porciones que requiere la receta
        requeridas = calcular_porciones_requeridas(receta.ingredientes)
        
        # 3. Filtro de Capacidad
        puede_prepararse = True
        es_exacto = True
        
        for grupo, cant_req in requeridas.items():
            cant_disp = porciones_disp.get(grupo, 0.0)
            if cant_req > cant_disp:
                puede_prepararse = False
                break
                
        if not puede_prepararse:
            continue
            
        for grupo, cant_disp in porciones_disp.items():
            if cant_disp > 0:
                cant_req = requeridas.get(grupo, 0.0)
                # Tolerancia para matches exactos
                if (cant_disp - cant_req) > 0.1:
                    es_exacto = False
                    break
                    
        ingredientes_out = [
            IngredienteOut(
                nombre=ing.alimento.nombre,
                marca=ing.alimento.marca,
                cantidad_g=float(ing.cantidad_g)
            ) for ing in receta.ingredientes
        ]
        
        receta_out = RecetaOut(
            id=str(receta.id),
            nombre=receta.nombre,
            descripcion=receta.descripcion,
            instrucciones=receta.instrucciones,
            ingredientes=ingredientes_out,
            porciones_requeridas=requeridas
        )
        
        if es_exacto:
            matches_exactos.append(receta_out)
        else:
            matches_parciales.append(receta_out)
            
    return OutputGenerador(
        matches_exactos=matches_exactos,
        matches_parciales=matches_parciales
    )
