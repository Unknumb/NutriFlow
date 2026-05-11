def calcular_distribucion_macros(
    estrategia_calculo: str,
    peso_kg: float, 
    calorias_totales: float, 
    pct_proteina: float = None, 
    pct_grasa: float = None, 
    pct_carbos: float = None,
    g_kg_proteina: float = None,
    g_kg_grasa: float = None
) -> dict:
    # Factores de conversión estándar Atwater
    KCAL_PER_G_PROTEIN = 4.0
    KCAL_PER_G_CARB = 4.0
    KCAL_PER_G_FAT = 9.0

    if estrategia_calculo == 'porcentajes':
        # Cálculo de calorías por macronutriente
        cal_proteina = calorias_totales * (pct_proteina / 100.0)
        cal_grasa = calorias_totales * (pct_grasa / 100.0)
        cal_carbos = calorias_totales * (pct_carbos / 100.0)

        # Cálculo de gramos absolutos
        g_proteina = cal_proteina / KCAL_PER_G_PROTEIN
        g_grasa = cal_grasa / KCAL_PER_G_FAT
        g_carbos = cal_carbos / KCAL_PER_G_CARB

    elif estrategia_calculo == 'gramos_por_kilo':
        # Cálculo a partir de g/kg
        g_proteina = g_kg_proteina * peso_kg
        g_grasa = g_kg_grasa * peso_kg
        
        cal_proteina = g_proteina * KCAL_PER_G_PROTEIN
        cal_grasa = g_grasa * KCAL_PER_G_FAT
        
        # Carbohidratos por diferencia (el resto de las calorías)
        cal_carbos = calorias_totales - cal_proteina - cal_grasa
        if cal_carbos < 0:
            cal_carbos = 0 # Prevenir negativos si se exceden de las calorías totales
            
        g_carbos = cal_carbos / KCAL_PER_G_CARB
        
        # Calcular los porcentajes resultantes
        pct_proteina = (cal_proteina / calorias_totales) * 100
        pct_grasa = (cal_grasa / calorias_totales) * 100
        pct_carbos = (cal_carbos / calorias_totales) * 100

    # Cálculo final de gramos por kilogramo (para asegurar que todos los métodos tengan este dato)
    g_kg_prot_final = g_proteina / peso_kg
    g_kg_gras_final = g_grasa / peso_kg
    g_kg_carb_final = g_carbos / peso_kg

    return {
        "estrategia_utilizada": estrategia_calculo,
        "calorias_totales": calorias_totales,
        "peso_kg": peso_kg,
        "distribucion": {
            "proteinas": {
                "porcentaje": round(pct_proteina, 1),
                "calorias": round(cal_proteina, 1),
                "gramos": round(g_proteina, 1),
                "gramos_por_kg": round(g_kg_prot_final, 2)
            },
            "grasas": {
                "porcentaje": round(pct_grasa, 1),
                "calorias": round(cal_grasa, 1),
                "gramos": round(g_grasa, 1),
                "gramos_por_kg": round(g_kg_gras_final, 2)
            },
            "carbohidratos": {
                "porcentaje": round(pct_carbos, 1),
                "calorias": round(cal_carbos, 1),
                "gramos": round(g_carbos, 1),
                "gramos_por_kg": round(g_kg_carb_final, 2)
            }
        }
    }
