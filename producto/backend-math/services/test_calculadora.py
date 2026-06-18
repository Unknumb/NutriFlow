"""
Pruebas unitarias del módulo de cálculo metabólico (backend-math).

Validan que las fórmulas de Tasa Metabólica Basal (TMB) devuelven el
resultado matemático correcto. Los valores esperados están calculados a
mano en los comentarios para que sirvan como evidencia de verificación.

Ejecutar desde producto/backend-math con:
    .venv/bin/python -m pytest services/test_calculadora.py -v
"""

import pytest

from calculadora_tmb import (
    calcular_harris_benedict,
    calcular_mifflin_st_jeor,
    calcular_todas_tmb,
)


def test_harris_benedict_hombre():
    """Harris-Benedict (Roza-Shizgal 1984) para sexo masculino.

    88.362 + (13.397*70) + (4.799*175) - (5.677*30)
    = 88.362 + 937.79 + 839.825 - 170.31 = 1695.667 kcal
    """
    resultado = calcular_harris_benedict(peso=70, talla=175, edad=30, sexo="M")
    assert resultado == pytest.approx(1695.667, abs=1e-3)


def test_harris_benedict_mujer():
    """Harris-Benedict para sexo femenino.

    447.593 + (9.247*60) + (3.098*165) - (4.330*25)
    = 447.593 + 554.82 + 511.17 - 108.25 = 1405.333 kcal
    """
    resultado = calcular_harris_benedict(peso=60, talla=165, edad=25, sexo="F")
    assert resultado == pytest.approx(1405.333, abs=1e-3)


def test_mifflin_st_jeor_hombre_y_mujer():
    """Mifflin-St Jeor: base = (10*peso)+(6.25*talla)-(5*edad); +5 (M) / -161 (F).

    Hombre (80,180,40): base = 800 + 1125 - 200 = 1725 -> 1725 + 5 = 1730.0
    Mujer  (60,165,25): base = 600 + 1031.25 - 125 = 1506.25 -> 1506.25 - 161 = 1345.25
    """
    hombre = calcular_mifflin_st_jeor(peso=80, talla=180, edad=40, sexo="M")
    mujer = calcular_mifflin_st_jeor(peso=60, talla=165, edad=25, sexo="F")
    assert hombre == pytest.approx(1730.0, abs=1e-9)
    assert mujer == pytest.approx(1345.25, abs=1e-9)


def test_calcular_todas_tmb_promedio_y_formulas_con_grasa():
    """El agregador devuelve las fórmulas base sin %grasa y suma Katch/Cunningham
    sólo cuando se entrega el porcentaje de grasa. El promedio es la media de
    todas las fórmulas calculadas."""
    sin_grasa = calcular_todas_tmb(peso=70, talla=175, edad=30, sexo="M")
    base = sin_grasa["resultados_individuales"]
    assert set(base) == {"Harris-Benedict", "Mifflin-St Jeor", "Owen", "Oxford", "FAO/OMS"}
    assert "Katch-McArdle" not in base
    # El promedio reportado coincide con la media de las fórmulas individuales.
    esperado = round(sum(base.values()) / len(base), 1)
    assert sin_grasa["promedio_calculado"] == pytest.approx(esperado, abs=0.05)

    con_grasa = calcular_todas_tmb(peso=70, talla=175, edad=30, sexo="M", porcentaje_grasa=20)
    assert "Katch-McArdle" in con_grasa["resultados_individuales"]
    assert "Cunningham" in con_grasa["resultados_individuales"]
