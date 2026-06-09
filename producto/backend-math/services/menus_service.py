from sqlalchemy.orm import Session
from models.preparacion import Preparacion
from schemas.menus import InputGenerador, OutputGenerador, RecetaOut, IngredienteOut
from core.valores_porciones import VALORES_PORCION

MAPEO_CATEGORIAS = {
    "Cereales": "cereales_papas_legumbres_frescas",
    "Frutas": "frutas",
    "Lácteos Bajos en Grasa": "lacteos_bajos_grasa",
    "Lácteos Medios en Grasa": "lacteos_medios_grasa",
    "Lácteos Altos en Grasa": "lacteos_altos_grasa",
    "Verduras en general": "verduras_general",
    "Verduras de libre consumo": "verduras_libre_consumo",
    "Carnes Bajas en Grasa": "carnes_bajas_grasa",
    "Carnes Altas en Grasa": "carnes_altas_grasa",
    "Legumbres": "leguminosas_secas",
    "Alimentos ricos en grasas": "alimentos_ricos_en_lipidos",
    "Grasas": "aceites_y_grasas",
    "Azúcares": "azucares"
}

def tiene_alergia(restricciones_alimento: list, alergias_paciente: list) -> bool:
    if not restricciones_alimento or not alergias_paciente:
        return False
    set_alergias = set([a.lower() for a in alergias_paciente])
    set_restricciones = set([r.lower() for r in restricciones_alimento])
    # Si hay intersección entre las etiquetas del alimento y las alergias del paciente, es rechazado
    return len(set_alergias.intersection(set_restricciones)) > 0

def calcular_porciones_requeridas(ingredientes) -> dict:
    req = {}
    for ing in ingredientes:
        cat_db = ing.alimento.categoria
        if not cat_db:
            continue
        mapped_cat = MAPEO_CATEGORIAS.get(cat_db)
        if not mapped_cat or mapped_cat not in VALORES_PORCION:
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
    alergias = input_data.alimentos_rechazados
    
    preparaciones_db = db.query(Preparacion).all()
    
    for receta in preparaciones_db:
        # 1. Filtro de Alergias / Rechazos
        contiene_alergeno = False
        for ing in receta.ingredientes:
            nombre_lower = ing.alimento.nombre.lower()
            if any(rechazo.lower() in nombre_lower for rechazo in alergias):
                contiene_alergeno = True
                break
            if tiene_alergia(ing.alimento.restricciones, alergias):
                contiene_alergeno = True
                break
                
        if contiene_alergeno:
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
