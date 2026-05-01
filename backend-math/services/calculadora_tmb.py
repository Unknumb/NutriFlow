def calcular_harris_benedict(peso: float, talla: float, edad: int, sexo: str) -> float:
    # Ecuación Revisada de Roza y Shizgal (1984)
    if sexo.upper() == 'M':
        return 88.362 + (13.397 * peso) + (4.799 * talla) - (5.677 * edad)
    else:
        return 447.593 + (9.247 * peso) + (3.098 * talla) - (4.330 * edad)

def calcular_mifflin_st_jeor(peso: float, talla: float, edad: int, sexo: str) -> float:
    base = (10 * peso) + (6.25 * talla) - (5 * edad)
    if sexo.upper() == 'M':
        return base + 5
    else:
        return base - 161

def calcular_katch_mcardle(peso: float, porcentaje_grasa: float) -> float:
    masa_magra = peso * (1 - (porcentaje_grasa / 100))
    return 370 + (21.6 * masa_magra)

def calcular_cunningham(peso: float, porcentaje_grasa: float) -> float:
    masa_magra = peso * (1 - (porcentaje_grasa / 100))
    return 500 + (22 * masa_magra)

def calcular_owen(peso: float, sexo: str) -> float:
    if sexo.upper() == 'M':
        return 879 + (10.2 * peso)
    else:
        return 795 + (7.18 * peso)

def calcular_oxford(peso: float, edad: int, sexo: str) -> float:
    # Ecuaciones de Henry (2005) - Oxford
    if sexo.upper() == 'M':
        if 18 <= edad <= 30: return (16.0 * peso) + 545
        elif 31 <= edad <= 60: return (14.2 * peso) + 593
        elif edad > 60: return (13.5 * peso) + 514
        else: return (17.5 * peso) + 651 # < 18 approximation
    else:
        if 18 <= edad <= 30: return (13.1 * peso) + 558
        elif 31 <= edad <= 60: return (9.74 * peso) + 694
        elif edad > 60: return (10.2 * peso) + 572
        else: return (12.2 * peso) + 746 # < 18 approximation

def calcular_fao_oms(peso: float, edad: int, sexo: str) -> float:
    # Ecuaciones FAO/OMS/UNU (1985)
    if sexo.upper() == 'M':
        if 18 <= edad <= 30: return (15.3 * peso) + 679
        elif 31 <= edad <= 60: return (11.6 * peso) + 879
        elif edad > 60: return (13.5 * peso) + 487
        else: return (17.5 * peso) + 651 # < 18 approximation
    else:
        if 18 <= edad <= 30: return (14.7 * peso) + 496
        elif 31 <= edad <= 60: return (8.7 * peso) + 829
        elif edad > 60: return (10.5 * peso) + 596
        else: return (12.2 * peso) + 746 # < 18 approximation

def calcular_todas_tmb(peso: float, talla: float, edad: int, sexo: str, porcentaje_grasa: float = None) -> dict:
    resultados = {}
    
    # Fórmulas que siempre aplican
    resultados["Harris-Benedict"] = round(calcular_harris_benedict(peso, talla, edad, sexo), 1)
    resultados["Mifflin-St Jeor"] = round(calcular_mifflin_st_jeor(peso, talla, edad, sexo), 1)
    resultados["Owen"] = round(calcular_owen(peso, sexo), 1)
    resultados["Oxford"] = round(calcular_oxford(peso, edad, sexo), 1)
    resultados["FAO/OMS"] = round(calcular_fao_oms(peso, edad, sexo), 1)
    
    # Fórmulas que requieren porcentaje de grasa
    if porcentaje_grasa is not None:
        resultados["Katch-McArdle"] = round(calcular_katch_mcardle(peso, porcentaje_grasa), 1)
        resultados["Cunningham"] = round(calcular_cunningham(peso, porcentaje_grasa), 1)
        
    # Calcular promedio
    promedio = round(sum(resultados.values()) / len(resultados), 1)
    
    return {
        "resultados_individuales": resultados,
        "promedio_calculado": promedio
    }
