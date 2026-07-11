// backend-core/prisma/tags_manuales.ts
//
// Clasificación EXPLÍCITA (revisada una a una, 2026-07-08) de los alimentos
// que quedaron sin tags tras el pase heurístico de tag_restricciones.ts.
//
// Introduce el marcador `verificado_sin_restricciones`: el alimento fue
// evaluado y NO le aplica ninguna restricción (aceites vegetales, arroz,
// frutas, verduras...). No participa del filtrado; solo evita que el alimento
// cuente como "sin etiquetar" en las advertencias del generador.
//
// Misma convención que tag_restricciones.ts:
//   - lácteo → contiene_lactosa + no_vegano
//   - carne/pescado/gelatina → no_vegetariano + no_vegano
//   - huevo → contiene_huevo + no_vegano
//   - ante la duda razonable se taggea DE MÁS (seguridad del paciente);
//     si la duda es total, el alimento se deja PENDIENTE (sin tocar).
//   - NUNCA sobrescribe: solo agrega tags a los que no tienen ninguno.
//
// Uso (desde producto/backend-core):
//   npx ts-node prisma/tags_manuales.ts            # dry-run (no escribe)
//   npx ts-node prisma/tags_manuales.ts --apply    # aplica los cambios

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

try {
  require('dotenv').config();
} catch (e) {}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const OK = 'verificado_sin_restricciones';

/** [nombre exacto, marca exacta (null = sin marca), tags a asignar] */
type AsignacionManual = [nombre: string, marca: string | null, tags: string[]];

