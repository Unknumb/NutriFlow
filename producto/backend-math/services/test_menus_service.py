"""
Pruebas unitarias del generador de menús (backend-math).

Cubren la lógica pura de generar_menu con una sesión de DB simulada:
clasificación exacto/parcial con tolerancias, score de cobertura y su
ordenamiento, exclusión de recetas que no consumen porciones, límite de
parciales y marcado de ingredientes sin etiquetar.

Ejecutar desde producto/backend-math con:
    .venv/bin/python -m pytest services/test_menus_service.py -v
"""

from types import SimpleNamespace

import pytest

from schemas.menus import InputGenerador
from services.menus_service import (
    MAX_PARCIALES,
    calcular_porciones_requeridas,
    generar_menu,
)


# ── stubs de DB ───────────────────────────────────────────────────────────────
class FakeQuery:
    """Query mínima: options/filter son no-op, all() devuelve lo inyectado."""

    def __init__(self, items):
        self._items = items

    def options(self, *args, **kwargs):
        return self

    def filter(self, *args, **kwargs):
        return self

    def all(self):
        return self._items


class FakeDB:
    def __init__(self, preparaciones):
        self._preparaciones = preparaciones

    def query(self, *args, **kwargs):
        return FakeQuery(self._preparaciones)


def alimento(nombre, categoria, kcal_100g, restricciones=None):
    return SimpleNamespace(
        nombre=nombre,
        marca=None,
        categoria=categoria,
        calorias_100g=kcal_100g,
        restricciones=restricciones or [],
    )


def ingrediente(alim, cantidad_g):
    return SimpleNamespace(alimento=alim, cantidad_g=cantidad_g)


def preparacion(nombre, ingredientes, tipo_comida=None):
    return SimpleNamespace(
        id="00000000-0000-0000-0000-000000000001",
        nombre=nombre,
        descripcion=None,
        instrucciones=None,
        tipo_comida=tipo_comida,
        imagen_url=None,
        nutricionista_id=None,
        ingredientes=ingredientes,
    )


def entrada(porciones, **kwargs):
    return InputGenerador(porciones_disponibles=porciones, **kwargs)


# 100 g de manzana (65 kcal/100g) = 65 kcal = 1.0 porción de frutas (65 kcal/porción)
MANZANA = alimento("Manzana", "Frutas", 65)
# 200 g de arroz (70 kcal/100g) = 140 kcal = 1.0 porción de cereales (140 kcal/porción)
ARROZ = alimento("Arroz", "Cereales", 70)
# Alimento de categoría ignorada: no aporta porciones
ENDULZANTE = alimento("Endulzante", "Libre Consumo", 0)


class TestCalcularPorcionesRequeridas:
    def test_convierte_kcal_de_ingredientes_a_porciones_por_grupo(self):
        req = calcular_porciones_requeridas(
            [ingrediente(MANZANA, 100), ingrediente(ARROZ, 200)]
        )
        assert req == {"frutas": 1.0, "cereales_papas_legumbres_frescas": 1.0}

    def test_ignora_categorias_sin_grupo_de_intercambio(self):
        req = calcular_porciones_requeridas([ingrediente(ENDULZANTE, 10)])
        assert req == {}


