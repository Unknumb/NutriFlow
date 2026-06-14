import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Asegurarse de que dotenv cargue las variables de entorno si existe
try {
  require('dotenv').config();
} catch (e) {}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Super Clasificador Clínico (Reglas estrictas UDD/MINSAL)
 */
function determinarCategoria(nombre: string, grasas: number): string {
  // 1. Normalización estricta: minúsculas y sin tildes/acentos
  const n = nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Alimentos de Libre Consumo (Bajo aporte calórico / Bebidas / Edulcorantes)
  const palabrasLibres = ['stevia', 'sucralosa', 'soda'];
  if (palabrasLibres.some(word => n.includes(word))) {
    return 'Libre Consumo';
  }

  // 3. Lácteos (Separar en Altos/Bajos en grasa si grasas > 3)
  const palabrasLacteos = ['queso', 'mantecoso', 'gauda', 'gouda', 'chanco', 'parmesano', 'edam', 'provoleta', 'mozzarella', 'crema', 'leche', 'yogurt', 'yogur', 'quesillo', 'philadelphia', 'nido', 'milk', 'lacteo', 'probiotico'];
  if (palabrasLacteos.some(word => n.includes(word))) {
    return grasas > 3 ? 'Lácteos Altos en Grasa' : 'Lácteos Bajos en Grasa';
  }

  // 4. Cereales (Aporte principal de Carbohidratos)
  const palabrasCereales = ['papa', 'choclo', 'snack', 'protein', 'barrita', 'brownie', 'muffin', 'bizcocho', 'tostada', 'galleta', 'pan', 'avena', 'fideo', 'arroz', 'pasta', 'harina', 'maiz', 'trigo', 'cereal', 'quinoa', 'marraqueta', 'hallulla', 'tallarin', 'espagueti', 'spaghetti', 'macarron', 'fusilli', 'penne', 'rigatoni', 'canelloni', 'linguine', 'cracker', 'frutigran', 'chocapic', 'granola', 'muesli', 'arrocita', 'roll', 'burrito', 'tortilla', 'fitnessbrot', 'masa', 'empanada'];
  if (palabrasCereales.some(word => n.includes(word))) {
    return 'Cereales';
  }

  // 5. Carnes (Separar en Altas/Bajas en grasa si grasas > 5)
  const palabrasCarnes = ['proteina', 'whey', 'isolate', 'hamburguesa', 'chorizo', 'vienesa', 'salchicha', 'pollo', 'carne', 'pescado', 'atun', 'salmon', 'pavo', 'cerdo', 'jamon', 'longaniza', 'huevo'];
  if (palabrasCarnes.some(word => n.includes(word))) {
    return grasas > 5 ? 'Carnes Altas en Grasa' : 'Carnes Bajas en Grasa';
  }

  // 6. Aceites y Grasas
  const palabrasGrasas = ['pate', 'pesto', 'mayo', 'aceite', 'mantequilla', 'margarina', 'palta', 'nuez', 'almendra', 'mani', 'chia', 'linaza'];
  if (palabrasGrasas.some(word => n.includes(word))) {
    return 'Aceites y Grasas';
  }

  // 7. Leguminosas
  const palabrasLeguminosas = ['lenteja', 'poroto', 'garbanzo', 'soya', 'soja', 'arveja'];
  if (palabrasLeguminosas.some(word => n.includes(word))) {
    return 'Leguminosas';
  }

  // 8. Frutas y Verduras
  const palabrasFrutas = ['manzana', 'platano', 'pera', 'uva', 'naranja', 'jugo', 'pulpa', 'mermelada', 'durazno', 'pina', 'berry', 'arandano', 'frutilla'];
  if (palabrasFrutas.some(word => n.includes(word))) {
    return 'Frutas';
  }

  const palabrasVerdurasLibres = ['lechuga', 'apio', 'espinaca', 'acelga', 'repollo', 'pepino'];
  if (palabrasVerdurasLibres.some(word => n.includes(word))) {
    return 'Verduras libre consumo';
  }

  const palabrasVerdurasGenerales = ['zanahoria', 'zapallo', 'betarraga', 'cebolla', 'tomate', 'pomarola', 'calabaza', 'salsa'];
  if (palabrasVerdurasGenerales.some(word => n.includes(word))) {
    return 'Verduras en general';
  }

  // 9. Azúcares
  const palabrasAzucares = ['chocolate', 'dulce', 'miel', 'manjar', 'azucar', 'caramelo', 'alfajor', 'rocklet', 'cofler'];
  if (palabrasAzucares.some(word => n.includes(word))) {
    return 'Azúcares';
  }

  return 'Otros';
}

async function main() {
  console.log('Iniciando recategorización masiva con el Super Clasificador Clínico...\n');

  try {
    // 1. Obtener todos los alimentos
    const alimentos = await prisma.alimentos.findMany();
    console.log(`Se procesarán ${alimentos.length} alimentos.`);

    let actualizados = 0;

    // 2. Recategorizar
    for (const alimento of alimentos) {
      const grasas = Number(alimento.grasas_100g);
      const nuevaCategoria = determinarCategoria(alimento.nombre, grasas);

      if (alimento.categoria !== nuevaCategoria) {
        await prisma.alimentos.update({
          where: {
            id: alimento.id
          },
          data: {
            categoria: nuevaCategoria
          }
        });
        actualizados++;
      }
    }

    console.log(`\n¡Limpieza completada! Se reclasificaron ${actualizados} alimentos.`);

    // 3. Reporte final
    const conteoPorCategoria = await prisma.alimentos.groupBy({
      by: ['categoria'],
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          categoria: 'desc'
        }
      }
    });

    console.log('\n=========================================');
    console.log(`📊 REPORTE POST-LIMPIEZA DE CATEGORÍAS`);
    console.log('=========================================');
    console.log(`Total de Alimentos Registrados: ${alimentos.length}`);
    console.log('\nDesglose por Categoría:');
    console.log('-----------------------------------------');
    
    conteoPorCategoria.forEach(item => {
      const catName = item.categoria || 'Sin Categoría';
      console.log(`- ${catName.padEnd(30, ' ')} : ${item._count._all}`);
    });
    console.log('=========================================\n');

  } catch (error) {
    console.error('Error durante la limpieza de categorías:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
