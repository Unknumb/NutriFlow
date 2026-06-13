# Plan de rediseño visual — NutriFlow

**Alcance:** solo presentación (className, markup, CSS, fuentes, iconografía). Cero cambios en hooks, servicios, stores, rutas, payloads o lógica de componentes.

**Sujeto y trabajo del diseño:** herramienta clínica de uso diario para una nutricionista profesional. Sesiones largas, datos densos (macros, porciones, fichas). El diseño debe transmitir calma, precisión y oficio clínico — atractivo pero sobrio.

---

## 1. Dirección: "Consulta moderna"

Ni SaaS genérico blanco/teal (lo actual), ni dashboard oscuro de startup. La referencia es una consulta clínica contemporánea: materiales nobles, verde profundo, papel porcelana, números impecables. La personalidad vive en dos lugares — el lenguaje de color de los macros y la tipografía de datos — y todo lo demás se mantiene quieto y disciplinado.

### Tokens de color

| Token | Hex | Uso |
|---|---|---|
| `--pine` | `#1F3D33` | Verde pino profundo: sidebar, botones primarios, headings de énfasis |
| `--pine-soft` | `#2E5547` | Hover/estados del pino, eyebrows |
| `--porcelain` | `#FAFAF7` | Fondo general de contenido (blanco cálido, no crema) |
| `--ink` | `#22302B` | Texto principal (carbón verdoso, no negro puro) |
| `--mist` | `#E8EAE3` | Bordes, divisores, fondos de inputs |
| `--apricot` | `#E8A063` | Acento único y medido: CTAs secundarios, highlights, focus |

**Lenguaje de macros (semántico, consistente en TODA la app):**

| Macro | Hex | |
|---|---|---|
| Proteínas | `#3E6B8C` | azul acero |
| Carbohidratos | `#C98B3D` | ámbar trigo |
| Grasas/Lípidos | `#7A5C8E` | ciruela |
| Kcal/energía | `--pine` | |

Regla: estos cuatro colores aparecen idénticos en chips, gráficos (recharts), barras de distribución, leyendas y PDF. Hoy cada pantalla improvisa; esta consistencia es la mitad de la identidad.

### Tipografía

| Rol | Fuente (Google Fonts) | Uso |
|---|---|---|
| Display | **Bricolage Grotesque** (600/700) | Títulos de página y de card. Con carácter, usada con moderación |
| UI/Cuerpo | **Albert Sans** (400/500/600) | Todo el cuerpo, formularios, navegación |
| Datos | **Albert Sans con `font-variant-numeric: tabular-nums`** + **Spline Sans Mono** (500) para cifras protagonistas (kcal grandes, gramos en tablas) | Los números son el material principal de la app: siempre alineados, siempre tabulares |

Escala: 13/14 base UI, 16 cuerpo, 20 card-title, 28 page-title, 44 cifras hero (kcal del dashboard).

### Firma visual

**La unidad de porción como motivo.** Un punto/anillo relleno proporcional (●◐○) que representa porciones e identifica macros por color. Aparece en: distribución de porciones (reemplaza inputs planos), chips de preparaciones, leyendas de gráficos y el anillo de macros del dashboard. Es el único elemento "juguetón" permitido; nada más compite con él.

### Lo que NO va

Gradientes decorativos, glassmorphism (el login actual lo tiene — se elimina), sombras pesadas, blobs que siguen el mouse (login actual), emojis en UI, bordes redondeados gigantes (`rounded-2xl` → `rounded-lg` 10px máximo), morado `#aa3bff` heredado en `globals.css`.

---

## 2. Estructura por pantalla

### Shell (Sidebar + layout) — el cambio de mayor impacto
- Sidebar en `--pine` (canvas oscuro verde) con texto porcelana: identidad inmediata sin ser "dark mode". Ítem activo: fondo `--pine-soft` + barra de 3px `--apricot` a la izquierda.
- Navegación agrupada con labels de sección (encodifican el flujo de trabajo real):
  - **Clínica**: Dashboard, Fichas de Pacientes
  - **Planificación**: Macronutrientes, Porciones, Armador de Pautas
  - **Catálogo**: Biblioteca, Generador
- Bloque de usuario abajo con avatar de iniciales sobre `--apricot`.
- Labels acortados ("Dashboard Clínico" → "Dashboard"; "Macronutrientes Interactivo" → "Macronutrientes").
- Patrón de cabecera de página unificado: eyebrow (sección, mayúsculas pequeñas en `--pine-soft`) + título display + acción primaria a la derecha. Hoy cada página improvisa su header.

