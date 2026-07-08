// backend-core/prisma/seed_preparaciones.ts
// Seed de preparaciones del sistema (nutricionista_id = NULL → visibles para todos).
// Las recetas se construyen con alimentos REALES de la tabla `alimentos`
// (lookup por nombre+marca); los macros se calculan siempre desde los ingredientes.
// Ejecutar: npx ts-node prisma/seed_preparaciones.ts

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

type TipoComida = 'desayuno' | 'almuerzo' | 'cena' | 'colacion';

/** Referencia a un alimento existente: [nombre, marca (null = sin marca), gramos]. */
type IngredienteSeed = [nombre: string, marca: string | null, cantidad_g: number];

interface PreparacionSeed {
  nombre: string;
  tipo_comida: TipoComida;
  descripcion: string;
  instrucciones?: string;
  ingredientes: IngredienteSeed[];
}

// Alimentos genéricos básicos que faltan en la DB para armar las recetas del
// sistema (valores de referencia estándar por 100 g, mismo criterio que seed_udd.ts).
const alimentosFaltantes = [
  { nombre: 'Salmón (filete)', categoria: 'Carnes Altas en Grasa', calorias_100g: 208, proteinas_100g: 20.4, carbohidratos_100g: 0, grasas_100g: 13.4 },
  { nombre: 'Salmón ahumado', categoria: 'Carnes Bajas en Grasa', calorias_100g: 117, proteinas_100g: 18.3, carbohidratos_100g: 0, grasas_100g: 4.3 },
  { nombre: 'Brócoli', categoria: 'Verduras en general', calorias_100g: 34, proteinas_100g: 2.8, carbohidratos_100g: 6.6, grasas_100g: 0.4 },
  { nombre: 'Cebolla', categoria: 'Verduras en general', calorias_100g: 40, proteinas_100g: 1.1, carbohidratos_100g: 9.3, grasas_100g: 0.1 },
  { nombre: 'Pepino', categoria: 'Verduras libre consumo', calorias_100g: 15, proteinas_100g: 0.7, carbohidratos_100g: 3.6, grasas_100g: 0.1 },
  { nombre: 'Pimiento morrón', categoria: 'Verduras en general', calorias_100g: 31, proteinas_100g: 1.0, carbohidratos_100g: 6.0, grasas_100g: 0.3 },
];

