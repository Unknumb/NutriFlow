# Auditoría de flujo de trabajo — "ojos de Javiera" (2026-06-13)

Recorrido completo del flujo real de una nutricionista (login → crear paciente → activarlo → macros → porciones → pauta → biblioteca → generador → ficha → perfil) hecho con navegador automatizado, registrando errores de consola, requests fallidos y capturas. Resultado: **el flujo feliz funciona de punta a punta sin errores de consola**, pero hay hallazgos importantes.

## ✅ Resuelto el 2026-06-13 (P0 completos + armador/opciones/PDF)

- **P0-1**: pesos de referencia ahora se calculan de verdad en backend-math (`calculadora_pesos.py`: IMC, clasificación, peso ideal/saludable/ajustado) y se muestran reales por paciente en el dashboard.
- **P0-2**: la card de macros del dashboard es ahora un resumen real de solo lectura (misma fuente que Macronutrientes) con link para ajustar.
- **P0-3**: el "Plan de distribución" del generador refleja las porciones reales por comida (selector de comida) y traduce correctamente las claves a backend-math (`gruposMath.ts`); el botón se deshabilita y guía si no hay porciones.
- **P0-4**: fechas corregidas a es-CL sin desfase de zona horaria (`shared/utils/fechas.ts`).
- **Armador**: "Verduras de libre consumo" ahora es opcional (toggle en el encabezado).
- **Opciones por Grupo**: equivalencias cargadas en vivo desde el catálogo real (`alimentos` por categoría), ya no hardcodeadas. *Nota: la vista se puebla solo cuando el paciente tiene porciones/targets desde una pauta guardada (precondición de flujo pre-existente).*
- **Exportar PDF**: documento profesional rediseñado (datos del nutricionista real + registro, ficha clínica del paciente con IMC, objetivos nutricionales con colores de macros, tabla por comida, indicaciones generales, pie con firma); vista previa = descarga exacta vía PDFViewer.

Pendientes que siguen abiertos del listado original: persistencia de pauta evidente (P1 #7), controles muertos "Recordar datos"/"Balance automático" (P1 #6), chip "– kg" (P1 #8), pluralización (P2 #11), fotos de recetas del sistema (P2 #12).

---

## P0 — Datos clínicos falsos o controles desconectados (corregir antes de que Javiera lo use en serio)

1. **"Pesos de Referencia" del Dashboard muestra valores inventados.** La card tiene hardcodeado 67.4 / 76.6 / 71.8 / 76.2 kg e ignora los datos reales del motor matemático (`data?.pesos` llega por props y no se usa). Para CUALQUIER paciente muestra los mismos pesos. Es el hallazgo más grave: un dato clínico que parece real y no lo es.
2. **"Distribución de Macronutrientes" del Dashboard es decorativa.** Inputs con `defaultValue`, selects sin estado, y la leyenda "1.2 g/kg × 67.4 kg = 81 g" es texto fijo. No calcula ni guarda nada (la pantalla real es Macronutrientes; esta card confunde).
3. **La columna "Plan de distribución" del Generador es decorativa.** Las cantidades de Desayuno/Colación/Almuerzo están hardcodeadas en el código (`cantidad={0}`, `cantidad={1}`...) y los botones +/- no alimentan el payload: al generar se usa `distributions.almuerzo` del store de Porciones. El usuario cree estar configurando algo que no se usa.
4. **Fechas con formato US y off-by-one.** En la ficha, un nacimiento ingresado como 15/03/1992 se muestra "3/14/1992": formato gringo Y un día menos (bug clásico de parsear fecha-sin-hora como UTC). Afecta Nacimiento e Ingreso.

## P1 — Fricciones de flujo

5. **Generar con porciones vacías devuelve 0 resultados sin explicación.** Si no configuraste Distribución de Porciones antes, el generador responde vacío y no te dice por qué. Debe deshabilitar el botón o mostrar "Primero asigna porciones en Distribución de Porciones" con link.
6. **Controles muertos**: checkbox "Recordar datos para la próxima sesión" (Dashboard) y botón "Balance Automático / Activo" (Macronutrientes) no tienen handler. Quitarlos o implementarlos.
7. **La pauta armada no se persiste de forma evidente.** En Armador de Pautas no hay botón "Guardar pauta del paciente" visible; el trabajo se pierde al recargar (los stores son de sesión). Existe el módulo Pauta/Planificación en backend — falta cerrar el circuito UI→persistencia→ficha del paciente (tab "Pautas Nutricionales").
8. **Chip de peso "– kg" en la lista de pacientes** aunque el paciente tiene evaluación con peso. La lista no lee la última evaluación para ese chip.
9. **500 intermitente en /menus/generar** observado una vez durante la auditoría (no reproducible después; probablemente reload de uvicorn). El toast actual dice "Error interno del servidor" sin más — al menos debería ofrecer "reintentar".
10. **El flujo no se autoexplica.** El orden real de trabajo es: Ficha → activar paciente → Dashboard (TMB) → Macronutrientes → Porciones → Pauta → Generador. Nada lo comunica; con un paciente sin datos cada pantalla muestra vacíos sin guiar al siguiente paso. Sugerencia: estados vacíos con CTA al paso anterior/siguiente (ya hay barra de paciente activo, se puede apoyar en ella).

## P2 — Pulido

11. "1 pacientes en seguimiento" → pluralización.
12. Recetas del sistema sin foto (placeholder genérico en 21 cards) — cargar imágenes reales mejoraría mucho la primera impresión.
13. Tab "Síntomas Reportados (0)" en la ficha: verificar si registra algo o es placeholder.
14. PDF de pauta aún con colores antiguos (quedó fuera del rediseño a propósito) — alinear al lenguaje de macros.
15. Chips de ingredientes en Biblioteca usan colores pastel aleatorios — alinearlos a la paleta de grupos.
16. Lint: patrón `setState` dentro de `useEffect` en varios componentes (pre-existente) — refactor sugerido a `key` o estado derivado.
17. El alta rápida de paciente del Dashboard no ofrece los campos nuevos de la ficha (RUT, contacto, salud) — está bien que sea rápida, pero podría terminar con un link "Completar ficha".

## Lo que funcionó bien (verificado)

- Login/registro/recuperación, crear paciente (modal completo con RUT validado), establecer activo, cálculos TMB reales por fórmula, guardar planificación de macros, búsqueda de alimentos del modal de preparaciones (server-side, 28 resultados para "pollo"), selector de paciente del generador con preferencias derivadas de la ficha, foto de perfil, navegación completa sin errores de consola ni requests 4xx/5xx (salvo el intermitente del punto 9).
