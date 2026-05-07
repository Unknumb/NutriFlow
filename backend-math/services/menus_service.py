from core.mock_recetas import MOCK_RECETAS
from schemas.menus import InputGenerador, OutputGenerador, RecetaOut

def contiene_rechazo(ingredientes: list, rechazos: list) -> bool:
    for ingrediente in ingredientes:
        ingrediente_lower = ingrediente.lower()
        for rechazo in rechazos:
            rechazo_lower = rechazo.lower()
            if rechazo_lower in ingrediente_lower:
                return True
    return False

def generar_menu(input_data: InputGenerador) -> OutputGenerador:
    matches_exactos = []
    matches_parciales = []
    
    porciones_disp = input_data.porciones_disponibles.model_dump()
    rechazos = input_data.alimentos_rechazados
    
    for receta in MOCK_RECETAS:
        # 1. Filtro de Rechazos
        if contiene_rechazo(receta["ingredientes"], rechazos):
            continue
            
        # 2. Filtro de Capacidad
        requeridas = receta["porciones_requeridas"]
        puede_prepararse = True
        es_exacto = True
        
        # Primero validamos si la receta pide algo que NO tenemos o más de lo que tenemos
        for grupo, cant_req in requeridas.items():
            cant_disp = porciones_disp.get(grupo, 0.0)
            if cant_req > cant_disp:
                puede_prepararse = False
                break
                
        if not puede_prepararse:
            continue
            
        # Si puede prepararse, verificamos si es exacto o parcial.
        # Es exacto si NO sobra nada en los grupos que tenemos disponibles.
        for grupo, cant_disp in porciones_disp.items():
            if cant_disp > 0:
                cant_req = requeridas.get(grupo, 0.0)
                # Usamos una pequeña tolerancia para los floats
                if (cant_disp - cant_req) > 0.001:
                    es_exacto = False
                    break
        
        receta_out = RecetaOut(**receta)
        if es_exacto:
            matches_exactos.append(receta_out)
        else:
            matches_parciales.append(receta_out)
            
    return OutputGenerador(
        matches_exactos=matches_exactos,
        matches_parciales=matches_parciales
    )