// 20 recetas del sistema: incluye los 6 ítems del mock PREPARACIONES_INICIALES
// y los 13 del mock BIBLIOTECA_RECETAS (la "Ensalada de pollo con quinoa",
// repetida en ambos mocks, va una sola vez), mapeados a ingredientes reales.
const preparacionesSistema: PreparacionSeed[] = [
  {
    nombre: 'Avena con manzana y almendras',
    tipo_comida: 'desayuno',
    descripcion: 'Avena remojada en leche descremada con manzana picada y almendras.',
    ingredientes: [
      ['Avena', 'Genérico', 40],
      ['Manzana', 'Genérico', 100],
      ['Almendras', 'Genérico', 15],
      ['Leche descremada', 'Genérico', 200],
    ],
  },
  {
    nombre: 'Ensalada de pollo con quinoa',
    tipo_comida: 'almuerzo',
    descripcion: 'Bowl de ensalada con pollo, quinoa, lechuga y tomate. Aliñar con aceite de oliva y limón.',
    ingredientes: [
      ['Pechuga de pollo (cruda)', 'Genérico', 120],
      ['Quinoa (cruda)', 'Genérico', 50],
      ['Lechuga', 'Genérico', 50],
      ['Tomate', 'Genérico', 80],
      ['Aceite de oliva', 'Genérico', 10],
    ],
  },
  {
    nombre: 'Yogurt con frutos rojos',
    tipo_comida: 'colacion',
    descripcion: 'Yogurt natural con frutillas y granola.',
    ingredientes: [
      ['Yogurt natural entero', null, 150],
      ['Frutilla', 'Genérico', 80],
      ['Granola Avena, Almendras y Miel', 'Quaker', 30],
    ],
  },
  {
    nombre: 'Salmón con arroz y brócoli',
    tipo_comida: 'cena',
    descripcion: 'Filete de salmón a la plancha con arroz y brócoli al vapor.',
    ingredientes: [
      ['Salmón (filete)', 'Genérico', 120],
      ['Arroz blanco (cocido)', 'Genérico', 150],
      ['Brócoli', 'Genérico', 100],
      ['Aceite de oliva', 'Genérico', 5],
    ],
  },
  {
    nombre: 'Tostadas con palta y huevo',
    tipo_comida: 'desayuno',
    descripcion: 'Pan integral tostado con palta molida y huevo.',
    ingredientes: [
      ['Pan integral', 'Castaño', 60],
      ['Palta', 'Genérico', 50],
      ['Huevo (entero)', 'Genérico', 60],
    ],
  },
  {
    nombre: 'Wrap de pollo y vegetales',
    tipo_comida: 'almuerzo',
    descripcion: 'Tortilla rellena con pollo, lechuga y pimiento.',
    ingredientes: [
      ['BURRITOS Y WRAPS XL Tortillas Mexicanas', 'Pancho Villa', 60],
      ['Pechuga de pollo (cruda)', 'Genérico', 100],
      ['Lechuga', 'Genérico', 30],
      ['Pimiento morrón', 'Genérico', 40],
    ],
  },
  {
    nombre: 'Sándwich de huevo',
    tipo_comida: 'desayuno',
    descripcion: 'Pan molde con huevos revueltos o fritos y queso Gauda. Preparación rápida y proteica.',
    ingredientes: [
      ['Pan de Molde Integral', 'Ideal', 60],
      ['Huevo (entero)', 'Genérico', 100],
      ['Queso Gauda', 'Soprole', 20],
    ],
  },
  {
    nombre: 'Sándwich de pollo',
    tipo_comida: 'colacion',
    descripcion: 'Pan molde con pollo desmenuzado y queso crema. Ideal para preparar la noche anterior.',
    ingredientes: [
      ['Pan de Molde Integral', 'Ideal', 60],
      ['Pechuga de pollo (cruda)', 'Genérico', 80],
      ['Queso crema', 'Colún', 20],
    ],
  },
  {
    nombre: 'Sándwich de atún',
    tipo_comida: 'colacion',
    descripcion: 'Pan molde con atún mezclado con yogurt natural como mayonesa saludable, lechuga, tomate y cebolla morada.',
    ingredientes: [
      ['Pan de Molde Integral', 'Ideal', 60],
      ['Atún al agua (lomo enlatado)', 'Genérico', 80],
      ['Yogurt natural entero', null, 30],
      ['Lechuga', 'Genérico', 20],
      ['Tomate', 'Genérico', 30],
      ['Cebolla', 'Genérico', 10],
    ],
  },
  {
    nombre: 'Sándwich de salmón ahumado',
    tipo_comida: 'desayuno',
    descripcion: 'Pan molde con salmón ahumado y queso crema. Agregar lechuga, tomate y cebolla morada.',
    ingredientes: [
      ['Pan de Molde Integral', 'Ideal', 60],
      ['Salmón ahumado', 'Genérico', 60],
      ['Queso crema', 'Colún', 20],
      ['Lechuga', 'Genérico', 20],
      ['Tomate', 'Genérico', 30],
      ['Cebolla', 'Genérico', 10],
    ],
  },
  {
    nombre: 'Fajita de atún',
    tipo_comida: 'almuerzo',
    descripcion: 'Tortilla XL con atún mezclado con yogurt natural. Agregar verduras a gusto.',
    ingredientes: [
      ['BURRITOS Y WRAPS XL Tortillas Mexicanas', 'Pancho Villa', 60],
      ['Atún al agua (lomo enlatado)', 'Genérico', 80],
      ['Yogurt natural entero', null, 30],
      ['Lechuga', 'Genérico', 30],
      ['Tomate', 'Genérico', 40],
    ],
  },
  {
    nombre: 'Fajita de carne',
    tipo_comida: 'almuerzo',
    descripcion: 'Tortilla XL con carne vacuna y queso Gauda. Agregar lechuga, tomate, pepino y cebolla morada.',
    ingredientes: [
      ['BURRITOS Y WRAPS XL Tortillas Mexicanas', 'Pancho Villa', 60],
      ['Carne de vacuno magra (Posta)', 'Genérico', 100],
      ['Queso Gauda', 'Soprole', 20],
      ['Lechuga', 'Genérico', 30],
      ['Tomate', 'Genérico', 40],
      ['Pepino', 'Genérico', 30],
      ['Cebolla', 'Genérico', 20],
    ],
  },
  {
    nombre: 'Fajita de pollo',
    tipo_comida: 'almuerzo',
    descripcion: 'Tortillas medianas con pollo y queso crema. Agregar lechuga, tomate, pepino y cebolla morada.',
    ingredientes: [
      ['BURRITOS Y WRAPS XL Tortillas Mexicanas', 'Pancho Villa', 60],
      ['Pechuga de pollo (cruda)', 'Genérico', 100],
      ['Queso crema', 'Colún', 20],
      ['Lechuga', 'Genérico', 30],
      ['Tomate', 'Genérico', 40],
      ['Pepino', 'Genérico', 30],
      ['Cebolla', 'Genérico', 20],
    ],
  },
  {
    nombre: 'Fajita de salmón',
    tipo_comida: 'almuerzo',
    descripcion: 'Tortillas medianas con salmón ahumado y queso crema. Agregar lechuga, tomate y pepino.',
    ingredientes: [
      ['BURRITOS Y WRAPS XL Tortillas Mexicanas', 'Pancho Villa', 60],
      ['Salmón ahumado', 'Genérico', 60],
      ['Queso crema', 'Colún', 20],
      ['Lechuga', 'Genérico', 30],
      ['Tomate', 'Genérico', 40],
      ['Pepino', 'Genérico', 30],
    ],
  },
  {
    nombre: 'Omelette con tostadas',
    tipo_comida: 'desayuno',
    descripcion: 'Omelette de huevo relleno de queso Gauda con tomate, espinaca y morrón, acompañado de tostadas.',
    ingredientes: [
      ['Huevo (entero)', 'Genérico', 120],
      ['Queso Gauda', 'Soprole', 20],
      ['Tomate', 'Genérico', 40],
      ['Espinaca', 'Genérico', 30],
      ['Pimiento morrón', 'Genérico', 20],
      ['Pan integral', 'Castaño', 40],
    ],
  },
  {
    nombre: 'Panqueques de avena',
    tipo_comida: 'desayuno',
    descripcion: 'Licuar avena, huevos y leche con plátano. Cocinar en sartén. Se puede endulzar con canela.',
    ingredientes: [
      ['Avena', 'Genérico', 50],
      ['Huevo (entero)', 'Genérico', 100],
      ['Leche entera', 'Genérico', 100],
      ['Plátano', 'Genérico', 50],
    ],
  },
  {
    nombre: 'Yogurt protein con granola',
    tipo_comida: 'colacion',
    descripcion: 'Yogurt proteico con granola o avena encima. Rápido, sin preparación.',
    ingredientes: [
      ['Yogurt Griego Protein Natural', 'QUILLAYES', 150],
      ['Granola Avena, Almendras y Miel', 'Quaker', 30],
    ],
  },
  {
    nombre: 'Leche con cereal y huevos',
    tipo_comida: 'desayuno',
    descripcion: 'Tazón de leche con cereal/granola y huevos duros al lado como fuente proteica.',
    ingredientes: [
      ['Leche entera', 'Genérico', 200],
      ['Granola Avena, Almendras y Miel', 'Quaker', 40],
      ['Huevo (entero)', 'Genérico', 100],
    ],
  },
  {
    nombre: 'Lentejas con arroz',
    tipo_comida: 'almuerzo',
    descripcion: 'Guiso de lentejas con arroz, zanahoria y cebolla. Clásico chileno alto en fibra y proteína vegetal.',
    ingredientes: [
      ['Lentejas (crudas)', 'Genérico', 80],
      ['Arroz blanco (cocido)', 'Genérico', 100],
      ['Zanahoria', 'Genérico', 50],
      ['Cebolla', 'Genérico', 30],
      ['Aceite de oliva', 'Genérico', 10],
    ],
  },
  {
    nombre: 'Merluza al horno con papas y ensalada',
    tipo_comida: 'cena',
    descripcion: 'Merluza al horno con papas cocidas y ensalada de lechuga y tomate.',
    ingredientes: [
      ['Pescado blanco / Merluza', 'Genérico', 150],
      ['Papa', 'Genérico', 200],
      ['Lechuga', 'Genérico', 40],
      ['Tomate', 'Genérico', 60],
      ['Aceite de oliva', 'Genérico', 10],
    ],
  },
  // --- Ampliación 2026-07-08: más volumen para el generador, con foco en los
  // --- tiempos con menos recetas (cena y colación). Solo alimentos existentes.
  {
    nombre: 'Tortilla de espinaca al horno',
    tipo_comida: 'cena',
    descripcion: 'Tortilla de huevo con espinaca y cebolla, al horno.',
    instrucciones: 'Batir los huevos, mezclar con la espinaca picada y la cebolla; hornear 15 min a 180 °C.',
    ingredientes: [
      ['Huevo (entero)', 'Genérico', 100],
      ['Espinaca', 'Genérico', 80],
      ['Cebolla', 'Genérico', 30],
      ['Aceite de oliva', 'Genérico', 5],
    ],
  },
  {
    nombre: 'Merluza a la plancha con puré',
    tipo_comida: 'cena',
    descripcion: 'Filete de merluza a la plancha con puré de papas suave.',
    ingredientes: [
      ['Pescado blanco / Merluza', 'Genérico', 120],
      ['Papa', 'Genérico', 150],
      ['Leche descremada', 'Genérico', 30],
      ['Aceite de oliva', 'Genérico', 5],
    ],
  },
  {
    nombre: 'Ensalada tibia de quinoa y verduras',
    tipo_comida: 'cena',
    descripcion: 'Quinoa cocida con zanahoria, pimiento y cebolla salteados.',
    ingredientes: [
      ['Quinoa (cruda)', 'Genérico', 40],
      ['Zanahoria', 'Genérico', 50],
      ['Pimiento morrón', 'Genérico', 50],
      ['Cebolla', 'Genérico', 30],
      ['Aceite de oliva', 'Genérico', 5],
    ],
  },
  {
    nombre: 'Omelette de quesillo y tomate',
    tipo_comida: 'cena',
    descripcion: 'Omelette liviano relleno con quesillo y tomate fresco.',
    ingredientes: [
      ['Huevo (entero)', 'Genérico', 100],
      ['Quesillo', 'Genérico', 40],
      ['Tomate', 'Genérico', 80],
    ],
  },
  {
    nombre: 'Sopa de verduras con pollo',
    tipo_comida: 'cena',
    descripcion: 'Sopa casera de verduras con pechuga de pollo desmenuzada.',
    ingredientes: [
      ['Pechuga de pollo (cruda)', 'Genérico', 80],
      ['Zanahoria', 'Genérico', 60],
      ['Apio', 'Genérico', 40],
      ['Papa', 'Genérico', 100],
      ['Cebolla', 'Genérico', 30],
    ],
  },
  {
    nombre: 'Salmón al horno con brócoli',
    tipo_comida: 'cena',
    descripcion: 'Filete de salmón al horno acompañado de brócoli al vapor.',
    ingredientes: [
      ['Salmón (filete)', 'Genérico', 100],
      ['Brócoli', 'Genérico', 100],
      ['Aceite de oliva', 'Genérico', 5],
    ],
  },
  {
    nombre: 'Manzana con almendras',
    tipo_comida: 'colacion',
    descripcion: 'Manzana fresca con una porción de almendras.',
    ingredientes: [
      ['Manzana', 'Genérico', 120],
      ['Almendras', 'Genérico', 15],
    ],
  },
  {
    nombre: 'Plátano con nueces',
    tipo_comida: 'colacion',
    descripcion: 'Plátano con un puñado pequeño de nueces.',
    ingredientes: [
      ['Plátano', 'Genérico', 100],
      ['Nueces', 'Genérico', 15],
    ],
  },
  {
    nombre: 'Quesillo con tomate',
    tipo_comida: 'colacion',
    descripcion: 'Quesillo fresco con tomate en rodajas.',
    ingredientes: [
      ['Quesillo', 'Genérico', 60],
      ['Tomate', 'Genérico', 80],
    ],
  },
  {
    nombre: 'Naranja con nueces',
    tipo_comida: 'colacion',
    descripcion: 'Naranja en gajos con nueces.',
    ingredientes: [
      ['Naranja', 'Genérico', 130],
      ['Nueces', 'Genérico', 12],
    ],
  },
  {
    nombre: 'Huevo duro con apio',
    tipo_comida: 'colacion',
    descripcion: 'Huevo duro con bastones de apio.',
    ingredientes: [
      ['Huevo (entero)', 'Genérico', 50],
      ['Apio', 'Genérico', 60],
    ],
  },
  {
    nombre: 'Leche con avena y plátano',
    tipo_comida: 'desayuno',
    descripcion: 'Leche descremada con avena tradicional y plátano en rodajas.',
    ingredientes: [
      ['Leche descremada', 'Genérico', 200],
      ['Avena tradicional', 'Genérico', 30],
      ['Plátano', 'Genérico', 80],
    ],
  },
  {
    nombre: 'Marraqueta con quesillo',
    tipo_comida: 'desayuno',
    descripcion: 'Media marraqueta con quesillo fresco.',
    ingredientes: [
      ['Marraqueta', 'Genérico', 50],
      ['Quesillo', 'Genérico', 50],
    ],
  },
  {
    nombre: 'Lentejas guisadas con verduras',
    tipo_comida: 'almuerzo',
    descripcion: 'Lentejas guisadas con zanahoria, cebolla y pimiento.',
    ingredientes: [
      ['Lentejas (crudas)', 'Genérico', 70],
      ['Zanahoria', 'Genérico', 50],
      ['Cebolla', 'Genérico', 30],
      ['Pimiento morrón', 'Genérico', 40],
      ['Aceite de oliva', 'Genérico', 5],
    ],
  },
  {
    nombre: 'Garbanzos con espinaca',
    tipo_comida: 'almuerzo',
    descripcion: 'Guiso de garbanzos con espinaca y cebolla.',
    ingredientes: [
      ['Garbanzos (crudos)', 'Genérico', 70],
      ['Espinaca', 'Genérico', 80],
      ['Cebolla', 'Genérico', 30],
      ['Aceite de oliva', 'Genérico', 5],
    ],
  },
];