### Login / Registro / Recuperación
- Eliminar blobs y glass. Split-screen: panel izquierdo `--pine` con marca y una línea de propósito ("La consulta nutricional, ordenada."), panel derecho porcelana con el formulario limpio. Misma plantilla para las 4 pantallas auth.

### Dashboard Clínico
- Hero de datos: kcal objetivo del paciente activo en Spline Sans Mono 44px con anillo de macros (la firma) al lado; los tres macros como leyenda con sus colores semánticos.
- Cards de indicadores en grilla 12-col, una sola elevación (borde `--mist` + sombra apenas perceptible).

### Fichas de Pacientes
- Lista izquierda: filas con avatar de iniciales, edad/sexo en utility text; estado activo con la barra `--apricot`.
- Tabs rediseñadas como segmented control sobrio. La card de datos personales y chips (enfermedades/alergias/preferencias) adoptan los chips del sistema: borde 1px, sin rellenos saturados; alergias con punto rojo clínico discreto (`#B4533A`).

### Distribución de Porciones / Macronutrientes
- Aquí vive la firma: matriz comida × grupo con los anillos de porción por color de macro. Sliders/inputs con números tabulares. Gráficos recharts re-tematizados con la paleta semántica (solo props de color/estilo, no lógica).

### Biblioteca / Generador
- Cards de preparación: imagen arriba (ya existe), tipo de comida como eyebrow, macros como fila de puntos de color + cifra tabular. Badge "Sistema" en `--mist`, no en color.
- Generador: los toggles de restricciones como chips seleccionables con check, mismo componente que la ficha del paciente.

### Armador de Pautas
- Mantener densidad (es la pantalla de trabajo pesado); solo alinear a tokens: bordes `--mist`, drag handles visibles al hover, números tabulares.

### PDF (PautaDocumentPDF)
- Fuera del alcance inicial; fase opcional al final para alinear colores de macros.

---

## 3. Fases de implementación

| Fase | Contenido | Archivos clave | Esfuerzo |
|---|---|---|---|
| R1 | Tokens: `@theme` de Tailwind v4 en `globals.css` (colores, fuentes vía `@import` Google Fonts, radios, sombras), limpieza de variables muertas | `app/styles/globals.css` | S |
| R2 | Shell: Sidebar pino + grupos, header de página unificado (`PageHeader.tsx` nuevo en `shared/ui`) | `Sidebar.tsx`, `DashboardLayout.tsx`, +1 nuevo | S/M |
| R3 | Sistema de componentes: Card, Input, Button, Chip, Badge, Modal base alineados a tokens (los átomos existentes en `shared/ui/atoms` se completan) | `shared/ui/atoms/*`, `ChipsInput.tsx` | M |
| R4 | Auth (4 pantallas, plantilla split) | `features/login/components/*` | S/M |
| R5 | Dashboard + Macronutrientes + Porciones (firma de anillos, recharts re-tematizado) | `pages/dashboard`, `features/calculos`, `features/macronutrients`, `features/porciones` | L |
| R6 | Pacientes (lista, tabs, ficha, modales) | `features/pacientes/components/*` | M |
| R7 | Biblioteca + Generador (cards, chips de restricciones) | `features/preparaciones`, `features/generador`, `features/alimentos` | M |
| R8 | Pautas (armador) + barrido final: estados vacíos/errores con voz consistente, focus visible, `prefers-reduced-motion`, responsive ≥1024 prioritario | `features/pautas`, global | M |

Orden recomendado: R1→R2→R3 dan el 60% del impacto percibido; R4-R8 se pueden hacer pantalla por pantalla sin romper nada porque solo tocan presentación.

### Reglas de implementación (guardarraíles)
1. Prohibido tocar: hooks, servicios, stores, tipos, rutas, lógica de submit/validación. Solo JSX presentacional y clases.
2. Cada fase termina con `npx tsc --noEmit` + lint limpios y verificación visual en el navegador.
3. Animación: una transición de 150ms en hover/estados y un fade de entrada por página. Nada más (reduced-motion lo desactiva).
4. Accesibilidad como piso: contraste AA sobre `--pine` (texto porcelana pasa), focus ring `--apricot` visible, labels en todos los inputs.
