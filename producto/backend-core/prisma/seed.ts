import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed de alimentos...');

  // Limpiar tabla de alimentos
  await prisma.alimentos.deleteMany({});
  console.log('Tabla de alimentos limpiada.');

  const alimentosData = [
    // Verduras en general
    {
      nombre: 'Zanahoria cruda',
      categoria: 'Verduras en general',
      calorias_100g: 41.0,
      proteinas_100g: 0.9,
      carbohidratos_100g: 9.6,
      grasas_100g: 0.2,
    },
    {
      nombre: 'Brócoli cocido',
      categoria: 'Verduras en general',
      calorias_100g: 35.0,
      proteinas_100g: 2.4,
      carbohidratos_100g: 7.2,
      grasas_100g: 0.4,
    },
    {
      nombre: 'Zapallo italiano cocido',
      categoria: 'Verduras en general',
      calorias_100g: 15.0,
      proteinas_100g: 1.1,
      carbohidratos_100g: 2.7,
      grasas_100g: 0.4,
    },
    // Verduras de libre consumo
    {
      nombre: 'Lechuga escarola',
      categoria: 'Verduras de libre consumo',
      calorias_100g: 15.0,
      proteinas_100g: 1.4,
      carbohidratos_100g: 2.9,
      grasas_100g: 0.2,
    },
    {
      nombre: 'Apio crudo',
      categoria: 'Verduras de libre consumo',
      calorias_100g: 14.0,
      proteinas_100g: 0.7,
      carbohidratos_100g: 3.0,
      grasas_100g: 0.2,
    },
    // Carnes altas en grasa
    {
      nombre: 'Costillar de cerdo',
      categoria: 'Carnes altas en grasa',
      calorias_100g: 297.0,
      proteinas_100g: 14.6,
      carbohidratos_100g: 0.0,
      grasas_100g: 26.5,
    },
    {
      nombre: 'Longaniza',
      categoria: 'Carnes altas en grasa',
      calorias_100g: 346.0,
      proteinas_100g: 14.0,
      carbohidratos_100g: 2.5,
      grasas_100g: 31.0,
    },
    // Carnes bajas en grasa
    {
      nombre: 'Pechuga de pollo (sin piel)',
      categoria: 'Carnes bajas en grasa',
      calorias_100g: 165.0,
      proteinas_100g: 31.0,
      carbohidratos_100g: 0.0,
      grasas_100g: 3.6,
    },
    {
      nombre: 'Pavo cocido (sin piel)',
      categoria: 'Carnes bajas en grasa',
      calorias_100g: 104.0,
      proteinas_100g: 17.1,
      carbohidratos_100g: 0.0,
      grasas_100g: 3.3,
    },
    {
      nombre: 'Posta rosada',
      categoria: 'Carnes bajas en grasa',
      calorias_100g: 130.0,
      proteinas_100g: 22.0,
      carbohidratos_100g: 0.0,
      grasas_100g: 4.0,
    },
    // Lácteos altos en grasa
    {
      nombre: 'Queso amarillo (Gouda)',
      categoria: 'Lácteos altos en grasa',
      calorias_100g: 356.0,
      proteinas_100g: 24.9,
      carbohidratos_100g: 2.2,
      grasas_100g: 27.4,
    },
    {
      nombre: 'Crema de leche fresca',
      categoria: 'Lácteos altos en grasa',
      calorias_100g: 345.0,
      proteinas_100g: 2.1,
      carbohidratos_100g: 2.8,
      grasas_100g: 36.1,
    },
    // Lácteos medios en grasa
    {
      nombre: 'Leche entera',
      categoria: 'Lácteos medios en grasa',
      calorias_100g: 61.0,
      proteinas_100g: 3.2,
      carbohidratos_100g: 4.8,
      grasas_100g: 3.3,
    },
    {
      nombre: 'Yogurt natural entero',
      categoria: 'Lácteos medios en grasa',
      calorias_100g: 61.0,
      proteinas_100g: 3.5,
      carbohidratos_100g: 4.7,
      grasas_100g: 3.3,
    },
    // Lácteos bajos en grasa
    {
      nombre: 'Leche descremada',
      categoria: 'Lácteos bajos en grasa',
      calorias_100g: 34.0,
      proteinas_100g: 3.4,
      carbohidratos_100g: 5.0,
      grasas_100g: 0.1,
    },
    {
      nombre: 'Quesillo descremado',
      categoria: 'Lácteos bajos en grasa',
      calorias_100g: 72.0,
      proteinas_100g: 12.4,
      carbohidratos_100g: 2.7,
      grasas_100g: 1.0,
    },
    // Grasas
    {
      nombre: 'Aceite de maravilla',
      categoria: 'Grasas',
      calorias_100g: 884.0,
      proteinas_100g: 0.0,
      carbohidratos_100g: 0.0,
      grasas_100g: 100.0,
    },
    {
      nombre: 'Mantequilla con sal',
      categoria: 'Grasas',
      calorias_100g: 717.0,
      proteinas_100g: 0.9,
      carbohidratos_100g: 0.1,
      grasas_100g: 81.1,
    },
    // Alimentos ricos en grasas
    {
      nombre: 'Palta',
      categoria: 'Alimentos ricos en grasas',
      calorias_100g: 160.0,
      proteinas_100g: 2.0,
      carbohidratos_100g: 8.5,
      grasas_100g: 14.7,
    },
    {
      nombre: 'Nueces peladas',
      categoria: 'Alimentos ricos en grasas',
      calorias_100g: 654.0,
      proteinas_100g: 15.2,
      carbohidratos_100g: 13.7,
      grasas_100g: 65.2,
    },
    // Azúcares
    {
      nombre: 'Azúcar blanca refinada',
      categoria: 'Azúcares',
      calorias_100g: 387.0,
      proteinas_100g: 0.0,
      carbohidratos_100g: 100.0,
      grasas_100g: 0.0,
    },
    {
      nombre: 'Miel de abeja',
      categoria: 'Azúcares',
      calorias_100g: 304.0,
      proteinas_100g: 0.3,
      carbohidratos_100g: 82.4,
      grasas_100g: 0.0,
    },
    // Cereales
    {
      nombre: 'Arroz blanco crudo',
      categoria: 'Cereales',
      calorias_100g: 365.0,
      proteinas_100g: 7.1,
      carbohidratos_100g: 80.0,
      grasas_100g: 0.7,
    },
    {
      nombre: 'Pan marraqueta',
      categoria: 'Cereales',
      calorias_100g: 277.0,
      proteinas_100g: 8.9,
      carbohidratos_100g: 58.0,
      grasas_100g: 1.1,
    },
    {
      nombre: 'Avena tradicional',
      categoria: 'Cereales',
      calorias_100g: 389.0,
      proteinas_100g: 16.9,
      carbohidratos_100g: 66.3,
      grasas_100g: 6.9,
    },
    // Legumbres
    {
      nombre: 'Lentejas crudas',
      categoria: 'Legumbres',
      calorias_100g: 353.0,
      proteinas_100g: 25.8,
      carbohidratos_100g: 60.1,
      grasas_100g: 1.1,
    },
    {
      nombre: 'Garbanzos crudos',
      categoria: 'Legumbres',
      calorias_100g: 364.0,
      proteinas_100g: 19.3,
      carbohidratos_100g: 60.7,
      grasas_100g: 6.0,
    }
  ];

  await prisma.alimentos.createMany({
    data: alimentosData,
  });

  console.log(`Se insertaron ${alimentosData.length} alimentos exitosamente en la base de datos.`);
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