const ASIGNACIONES: AsignacionManual[] = [
  // ── Aceites vegetales: sin restricciones ──────────────────────────────────
  ['100% aceite de oliva extra virgen', 'Olive & Co', [OK]],
  ['100% Maravilla aceite', 'Lider', [OK]],
  ['Aceite', 'Índigo', [OK]],
  ['Aceite', 'Natura', [OK]],
  ['Aceite 100% Maravilla', 'Líder', [OK]],
  ['Aceite 100% Maravilla', 'Chef', [OK]],
  ['Aceite Belmont', 'Belmont', [OK]],
  ['aceite de coco', 'ghosh', [OK]],
  ['Aceite de coco', 'mi tierra', [OK]],
  ['Aceite de girasol', 'Natura', [OK]],
  ['Aceite de maravilla', null, [OK]],
  ['Aceite de Maravilla', 'Miraflores', [OK]],
  ['Aceite De Maravilla', 'Cuisine And Co', [OK]],
  ['Aceite de oliva', 'Cousine & co.', [OK]],
  ['Aceite de oliva', 'Genérico', [OK]],
  ['Aceite de oliva', 'Relive', [OK]],
  ['Aceite de oliva 500 ml', 'Banquete', [OK]],
  ['aceite de oliva extra virgen', 'Huasco', [OK]],
  ['Aceite de oliva extra virgen', 'Olivo de Plata', [OK]],
  ['Aceite de Oliva Extra Virgen', 'Olitalia', [OK]],
  ['Aceite de Oliva Extra Virgen', 'Kardámili', [OK]],
  ['Aceite de Oliva EXTRA VIRGEN', 'Chef', [OK]],
  ['Aceite De Oliva Extra Virgen', 'Talliani', [OK]],
  ['Aceite De Oliva Extra Virgen', 'Relieve', [OK]],
  ['Aceite de Olive Extra Virgen', 'Kardámili', [OK]],
  ['Aceite de Palta', 'Razeto', [OK]],
  ['Aceite vegetal', 'Primor', [OK]],
  ['Aceite Vegetal', 'Coliseo', [OK]],
  ['Azeite de Oliva', 'Los doscientas', [OK]],
  ['Extra virgin olive oil', 'Deleyda', [OK]],
  ['Aceite Maíz Mazola', 'Superior Quality', [OK]], // categoría "Cereales" errónea en DB

  // ── Mayonesas ────────────────────────────────────────────────────────────
  ["Hellmann's con aceite de palta", "Hellman's", ['contiene_huevo', 'no_vegano']],
  ['REAL MAYO', 'Kraft', ['contiene_huevo', 'no_vegano']],
  ['REAL MAYO Creamy & Smooth', 'Kraft', ['contiene_huevo', 'no_vegano']],
  ['NotMayo Garlic', 'NotCo, NotMayo', [OK]], // vegana
  ['NotMayo Olive', 'NotCo, NotMayo', [OK]],
  ['NotMayo Original', 'NotCo, NotMayo', [OK]],

  // ── Crackers/salvado con trigo ───────────────────────────────────────────
  ['Salvado Linaza', 'Salz', ['contiene_gluten']],
  ['Selz Salvado Chía', 'Arcor', ['contiene_gluten']],

  // ── Palta ────────────────────────────────────────────────────────────────
  ['Palta', 'Genérico', [OK]],
  ['Palta', null, [OK]],

  // ── Chocolates (pueden contener leche; sin azúcar añadido declarado) ─────
  ['Chocolate 85% Cacao 0% Azúcares Añadidos', 'VALOR', ['contiene_lactosa']],
  ['Chocolate Negro 70% 0% Azúcares Añadidos', 'Valor', ['contiene_lactosa']],
  ['Dark Chocolate 70% Cacao', 'Valor', ['contiene_lactosa']],
  ['Cookies zero azúcar', 'Ecovida', ['contiene_gluten']],
  ['Wafers chocolate 0% azúcares', 'Florbú', ['contiene_gluten', 'contiene_lactosa']],

  // ── Aguas y bebidas sin restricciones ────────────────────────────────────
  ['Agua ligth', 'Selz', [OK]],
  ['Agua Line', 'Costa', [OK]],
  ['Bebida de arroz', 'Tucapel', [OK]],

  // ── Arroces simples: sin restricciones ───────────────────────────────────
  ['arroz', 'tucapel', [OK]],
  ['Arroz', 'Líder', [OK]],
  ['Arroz (Lider)', 'Lider', [OK]],
  ['Arroz Blanco', 'Take A Break', [OK]],
  ['Arroz blanco (cocido)', 'Genérico', [OK]],
  ['Arroz blanco crudo', null, [OK]],
  ['Arroz blanco largo ancho', 'Líder', [OK]],
  ['Arroz Blue Bonet grado 2', 'Tucapel', [OK]],
  ['Arroz Grado 1', 'La Romana', [OK]],
  ['Arroz Grado 1', 'Cuisine&Co', [OK]],
  ['Arroz Grado 1', 'Tucapel', [OK]],
  ['Arroz Grado 2', 'Cuisine & Co', [OK]],
  ['Arroz Grado 2 grano largo angosto', 'Máxima', [OK]],
  ['Arroz Integral', 'BANQUETE', [OK]],
  ['Arroz Integral Grado 1', 'Tucapel', [OK]],
  ['Arroz Integral Largo Ancho', 'Lider', [OK]],
  ['Arroz Largo Ancho', 'Miraflores', [OK]],
  ['Arroz largo angosto', 'Miraflores', [OK]],
  ['arroz miraflores', 'carozzi', [OK]],
  ['Arroz Miraflores Integral', 'Miraflores', [OK]],
  ['Arroz Negro', 'Tucapel', [OK]],
  ['Arroz premium grado 1', 'Banquete', [OK]],
  ['Arroz Tucapel', 'Tucapel', [OK]],

  // ── Arroces sazonados: condimentos con gluten probable (prudente) ────────
  ['Arroz Chaufan', 'Miraflores', ['contiene_gluten']],
  ['Arroz primavera', 'Carozzi', ['contiene_gluten']],
  ['Arroz Risotto Champiñon', 'Miraflores', ['contiene_gluten']],
  ['Arroz sabor Original', 'Vilay', ['contiene_gluten']],

  // ── Tortitas/snacks de arroz: sin gluten ─────────────────────────────────
  ['Arrocitas con Sal, Sésamo y Lino', 'Arrocitas', [OK]],
  ['Arrocitas Sin Sal', 'Arrocitas', [OK]],
  ['My Rice Cakes!', 'Crisine & Co.', [OK]],
  ['Tortitas Arroz Integral', 'Santiveri', [OK]],
  ['Mini Arrocitas Choco', 'Arrocitas', ['contiene_lactosa']], // cobertura de chocolate
  ['Tortitas de arroz integral con chocolate negro 0%', 'Bicentury', ['contiene_lactosa']],
  ['casabe crujiente de yuca', 'CASABE GOURMET', [OK]],
  ['Coliflor En Forma De Arroz', 'Frutos Del Maipo', [OK]],
  ['Qrunchies with Quinoa', 'Coronilla, Qrunchies', [OK]],
  ['Nestum Arroz', 'Nestlé, Nestum', [OK]],
  ['Papa', 'Genérico', [OK]],

  // ── Panes, pastas, galletas y cereales con trigo/avena/cebada ────────────
  ['Barrita Arroz', 'Rural Leisure', ['contiene_gluten']],
  ['Blanco', 'Ideal', ['contiene_gluten']], // pan de molde
  ['Blanco Familiar Receta Artesanal', 'Marcelo', ['contiene_gluten']],
  ['Check Cacao', 'Vivo', ['contiene_gluten']],
  ['Chocapic Receta Original', 'Nestlé', ['contiene_gluten']],
  ['Chocapic Sin Azúcar Añadida', 'Nestlé, Chocapic', ['contiene_gluten']],
  ['Chocapic trocitos', 'Nestlé, Chocapic', ['contiene_gluten']],
  ['Club Social Original', 'Club Social', ['contiene_gluten']],
  ['Corbatas', 'Carozzi', ['contiene_gluten']],
  ['Corn flakes', 'Nestlé', ['contiene_gluten']], // malta de cebada
  ['Corn Flakes', 'Nestlé, Corn Flakes', ['contiene_gluten']],
  ['Cous cous', 'La Molisana', ['contiene_gluten']],
  ['espirales', 'tottus', ['contiene_gluten']],
  ['Espirales N 56', 'Lucchetti', ['contiene_gluten']],
  ['Fettuccine 88', 'Carozzi', ['contiene_gluten']],
  ['Fibra Total con Pasas', 'Granix', ['contiene_gluten']],
  ['Fitnessbrot', 'Mestemacher', ['contiene_gluten']],
  ['Frutigran Salvado', 'Frutigran, Granix', ['contiene_gluten']],
  ['Frutigran Tropical', 'Frutigran, Granix', ['contiene_gluten']],
  ['Fusilli 40', 'Divella', ['contiene_gluten']],
  ['Fusilli Tricolor', 'Carozzi', ['contiene_gluten']],
  ['Ghiotti Fusilli', 'Ghotti', ['contiene_gluten']],
  ['GranoVita coco', 'Granix, GranoVita', ['contiene_gluten']],
  ['GranoVita Vainilla', 'Granix, GranoVita', ['contiene_gluten']],
  ['Mama Instant Noodles - Yentafo Flavour', 'Mama', ['contiene_gluten', 'contiene_mariscos']],
  ['Nestlé Fitness Grano entero 260g', 'Nestlé, Fitness', ['contiene_gluten']],
  ['Nestum Multicereal con Ciruela', 'Nestlé, Nestum', ['contiene_gluten']],
  ['Nestum Multicereal con Quinoa', 'Nestlé, Nestum', ['contiene_gluten']],
  ['Pita Integral', 'Castaño', ['contiene_gluten']],
  ['Quífaros', 'Don Giuseppe', ['contiene_gluten']],
  ['Rolls Crocante', 'Carozzi, Costa, Rolls', ['contiene_gluten']],
  ['Saltín Noel Integral', 'Noel, Nutresa, Saltín', ['contiene_gluten']],
  ['Schrotbrot', 'Volkorn', ['contiene_gluten']],
  ['SELZ', 'SELZ', ['contiene_gluten']],
  ['Vivo line con barries', 'Vivo', ['contiene_gluten']],
  ['Soda Clásica', 'McKAY', ['contiene_gluten']], // galleta soda (categoría "Libre Consumo" errónea)

  // ── Lácteos proteicos y postres lácteos ──────────────────────────────────
  ['GOODNES PROTEIN', 'Nestlé', ['contiene_lactosa', 'no_vegano']],
  ['GOODNES PROTEIN Sabor Chirimoya', 'Nestlé', ['contiene_lactosa', 'no_vegano']],
  ['Milo Protein Up', 'Nestlé', ['contiene_gluten', 'contiene_lactosa', 'no_vegano']],
  ['Protein', 'Soprole', ['contiene_lactosa', 'no_vegano']],
  ['Protein Extra Proteína', 'Lonco Leche', ['contiene_lactosa', 'no_vegano']],
  ['Protein Extra Proteína Sabor Arándano', 'Lonco Leche', ['contiene_lactosa', 'no_vegano']],
  ['Protein Extra Proteína Sabor Cappuccino', 'Lonco Leche', ['contiene_lactosa', 'no_vegano']],
  ['Protein Extra Vanilla', 'Loncoleche', ['contiene_lactosa', 'no_vegano']],
  ['Protein+ Snack', 'Soprole', ['contiene_lactosa', 'no_vegano']],
  ['Protein+ Trozos de Fruta Frutilla', 'Soprole', ['contiene_lactosa', 'no_vegano']],
  ['Soprole protein+ Sabor Vainilla', 'Soprole', ['contiene_lactosa', 'no_vegano']],
  ['Soprole Protein+ Trozos de Frutos Secos', 'Soprole', ['contiene_lactosa', 'no_vegano', 'contiene_frutos_secos']],
  ['Oikos sabor frutilla', 'DANONE OIKOS', ['contiene_lactosa', 'no_vegano']],
  ['SABOR FRUTILLA', 'LONCO LECHE', ['contiene_lactosa', 'no_vegano', 'alto_en_azucar']],
  ['Yoghito Frutilla Soprole', 'Soprole', ['contiene_lactosa', 'no_vegano', 'alto_en_azucar']],
  ['Jalea Extra Protein Guinda', 'LONCO LECHE', ['no_vegetariano', 'no_vegano']], // gelatina/colágeno
  ["Twenty's The Protein Bar Lemon Cheesecake", 'Your Goal', ['contiene_gluten', 'contiene_lactosa', 'no_vegano']],
  ['Wild Soul Bar', 'Wild Soul Bar', ['contiene_frutos_secos']],

  // ── Jugos y bebidas azucaradas ───────────────────────────────────────────
  ['Alteza sabor Frutilla', 'Nestlé, McKay', ['alto_en_azucar']],
  ['Arándano maqui', 'Guallarauco', ['alto_en_azucar']],
  ['Strawberry Banana Machine', 'Naked', ['alto_en_azucar']],
  ['Soja + Jugo de Manzana', 'Ades', ['alto_en_azucar']],
  ['Wafer Fresa/Frutilla', 'Bauducco', ['contiene_gluten', 'contiene_lactosa', 'alto_en_azucar']],

  // ── Frutas y verduras frescas: sin restricciones ─────────────────────────
  ['Espinaca', 'Genérico', [OK]], // categoría "Frutas" errónea en DB
  ['Frutilla', 'Genérico', [OK]],
  ['Manzana', 'Genérico', [OK]],
  ['Naranja', 'Genérico', [OK]],
  ['Plátano', 'Genérico', [OK]],
  ['Apio', 'Genérico', [OK]],
  ['Apio crudo', null, [OK]],
  ['Brócoli', 'Genérico', [OK]],
  ['Brócoli cocido', null, [OK]],
  ['Cebolla', 'Genérico', [OK]],
  ['Lechuga', 'Genérico', [OK]],
  ['Lechuga escarola', null, [OK]],
  ['Pepino', 'Genérico', [OK]],
  ['Pimiento morrón', 'Genérico', [OK]],
  ['Pomarola Italiana', 'Carozzi', [OK]],
  ['Tomate', 'Genérico', [OK]],
  ['Zanahoria', 'Genérico', [OK]],
  ['Zanahoria cruda', null, [OK]],
  ['Zapallo italiano cocido', null, [OK]],

  // ── Bebidas vegetales y legumbres ────────────────────────────────────────
  ['not milk', 'NotCo', [OK]],
  ['Not Milk Zero Sugar - NotCo - NotCo - NotCo - NotCo - NotCo', 'NotCo', [OK]],
  ['Garbanzos crudos', null, [OK]],
  ['Lentejas crudas', null, [OK]],

  // ── Endulzantes / condimentos ────────────────────────────────────────────
  ['Alulosa Gotas', 'AluSweet, Biofoods', [OK]],
  ['Stevia + Sucralosa', 'Iansa Cero K', [OK]],
  ['Vinagre Balsámico de Módena', 'Borges', [OK]],

  // ── Otros ────────────────────────────────────────────────────────────────
  ['Corona Extra', 'Corona', ['contiene_gluten']], // cebada
  ['Fetucine alfredo', 'Great Value, Lider', ['contiene_gluten', 'contiene_lactosa']],
  ['Original Irish Cream', 'Baileys', ['contiene_lactosa', 'no_vegano']],
  ['Pasar corte Americano', "Lay's", [OK]], // papas fritas: papa, aceite, sal
  ['Plantain Chips Naturally Sweet', 'Samai', [OK]],
  ['Pringles Barbacoa', 'Pringles', ['contiene_gluten']],
  ['Saumon sauce oseille & son riz pilaf', 'Lidl Stiftung & Co. KG, Toque du Chef', ['no_vegetariano', 'no_vegano', 'contiene_lactosa']],
];

