import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed de base de datos...');

  // --- 1. Alimentos Genéricos ---
  // Usamos 'Genérico' como marca para evitar problemas de unicidad con campos nulos en PostgreSQL.
  console.log('Creando alimentos genéricos...');
  
  const manzana = await prisma.alimentos.upsert({
    where: {
      nombre_marca: { nombre: 'Manzana', marca: 'Genérico' }
    },
    update: {},
    create: {
      nombre: 'Manzana',
      marca: 'Genérico',
      categoria: 'Frutas',
      calorias_100g: 52,
      proteinas_100g: 0.3,
      carbohidratos_100g: 14,
      grasas_100g: 0.2,
    }
  });

  const avena = await prisma.alimentos.upsert({
    where: {
      nombre_marca: { nombre: 'Avena tradicional', marca: 'Genérico' }
    },
    update: {},
    create: {
      nombre: 'Avena tradicional',
      marca: 'Genérico',
      categoria: 'Cereales',
      calorias_100g: 389,
      proteinas_100g: 16.9,
      carbohidratos_100g: 66,
      grasas_100g: 6.9,
    }
  });

  const leche = await prisma.alimentos.upsert({
    where: {
      nombre_marca: { nombre: 'Leche descremada', marca: 'Genérico' }
    },
    update: {},
    create: {
      nombre: 'Leche descremada',
      marca: 'Genérico',
      categoria: 'Lácteos Bajos en Grasa',
      calorias_100g: 34,
      proteinas_100g: 3.4,
      carbohidratos_100g: 5,
      grasas_100g: 0.1,
      restricciones: ['sin_lactosa'],
    }
  });

  // --- 2. Alimentos de Marca ---
  console.log('Creando alimentos de supermercado...');
  
  const panIntegral = await prisma.alimentos.upsert({
    where: {
      nombre_marca: { nombre: 'Pan de Molde Integral', marca: 'Ideal' }
    },
    update: {},
    create: {
      nombre: 'Pan de Molde Integral',
      marca: 'Ideal',
      categoria: 'Cereales',
      calorias_100g: 240,
      proteinas_100g: 10,
      carbohidratos_100g: 42,
      grasas_100g: 3,
      restricciones: ['alto_en_fibra'],
    }
  });

  const panBlanco = await prisma.alimentos.upsert({
    where: {
      nombre_marca: { nombre: 'Pan de Molde Blanco', marca: 'Castaño' }
    },
    update: {},
    create: {
      nombre: 'Pan de Molde Blanco',
      marca: 'Castaño',
      categoria: 'Cereales',
      calorias_100g: 260,
      proteinas_100g: 8,
      carbohidratos_100g: 48,
      grasas_100g: 4,
    }
  });

  // --- 3. Crear Preparación (La Biblioteca) ---
  console.log('Creando preparaciones...');
  
  // Nota: Como el modelo `preparaciones` no tiene un `@unique` en `nombre`, 
  // Prisma no permite usar `.upsert()` directamente. 
  // Lo resolvemos buscando primero (findFirst) y luego creando/actualizando.
  let porridge = await prisma.preparaciones.findFirst({
    where: { nombre: 'Porridge de Avena y Manzana' }
  });

  if (!porridge) {
    porridge = await prisma.preparaciones.create({
      data: {
        nombre: 'Porridge de Avena y Manzana',
        descripcion: 'Desayuno cálido y reconfortante, alto en fibra.',
        instrucciones: 'Cocinar la avena con la leche a fuego medio. Agregar la manzana picada y revolver hasta espesar.',
      }
    });
  }

  // Idempotencia: limpiamos ingredientes previos para recrearlos y evitar duplicados
  await prisma.ingredientes_preparacion.deleteMany({
    where: { preparacion_id: porridge.id }
  });

  // Relacionamos los ingredientes a la preparación
  await prisma.ingredientes_preparacion.createMany({
    data: [
      { preparacion_id: porridge.id, alimento_id: avena.id, cantidad_g: 40 },
      { preparacion_id: porridge.id, alimento_id: leche.id, cantidad_g: 200 },
      { preparacion_id: porridge.id, alimento_id: manzana.id, cantidad_g: 100 },
    ]
  });

  console.log('✅ Seed completado con éxito!');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
