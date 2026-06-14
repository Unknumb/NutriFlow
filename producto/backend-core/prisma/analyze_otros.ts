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
    const otros = await prisma.alimentos.findMany({
      where: { categoria: 'Otros' },
      select: { nombre: true }
    });

    const stopWords = ['de', 'con', 'sabor', 'y', 'a', 'en', 'la', 'el', 'las', 'los', 'para', 'sin', 'al', 'del', 'o'];
    const wordCounts: Record<string, number> = {};

    otros.forEach(a => {
      // Eliminar caracteres raros y separar por espacios
      const words = a.nombre.toLowerCase().replace(/[^a-záéíóúñü]/g, ' ').split(/\s+/);
      for (const w of words) {
        if (w.length > 2 && !stopWords.includes(w)) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      }
    });

    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);

    console.log(`\n=== ANÁLISIS DE CATEGORÍA "OTROS" (${otros.length} items) ===\n`);
    
    console.log('--- Top Palabras Clave ---');
    sortedWords.forEach(([word, count]) => {
      console.log(`${word.padEnd(15, ' ')} : ${count} veces`);
    });

    // Para la muestra, vamos a barajar (shuffle) un poco o tomar los primeros 40
    console.log('\n--- Muestra de 40 Nombres Representativos ---');
    
    // Mezclamos un poco para tener variedad
    const shuffled = otros.sort(() => 0.5 - Math.random());
    
    shuffled.slice(0, 40).forEach(a => {
      console.log(`- ${a.nombre}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
