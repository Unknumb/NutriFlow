# Revisión: recategorización de alimentos "Otros" (2026-06-12)

Los 108 alimentos que estaban en la categoría **"Otros"** fueron recategorizados según su tipo de producto y perfil de macros por 100 g (migración `recategorizar_alimentos_otros`). El generador de menús ahora los considera en sus grupos de intercambio. **Javiera: revisar especialmente los marcados con ⚠️.**

Tras la recategorización se re-ejecutó el tagging de restricciones (42 alimentos recibieron tags nuevos, ver `revision_tags_restricciones.md`).

## Cereales (40)
Pastas (Divella, Carozzi, Lucchetti, Tottus, Don Giuseppe), panes (Ideal, Castaño, Schrotbrot, casabe), cereales de desayuno (Corn Flakes, Fitness, Check Cacao, Vivo, GranoVita), galletas de agua/saladas/integrales (Selz "Agua ligth", Costa "Agua Line", Club Social ⚠️ alta en grasa, Saltín Noel, Fibra Total, Molino Natural, My Rice Cakes), cous cous, barra de cereal Wild Soul Bar.
- ⚠️ "Mama Instant Noodles" y "Ramen Maruchan": fideos instantáneos fritos — válidos como cereal pero de baja calidad nutricional.
- ⚠️ "Fresh Toppings": asumido granola/topping de cereal por macros (469 kcal, 62 CHO).

## Azúcares (30)
Galletas dulces y chocolates (Chocman, Chokita, FRAC, Costa, McKay, Havanna, bon o bon, Kilatte, 82% Cacao Valor, Loop, etc.), Coca-Cola ×2 (bebida azucarada).
- ⚠️ Criterio: golosinas con azúcar+grasa fueron a "Azúcares" (el grupo de intercambio más cercano); si prefieres que no aparezcan nunca en el generador, se pueden mover a "Libre Consumo" o "Otros".
- ⚠️ "Noglut María": galleta dulce SIN GLUTEN (no debe recibir tag de gluten).
- ⚠️ "Vino" (Costa) es la galleta "Vino", no alcohol.

## Lácteos Bajos en Grasa (5)
Batido Nestlé, Cappuccino Colun Light, surlat sin lactosa, Yoghurt Light Colún, ⚠️ Nature's Heart Almond&Vanilla (bebida vegetal de almendra — clasificada como láctea por uso equivalente; NO contiene lactosa).

## Lácteos Medios en Grasa (5)
Batifrut, Yoghito Damasco, Yoghurt Natural Soprole ×2, ⚠️ Purita Mamá (leche en polvo fortificada del PNAC — macros por 100 g de polvo, no reconstituida).

## Lácteos Altos en Grasa (6)
1+1 Soprole, Yoghurt 1+1, Oikos, Yoghurt Origen ×2, ⚠️ Tholem Tentaciones Light (queso crema/dip — clasificado como lácteo alto en grasa).

## Carnes Bajas en Grasa (3)
Jurel al Natural, Pechuga Ahumada Sopraval, Posta rosada.

## Carnes Altas en Grasa (1)
⚠️ NotBurger (análogo vegetal de carne — perfil de macros equivalente a carne alta en grasa; es vegano, sin tags de carne).

## Aceites y Grasas (3)
Aceite de oliva ×2, ⚠️ "delixe" Sadia (asumida margarina por macros: 28 g grasa, 0 prot, 0 CHO).

## Alimentos ricos en grasas (5)
Nueces ×2, ⚠️ Lay's, Pringles y Plantain Chips (snacks fritos — alto lípido, baja calidad; mover a "Otros" si no deben aparecer en menús).

## Verduras en general (1)
Brócoli cocido.

## Libre Consumo (3)
Alulosa Gotas (endulzante), good drink (14 kcal), Vinagre Balsámico.

## Quedan en "Otros" (6) — el generador los ignora deliberadamente
| Alimento | Motivo |
|---|---|
| Corona Extra | Alcohol — no corresponde a grupo de intercambio |
| Baileys Original Irish Cream | Alcohol |
| Fetucine alfredo (Lider) | Plato preparado multi-grupo |
| Saumon sauce oseille & son riz pilaf (Lidl) | Plato preparado multi-grupo |
| barra berries (Wild Protein) | Barra/suplemento proteico |
| En Línea Barras (Eckart) | Barra/suplemento proteico |

## Datos sospechosos detectados (corregir a futuro)
- "Agua ligth" (Selz) y "Agua Line" (Costa): el nombre sugiere agua pero los macros (~410 kcal) corresponden a galletas de agua — se clasificaron como galletas.
- "delixe" (Sadia): 0 g de proteína con 28 g de grasa — datos posiblemente incompletos del import.
- "Ramen Maruchan" (62 kcal/100 g): macros parecen ser del producto preparado, no en seco.
