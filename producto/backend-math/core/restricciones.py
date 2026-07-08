# backend-math/core/restricciones.py
"""
Vocabulario controlado de restricciones dietéticas.

MANTENER SINCRONIZADO con:
  - backend-core/src/menus/restricciones.constants.ts
  - nutriflow-frontend/src/features/generador/constants/restricciones.ts

CONVENCIÓN SEMÁNTICA de `alimentos.restricciones` (text[]):
  Cada tag describe lo que el alimento CONTIENE o ES, p.ej. `contiene_gluten`
  significa "este alimento contiene (o muy probablemente contiene) gluten".
  En la misma columna conviven atributos positivos heredados
  (`alto_en_proteina`, `alto_en_fibra`) que NO participan del filtrado.

  El paciente declara restricciones en positivo (`sin_gluten`, `vegano`, ...)
  y el generador excluye cualquier preparación donde ALGÚN ingrediente tenga
  un tag incompatible según RESTRICCION_A_TAGS_EXCLUIDOS.

POLÍTICA ANTE ALIMENTOS SIN TAGS:
  Solo se excluyen alimentos explícitamente taggeados. Un alimento sin tags
  NO se considera "seguro" — simplemente no hay datos. Se eligió no excluir
  lo no-taggeado porque haría inutilizable el generador; la nutricionista
  valida la sugerencia final (el generador marca `sin_etiquetar` esos
  ingredientes cuando hay restricciones activas).

MARCADOR `verificado_sin_restricciones`:
  Documenta que el alimento FUE evaluado y no le aplica ninguna restricción
  (frutas, verduras, aceites vegetales, arroz...). No participa del filtrado
  (ninguna entrada de RESTRICCION_A_TAGS_EXCLUIDOS lo referencia); su único
  efecto es que el alimento deja de contar como "sin etiquetar". Cobertura al
  2026-07-08: ~880/885 evaluados (tag_restricciones.ts heurístico +
  tags_manuales.ts revisión explícita).
"""

import re
import unicodedata

# Restricciones que puede declarar un paciente (entrada del generador).
RESTRICCIONES_DIETETICAS = frozenset(
    {
        "vegetariano",
        "vegano",
        "sin_gluten",
        "sin_lactosa",
        "sin_mariscos",
        "sin_frutos_secos",
        "sin_huevo",
        "sin_cerdo",
        "bajo_sodio",
        "sin_azucar",
    }
)

# Restricción del paciente -> tags de alimento que la violan.
# Nota: `vegano` excluye también `no_vegetariano` (todo lo no-vegetariano
# es, por definición, no-vegano).
RESTRICCION_A_TAGS_EXCLUIDOS = {
    "vegetariano": {"no_vegetariano"},
    "vegano": {"no_vegano", "no_vegetariano"},
    "sin_gluten": {"contiene_gluten"},
    "sin_lactosa": {"contiene_lactosa"},
    "sin_mariscos": {"contiene_mariscos"},
    "sin_frutos_secos": {"contiene_frutos_secos"},
    "sin_huevo": {"contiene_huevo"},
    "sin_cerdo": {"contiene_cerdo"},
    "bajo_sodio": {"alto_en_sodio"},
    "sin_azucar": {"alto_en_azucar"},
}


def normalizar_texto(texto: str) -> str:
    """Minúsculas y sin acentos/diacríticos, para comparaciones robustas."""
    descompuesto = unicodedata.normalize("NFD", texto.lower().strip())
    return "".join(c for c in descompuesto if not unicodedata.combining(c))


def tags_excluidos_para(restricciones_paciente: list[str]) -> set[str]:
    """Union de tags de alimento incompatibles con las restricciones dadas.

    Las restricciones desconocidas se ignoran (backend-core ya valida con
    @IsIn; esto protege llamadas directas al microservicio).
    """
    tags: set[str] = set()
    for restriccion in restricciones_paciente:
        tags |= RESTRICCION_A_TAGS_EXCLUIDOS.get(normalizar_texto(restriccion), set())
    return tags


def nombre_contiene_rechazo(nombre_alimento: str, rechazos_normalizados: list[str]) -> bool:
    """Match por PALABRA COMPLETA normalizada (no substring).

    "pan" rechaza "Pan integral" pero NO "panqueques" ni "plátano".
    Los rechazos multi-palabra ("pan integral") también funcionan.
    """
    nombre_norm = normalizar_texto(nombre_alimento)
    for rechazo in rechazos_normalizados:
        if not rechazo:
            continue
        if re.search(rf"\b{re.escape(rechazo)}\b", nombre_norm):
            return True
    return False
