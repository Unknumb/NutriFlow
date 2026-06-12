// backend-core/prisma/tag_restricciones.ts
//
// Tagging semiautomático de `alimentos.restricciones` con el vocabulario
// controlado de restricciones (ver src/menus/restricciones.constants.ts).
//
// CONVENCIÓN: cada tag describe lo que el alimento CONTIENE o ES
// (contiene_gluten, no_vegetariano, ...). NUNCA sobrescribe tags existentes
// (alto_en_proteina / alto_en_fibra se preservan): solo AGREGA.
//
// Reglas conservadoras en el sentido de seguridad del paciente: ante la duda
// razonable (ej. "sabor queso", vienesas con posible cerdo) se prefiere
// taggear y excluir de más, nunca de menos. La revisión humana queda en
// prisma/revision_tags_restricciones.md.
//
// Uso (desde producto/backend-core):
//   npx ts-node prisma/tag_restricciones.ts            # dry-run (no escribe)
//   npx ts-node prisma/tag_restricciones.ts --apply    # aplica los cambios

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';
import type { TagRestriccionAlimento } from '../src/menus/restricciones.constants';

try {
  require('dotenv').config();
} catch (e) {}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Utilidades de matching
// ---------------------------------------------------------------------------

/** Minúsculas, sin acentos. */
const normalizar = (texto: string): string =>
  texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Regex de PALABRA COMPLETA sobre el nombre normalizado ("pan" ≠ "panqueque"). */
const palabra = (...terminos: string[]): RegExp =>
  new RegExp(`\\b(${terminos.join('|')})\\b`);

// --- Excepciones (se evalúan sobre el nombre normalizado) ---
const ES_BEBIDA_VEGETAL = /\b(leche|bebida)\b.*\b(avena|almendras?|coco|soja|soya|arroz|vegetal)\b|not ?milk|notco/;
const DECLARA_SIN_LACTOSA = /sin lactosa|deslactosad/;
const DECLARA_SIN_AZUCAR = /sin azucar|0\s?% azucar|0% azucares|\bzero\b|0%/;
const ES_PROTEINA_EN_POLVO = palabra('whey', 'isolate', 'proteina', 'protein');
const ES_SUCEDANEO_VEGETAL = /\bde (soya|soja)\b|vegetal|veggie|vegan|not ?co/;
const HARINA_SIN_GLUTEN = /harina de (arroz|almendras?|coco|garbanzos?|maiz|quinoa|lentejas?)/;

// --- Diccionarios por grupo ---
const PALABRAS_GLUTEN = palabra(
  'trigo', 'pan', 'panes', 'panqueques?', 'marraqueta', 'hallulla', 'baguette',
  'pastas?', 'fideos?', 'tallarin', 'tallarines', 'espaguetis?', 'spaghetti',
  'lasana', 'lasagna', 'raviol(i|es)', 'couscous', 'cuscus', 'semola',
  'avena', 'cebada', 'centeno', 'galletas?', 'galletitas?', 'crackers?',
  'tostadas?', 'bizcochos?', 'brownies?', 'muffins?', 'queques?', 'tortas?',
  'donuts?', 'alfajor(es)?', 'empanadas?', 'pizzas?', 'masas?', 'cereal(es)?',
  'granolas?', 'muesli', 'wraps?', 'burritos?', 'tortillas?', 'pretzels?',
  'barquillos?', 'croissant', 'medialunas?', 'waffles?', 'wafles?',
);
const PALABRA_HARINA = palabra('harinas?');

const PALABRAS_LACTEO = palabra(
  'leche', 'quesos?', 'quesillo', 'yogurt', 'yogur', 'yoghurt', 'crema',
  'mantequilla', 'manjar', 'mozzarella', 'parmesano', 'gauda', 'gouda',
  'edam', 'provoleta', 'chantilly', 'milk', 'lacteos?', 'helados?', 'ricotta',
);

const PALABRAS_HUEVO = palabra('huevos?', 'omelette', 'omelet', 'mayonesa', 'uovo');

const PALABRAS_MARISCOS = palabra(
  'mariscos?', 'camaron(es)?', 'ostion(es)?', 'choritos?', 'almejas?',
  'mejillon(es)?', 'jaibas?', 'pulpos?', 'calamar(es)?', 'kanikama', 'surimi', 'machas',
);

const PALABRAS_PESCADO_CARNE = palabra(
  'pescados?', 'atun', 'salmon', 'merluza', 'reineta', 'jurel', 'sardinas?',
  'tilapia', 'trucha', 'anchoas?', 'ceviche', 'pollo', 'pavo', 'vacuno',
  'carnes?', 'bistec', 'posta', 'albondigas?', 'hamburguesas?', 'lomo',
  'costillar', 'churrasco', 'mechada',
);

