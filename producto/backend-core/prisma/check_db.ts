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

async function main() {
  try {
    console.log('Obteniendo reporte de la base de datos...\n');

    // 1. Total absoluto de alimentos
    const totalAlimentos = await prisma.alimentos.count();
    
    // 2. Conteo por categoría
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

    console.log('=========================================');
    console.log(`📊 REPORTE DE ALIMENTOS EN BASE DE DATOS`);
    console.log('=========================================');
    console.log(`\nTotal de Alimentos Registrados: ${totalAlimentos}`);
    console.log('\nDesglose por Categoría:');
    console.log('-----------------------------------------');
    
    conteoPorCategoria.forEach(item => {
      const catName = item.categoria || 'Sin Categoría';
      console.log(`- ${catName.padEnd(25, ' ')} : ${item._count._all}`);
    });
    console.log('=========================================\n');

  } catch (error) {
    console.error('Error al consultar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