class TestGenerarMenu:
    def test_match_exacto_cuando_usa_todas_las_porciones(self):
        db = FakeDB([preparacion("Ensalada de frutas", [ingrediente(MANZANA, 100)])])
        out = generar_menu(entrada({"frutas": 1.0}), db)
        assert len(out.matches_exactos) == 1
        assert out.matches_parciales == []
        assert out.matches_exactos[0].cobertura == 100.0

    def test_match_parcial_cuando_sobran_porciones(self):
        db = FakeDB([preparacion("Ensalada de frutas", [ingrediente(MANZANA, 100)])])
        out = generar_menu(entrada({"frutas": 1.0, "cereales_papas_legumbres_frescas": 2.0}), db)
        assert out.matches_exactos == []
        assert len(out.matches_parciales) == 1
        # usa 1 de 3 porciones disponibles → 33%
        assert out.matches_parciales[0].cobertura == pytest.approx(33.0)

    def test_tolerancia_de_exceso_no_descarta_recetas_al_borde(self):
        # 110 g de manzana = 1.1 porciones con 1.0 disponible: exceso 0.1 ≤ 0.2
        db = FakeDB([preparacion("Fruta grande", [ingrediente(MANZANA, 110)])])
        out = generar_menu(entrada({"frutas": 1.0}), db)
        assert len(out.matches_exactos) == 1

    def test_descarta_recetas_sobre_la_tolerancia_de_exceso(self):
        # 150 g de manzana = 1.5 porciones con 1.0 disponible: exceso 0.5 > 0.2
        db = FakeDB([preparacion("Mucha fruta", [ingrediente(MANZANA, 150)])])
        out = generar_menu(entrada({"frutas": 1.0}), db)
        assert out.matches_exactos == []
        assert out.matches_parciales == []

    def test_excluye_recetas_que_no_consumen_porciones(self):
        db = FakeDB([preparacion("Solo endulzante", [ingrediente(ENDULZANTE, 10)])])
        out = generar_menu(entrada({"frutas": 2.0}), db)
        assert out.matches_exactos == []
        assert out.matches_parciales == []

    def test_ordena_por_cobertura_descendente(self):
        chica = preparacion("Chica", [ingrediente(MANZANA, 100)])       # 1 porción
        grande = preparacion("Grande", [ingrediente(MANZANA, 290)])     # ~2.9 porciones
        db = FakeDB([chica, grande])
        out = generar_menu(entrada({"frutas": 3.0}), db)
        nombres = [r.nombre for r in out.matches_exactos + out.matches_parciales]
        assert nombres == ["Grande", "Chica"]

    def test_limita_los_matches_parciales(self):
        recetas = [
            preparacion(f"Receta {i}", [ingrediente(MANZANA, 100)])
            for i in range(MAX_PARCIALES + 5)
        ]
        db = FakeDB(recetas)
        out = generar_menu(entrada({"frutas": 5.0}), db)
        assert len(out.matches_parciales) == MAX_PARCIALES

    def test_calorias_totales_de_la_receta(self):
        db = FakeDB([preparacion("Fruta", [ingrediente(MANZANA, 100)])])
        out = generar_menu(entrada({"frutas": 1.0}), db)
        assert out.matches_exactos[0].calorias_totales == pytest.approx(65.0)

    def test_marca_ingredientes_sin_etiquetar_solo_con_restricciones_activas(self):
        db = FakeDB([preparacion("Fruta", [ingrediente(MANZANA, 100)])])

        sin_restricciones = generar_menu(entrada({"frutas": 1.0}), db)
        assert sin_restricciones.matches_exactos[0].ingredientes[0].sin_etiquetar is False

        con_restricciones = generar_menu(
            entrada({"frutas": 1.0}, restricciones_dieteticas=["vegano"]), db
        )
        assert con_restricciones.matches_exactos[0].ingredientes[0].sin_etiquetar is True

    def test_excluye_recetas_con_ingredientes_de_tag_incompatible(self):
        pollo = alimento("Pollo", "Carnes Bajas en Grasa", 120, ["no_vegetariano"])
        db = FakeDB([preparacion("Pollo asado", [ingrediente(pollo, 100)])])
        out = generar_menu(
            entrada({"carnes_bajas_grasa": 2.0}, restricciones_dieteticas=["vegetariano"]),
            db,
        )
        assert out.matches_exactos == []
        assert out.matches_parciales == []

    def test_excluye_recetas_con_alimentos_rechazados(self):
        db = FakeDB([preparacion("Fruta", [ingrediente(MANZANA, 100)])])
        out = generar_menu(
            entrada({"frutas": 1.0}, alimentos_rechazados=["manzana"]), db
        )
        assert out.matches_exactos == []
        assert out.matches_parciales == []