const PALABRAS_CERDO = palabra(
  'cerdo', 'chancho', 'jamon(es)?', 'tocino', 'panceta', 'chorizos?',
  'longanizas?', 'salame', 'salami', 'mortadela',
);

// Vienesas/salchichas: composición incierta — conservador: cerdo + sodio.
const PALABRAS_EMBUTIDO_MIXTO = palabra('vienesas?', 'salchichas?');

const PALABRAS_EMBUTIDO_SODIO = palabra(
  'jamon(es)?', 'tocino', 'panceta', 'chorizos?', 'longanizas?', 'salame',
  'salami', 'mortadela', 'vienesas?', 'salchichas?',
);

const PALABRAS_FRUTOS_SECOS = palabra(
  'nuez', 'nueces', 'almendras?', 'mani', 'avellanas?', 'pistachos?',
  'castanas?', 'pecanas?', 'maranon', 'anacardos?', 'caju',
);

const PALABRAS_MIEL = palabra('miel');
const PALABRAS_AZUCAR = palabra('azucar(es)?', 'mermeladas?', 'manjar', 'chocolates?');

const CATEGORIAS_CARNES = new Set(['Carnes Bajas en Grasa', 'Carnes Altas en Grasa']);
const CATEGORIAS_LACTEOS = new Set([
  'Lácteos Bajos en Grasa',
  'Lácteos Medios en Grasa',
  'Lácteos Altos en Grasa',
]);

/** Calcula los tags que las reglas asignan a un alimento (sin mirar los existentes). */
function calcularTags(nombre: string, categoria: string | null): Set<TagRestriccionAlimento> {
  const n = normalizar(nombre);
  const tags = new Set<TagRestriccionAlimento>();

  // --- Reglas por categoría ---
  if (categoria && CATEGORIAS_CARNES.has(categoria)) {
    if (ES_PROTEINA_EN_POLVO.test(n)) {
      // Suplementos clasificados como "Carnes": whey es lácteo, no carne.
      tags.add('contiene_lactosa');
      tags.add('no_vegano');
    } else if (PALABRAS_HUEVO.test(n) && !PALABRAS_PESCADO_CARNE.test(n) && !PALABRAS_CERDO.test(n)) {
      // Huevos clasificados como "Carnes": son aptos para vegetarianos
      // (ovo-lacto); el tag de huevo/no_vegano lo agrega la regla por nombre.
    } else {
      tags.add('no_vegetariano');
      tags.add('no_vegano');
    }
  }
  if (categoria && CATEGORIAS_LACTEOS.has(categoria) && !ES_BEBIDA_VEGETAL.test(n)) {
    tags.add('no_vegano');
    if (!DECLARA_SIN_LACTOSA.test(n)) tags.add('contiene_lactosa');
  }
  if (categoria === 'Azúcares' && !DECLARA_SIN_AZUCAR.test(n)) {
    tags.add('alto_en_azucar');
  }

  // --- Reglas por nombre (cualquier categoría) ---
  if (PALABRAS_GLUTEN.test(n) || (PALABRA_HARINA.test(n) && !HARINA_SIN_GLUTEN.test(n))) {
    tags.add('contiene_gluten');
  }

  if (PALABRAS_LACTEO.test(n) && !ES_BEBIDA_VEGETAL.test(n)) {
    tags.add('no_vegano');
    if (!DECLARA_SIN_LACTOSA.test(n)) tags.add('contiene_lactosa');
  }

  // Suplementos whey/caseína en cualquier categoría: derivados lácteos.
  if (palabra('whey', 'isolate', 'caseina').test(n)) {
    tags.add('no_vegano');
    if (!DECLARA_SIN_LACTOSA.test(n)) tags.add('contiene_lactosa');
  }

  if (PALABRAS_HUEVO.test(n)) {
    tags.add('contiene_huevo');
    tags.add('no_vegano');
  }

  if (PALABRAS_MARISCOS.test(n)) {
    tags.add('contiene_mariscos');
    tags.add('no_vegetariano');
    tags.add('no_vegano');
  }

  if (PALABRAS_PESCADO_CARNE.test(n) && !ES_SUCEDANEO_VEGETAL.test(n)) {
    tags.add('no_vegetariano');
    tags.add('no_vegano');
  }

  if (PALABRAS_CERDO.test(n) || PALABRAS_EMBUTIDO_MIXTO.test(n)) {
    tags.add('contiene_cerdo');
    tags.add('no_vegetariano');
    tags.add('no_vegano');
  }

  if (PALABRAS_EMBUTIDO_SODIO.test(n)) {
    tags.add('alto_en_sodio');
  }

  if (PALABRAS_FRUTOS_SECOS.test(n)) {
    tags.add('contiene_frutos_secos');
  }

  if (PALABRAS_MIEL.test(n)) {
    tags.add('no_vegano');
  }

  if (PALABRAS_AZUCAR.test(n) && !DECLARA_SIN_AZUCAR.test(n)) {
    tags.add('alto_en_azucar');
  }

  return tags;
}

