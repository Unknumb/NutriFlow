"""
Cálculo de pesos de referencia y estado nutricional (IMC).

Fórmulas estándar de nutrición clínica. Pendiente de validación por Javiera
(ver backend-core/prisma/revision_categorias_otros.md para el patrón de revisión):

- IMC = peso(kg) / talla(m)^2
- Rango saludable: IMC 18.5 a 24.9 (OMS)
- Peso ideal (teórico): IMC 22 x talla(m)^2  -> punto medio práctico del rango normal
- Peso ajustado: usado para estimar requerimientos en pacientes con exceso de peso,
  para no sobreestimar a partir del peso real:
      peso_ajustado = peso_ideal + factor * (peso_actual - peso_ideal)
  con factor 0.25 y 0.50 (los dos más usados en la práctica).
"""

IMC_IDEAL = 22.0
IMC_SALUDABLE_MIN = 18.5
IMC_SALUDABLE_MAX = 24.9


def clasificar_imc(imc: float) -> str:
    if imc < 18.5:
        return "Bajo peso"
    if imc < 25:
        return "Normal"
    if imc < 30:
        return "Sobrepeso"
    if imc < 35:
        return "Obesidad I"
    if imc < 40:
        return "Obesidad II"
    return "Obesidad III"


def calcular_pesos_referencia(peso_kg: float, talla_cm: float) -> dict:
    talla_m = talla_cm / 100.0
    talla_m2 = talla_m * talla_m

    imc_actual = peso_kg / talla_m2 if talla_m2 > 0 else 0.0
    peso_ideal = IMC_IDEAL * talla_m2
    peso_min = IMC_SALUDABLE_MIN * talla_m2
    peso_max = IMC_SALUDABLE_MAX * talla_m2

    # El peso ajustado solo tiene sentido cuando el peso actual supera al ideal.
    delta = peso_kg - peso_ideal
    peso_ajustado_25 = peso_ideal + 0.25 * delta if delta > 0 else peso_ideal
    peso_ajustado_50 = peso_ideal + 0.50 * delta if delta > 0 else peso_ideal

    return {
        "imc_actual": round(imc_actual, 1),
        "clasificacion_imc": clasificar_imc(imc_actual),
        "peso_ideal": round(peso_ideal, 1),
        "peso_saludable_min": round(peso_min, 1),
        "peso_saludable_max": round(peso_max, 1),
        "peso_ajustado_25": round(peso_ajustado_25, 1),
        "peso_ajustado_50": round(peso_ajustado_50, 1),
        "aplica_ajuste": delta > 0,
    }