async function upsertAlimentosFaltantes() {
  for (const alimento of alimentosFaltantes) {
    const restricciones: string[] = [];
    if (alimento.proteinas_100g > 12) {
      restricciones.push('alto_en_proteina');
    }
    await prisma.alimentos.upsert({
      where: { nombre_marca: { nombre: alimento.nombre, marca: 'Genérico' } },
      update: {},
      create: { ...alimento, marca: 'Genérico', restricciones },
    });
  }
  console.log(`Alimentos genéricos base verificados/creados: ${alimentosFaltantes.length}`);
}

async function buscarAlimentoId(nombre: string, marca: string | null): Promise<string | null> {
  const alimento = await prisma.alimentos.findFirst({
    where: { nombre, marca },
    select: { id: true },
  });
  return alimento?.id ?? null;
}

async function main() {
  console.log('Iniciando seed de preparaciones del sistema...');
  await upsertAlimentosFaltantes();

  let creadas = 0;
  let omitidas = 0;

  for (const receta of preparacionesSistema) {
    // Idempotencia: si ya existe una preparación del sistema con el mismo nombre, se omite
    const existente = await prisma.preparaciones.findFirst({
      where: { nombre: receta.nombre, nutricionista_id: null },
      select: { id: true },
    });
    if (existente) {
      omitidas++;
      continue;
    }

    // Resolución de ingredientes a IDs reales; si falta alguno, se omite la receta completa
    const ingredientes: { alimento_id: string; cantidad_g: number }[] = [];
    let faltante: string | null = null;
    for (const [nombre, marca, cantidad_g] of receta.ingredientes) {
      const alimentoId = await buscarAlimentoId(nombre, marca);
      if (!alimentoId) {
        faltante = `${nombre} (${marca ?? 'sin marca'})`;
        break;
      }
      ingredientes.push({ alimento_id: alimentoId, cantidad_g });
    }
    if (faltante) {
      console.warn(`OMITIDA "${receta.nombre}": no se encontró el alimento ${faltante}`);
      omitidas++;
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const prep = await tx.preparaciones.create({
        data: {
          nombre: receta.nombre,
          descripcion: receta.descripcion,
          instrucciones: receta.instrucciones ?? null,
          tipo_comida: receta.tipo_comida,
          nutricionista_id: null, // preparación del sistema
        },
      });
      await tx.ingredientes_preparacion.createMany({
        data: ingredientes.map((ing) => ({ preparacion_id: prep.id, ...ing })),
      });
    });
    creadas++;
    console.log(`Creada: ${receta.nombre} (${receta.tipo_comida}, ${ingredientes.length} ingredientes)`);
  }

  // Fixup: la preparación preexistente sin tipo_comida queda clasificada como desayuno
  const fixup = await prisma.preparaciones.updateMany({
    where: { nombre: 'Porridge de Avena y Manzana', nutricionista_id: null, tipo_comida: null },
    data: { tipo_comida: 'desayuno' },
  });
  if (fixup.count > 0) {
    console.log('Fixup: tipo_comida=desayuno asignado a "Porridge de Avena y Manzana"');
  }

  console.log(`Seed finalizado. Creadas: ${creadas}, omitidas: ${omitidas}.`);
}

main()
  .catch((e) => {
    console.error('Error en seed de preparaciones:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