// ---------------------------------------------------------------------------
// Ejecución
// ---------------------------------------------------------------------------

async function main() {
  const aplicar = process.argv.includes('--apply');
  console.log(`\n=== Tagging de restricciones (${aplicar ? 'APPLY' : 'DRY-RUN'}) ===\n`);

  const alimentos = await prisma.alimentos.findMany({
    select: { id: true, nombre: true, categoria: true, restricciones: true },
    orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
  });

  type Cambio = {
    id: string;
    nombre: string;
    categoria: string | null;
    nuevos: string[];
    finales: string[];
  };
  const cambios: Cambio[] = [];
  const conteoAntes = new Map<string, number>();
  const conteoDespues = new Map<string, number>();

  for (const alimento of alimentos) {
    const existentes = new Set(alimento.restricciones ?? []);
    for (const t of existentes) conteoAntes.set(t, (conteoAntes.get(t) ?? 0) + 1);

    const calculados = calcularTags(alimento.nombre, alimento.categoria);
    const nuevos = [...calculados].filter((t) => !existentes.has(t)).sort();
    const finales = [...new Set([...existentes, ...calculados])].sort();
    for (const t of finales) conteoDespues.set(t, (conteoDespues.get(t) ?? 0) + 1);

    if (nuevos.length > 0) {
      cambios.push({
        id: alimento.id,
        nombre: alimento.nombre,
        categoria: alimento.categoria,
        nuevos,
        finales,
      });
    }
  }

  // --- Resumen por tag (antes/después) ---
  const todosLosTags = [...new Set([...conteoAntes.keys(), ...conteoDespues.keys()])].sort();
  console.log('Resumen por tag (alimentos con el tag, antes -> después):');
  for (const tag of todosLosTags) {
    console.log(
      `  ${tag.padEnd(24)} ${String(conteoAntes.get(tag) ?? 0).padStart(4)} -> ${String(conteoDespues.get(tag) ?? 0).padStart(4)}`,
    );
  }
  const sinTagsDespues =
    alimentos.length -
    alimentos.filter(
      (a) => (a.restricciones?.length ?? 0) > 0 || calcularTags(a.nombre, a.categoria).size > 0,
    ).length;
  console.log(`\nTotal alimentos: ${alimentos.length}`);
  console.log(`Alimentos a actualizar: ${cambios.length}`);
  console.log(`Alimentos que quedarán SIN ningún tag: ${sinTagsDespues}`);

  // --- Markdown de revisión para la nutricionista ---
  const lineas: string[] = [
    '# Revisión de tags de restricciones asignados automáticamente',
    '',
    `Generado por \`prisma/tag_restricciones.ts\` el ${new Date().toISOString().slice(0, 10)} (modo: ${aplicar ? 'apply' : 'dry-run'}).`,
    '',
    'Convención: cada tag indica que el alimento **contiene** el alérgeno o **no es apto** para esa dieta.',
    'Las reglas son conservadoras (ante la duda se taggea); por favor marcar filas incorrectas para corregirlas.',
    '',
    '| Alimento | Categoría | Tags agregados | Tags finales |',
    '|---|---|---|---|',
    ...cambios.map(
      (c) =>
        `| ${c.nombre.replace(/\|/g, '\\|')} | ${c.categoria ?? '—'} | ${c.nuevos.join(', ')} | ${c.finales.join(', ')} |`,
    ),
  ];
  const rutaMd = path.join(__dirname, 'revision_tags_restricciones.md');
  fs.writeFileSync(rutaMd, lineas.join('\n') + '\n', 'utf-8');
  console.log(`\nMarkdown de revisión escrito en: ${rutaMd}`);

  if (!aplicar) {
    console.log('\nDry-run: no se escribió nada en la DB. Ejecuta con --apply para aplicar.');
    return;
  }

  // --- Aplicar en lotes (solo agrega, nunca quita) ---
  let aplicados = 0;
  const TAMANO_LOTE = 50;
  for (let i = 0; i < cambios.length; i += TAMANO_LOTE) {
    const lote = cambios.slice(i, i + TAMANO_LOTE);
    await prisma.$transaction(
      lote.map((c) =>
        prisma.alimentos.update({
          where: { id: c.id },
          data: { restricciones: c.finales },
        }),
      ),
    );
    aplicados += lote.length;
    console.log(`  Aplicados ${aplicados}/${cambios.length}...`);
  }
  console.log('\nListo. Recuerda que backend-core cachea menús en Redis (prefijo menus:*).');
}

main()
  .catch((e) => {
    console.error('Error en tag_restricciones:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
