import logging

from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload
# Alimento debe estar importado para que SQLAlchemy resuelva la relación
# IngredientePreparacion.alimento (declarada por nombre) al configurar mappers.
from models.alimento import Alimento  # noqa: F401
from models.preparacion import IngredientePreparacion, Preparacion
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

# Vocabulario de tiempos de comida (CHECK en DB / DTO de backend-core).
TIPOS_COMIDA = {"desayuno", "almuerzo", "cena", "colacion"}

# Una receta puede excederse hasta esto por grupo respecto de lo disponible:
# con porciones redondeadas a 0.1 por ingrediente, descartar por 0.05 de exceso
# elimina recetas clínicamente equivalentes al plan.
TOLERANCIA_EXCESO = 0.2

# Sobrante máximo por grupo para considerar el match "exacto".
TOLERANCIA_EXACTO = 0.1

# Máximo de sugerencias parciales devueltas (ya ordenadas por cobertura).
MAX_PARCIALES = 20

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
    total_disponible = sum(c for c in porciones_disp.values() if c > 0)

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

    tipo_comida = (
        normalizar_texto(input_data.tipo_comida)
        if input_data.tipo_comida
        else None
    )
    if tipo_comida and tipo_comida not in TIPOS_COMIDA:
        logger.warning("tipo_comida fuera del vocabulario (ignorado): %s", tipo_comida)
        tipo_comida = None

    # selectinload evita el N+1 de cargar ingredientes/alimentos receta a receta.
    query = db.query(Preparacion).options(
        selectinload(Preparacion.ingredientes).selectinload(
            IngredientePreparacion.alimento
        )
    )
    if input_data.nutricionista_id:
        # Preparaciones del sistema + propias del nutricionista solicitante
        query = query.filter(
            or_(
                Preparacion.nutricionista_id.is_(None),
                Preparacion.nutricionista_id == input_data.nutricionista_id,
            )
        )
    if tipo_comida:
        # Las preparaciones sin clasificar (tipo_comida NULL) no se excluyen:
        # penalizarlas dejaría fuera las recetas propias aún sin categorizar.
        query = query.filter(
            or_(
                Preparacion.tipo_comida.is_(None),
                Preparacion.tipo_comida == tipo_comida,
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

        # Una receta que no consume porciones (solo ingredientes de categorías
        # ignoradas o sin mapear) calzaría con cualquier plan: es ruido, fuera.
        if not requeridas or sum(requeridas.values()) <= 0:
            continue

        # 3. Filtro de Capacidad (con tolerancia de exceso por grupo)
        puede_prepararse = True
        es_exacto = True

        for grupo, cant_req in requeridas.items():
            cant_disp = porciones_disp.get(grupo, 0.0)
            if cant_req > cant_disp + TOLERANCIA_EXCESO:
                puede_prepararse = False
                break

        if not puede_prepararse:
            continue

        for grupo, cant_disp in porciones_disp.items():
            if cant_disp > 0:
                cant_req = requeridas.get(grupo, 0.0)
                if (cant_disp - cant_req) > TOLERANCIA_EXACTO:
                    es_exacto = False
                    break

        marcar_sin_etiquetar = bool(tags_excluidos)
        ingredientes_out = [
            IngredienteOut(
                nombre=ing.alimento.nombre,
                marca=ing.alimento.marca,
                cantidad_g=float(ing.cantidad_g),
                sin_etiquetar=marcar_sin_etiquetar and not ing.alimento.restricciones,
            ) for ing in receta.ingredientes
        ]

        calorias_totales = sum(
            float(ing.cantidad_g) * float(ing.alimento.calorias_100g) / 100.0
            for ing in receta.ingredientes
        )

        # % de las porciones disponibles que la receta utiliza (cap a 100 por
        # la tolerancia de exceso).
        cobertura = (
            min(100.0, round(100.0 * sum(requeridas.values()) / total_disponible))
            if total_disponible > 0
            else 0.0
        )

        receta_out = RecetaOut(
            id=str(receta.id),
            nombre=receta.nombre,
            descripcion=receta.descripcion,
            instrucciones=receta.instrucciones,
            tipo_comida=receta.tipo_comida,
            imagen_url=receta.imagen_url,
            calorias_totales=round(calorias_totales, 1),
            cobertura=cobertura,
            ingredientes=ingredientes_out,
            porciones_requeridas=requeridas
        )

        if es_exacto:
            matches_exactos.append(receta_out)
        else:
            matches_parciales.append(receta_out)

    # Mejor cobertura primero; nombre como desempate estable.
    orden = lambda r: (-r.cobertura, r.nombre.lower())  # noqa: E731
    matches_exactos.sort(key=orden)
    matches_parciales.sort(key=orden)

    return OutputGenerador(
        matches_exactos=matches_exactos,
        matches_parciales=matches_parciales[:MAX_PARCIALES]
    )