// Quedan PENDIENTES a propósito (imposible clasificar sin ver el envase):
//   - 'delixe' (Sadia)                — no se pudo determinar qué producto es
//   - 'Protein Sabor Coco' (¡NO!)     — marca ambigua: ¿láctea o vegetal?
//   - 'Froota Frutilla' (ecovida)     — ¿snack de fruta o golosina?
//   - 'good drink' (cuisine y co)     — nombre genérico, producto desconocido

async function main() {
  const aplicar = process.argv.includes('--apply');
  console.log(aplicar ? 'MODO APPLY: escribiendo cambios' : 'DRY-RUN: sin cambios (usa --apply para escribir)');

  let asignados = 0;
  let omitidos = 0;
  let noEncontrados = 0;

  for (const [nombre, marca, tags] of ASIGNACIONES) {
    const alimento = await prisma.alimentos.findFirst({
      where: { nombre, marca },
      select: { id: true, restricciones: true },
    });
    if (!alimento) {
      console.warn(`NO ENCONTRADO: ${nombre} (${marca ?? 'sin marca'})`);
      noEncontrados++;
      continue;
    }
    // Solo agrega sobre alimentos sin tags: nunca pisa trabajo previo/manual.
    if (alimento.restricciones.length > 0) {
      omitidos++;
      continue;
    }
    if (aplicar) {
      await prisma.alimentos.update({
        where: { id: alimento.id },
        data: { restricciones: tags },
      });
    }
    console.log(`${aplicar ? 'ASIGNADO' : 'ASIGNARÍA'}: ${nombre} (${marca ?? 'sin marca'}) → [${tags.join(', ')}]`);
    asignados++;
  }

  console.log(`\nResumen: ${asignados} ${aplicar ? 'asignados' : 'por asignar'}, ${omitidos} ya tenían tags, ${noEncontrados} no encontrados.`);
  await prisma.$disconnect();
  await pool.end();
}

main();
