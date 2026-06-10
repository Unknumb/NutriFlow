import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';

// Asegurarse de que dotenv cargue las variables de entorno si existe (opcional pero recomendado)
try {
  require('dotenv').config();
} catch (e) {}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando la importación de productos desde Open Food Facts (Chile)...');
  
  const url = 'https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=chile&json=true&page_size=50';
  
  try {
    const response = await axios.get(url);
    const products = response.data.products;
    
    if (!products || products.length === 0) {
      console.log('No se encontraron productos.');
      return;
    }

    let importedCount = 0;

    for (const product of products) {
      const nombre = product.product_name?.trim();
      const marca = product.brands?.trim();
      
      const nutriments = product.nutriments;
      
      if (!nombre || !marca || !nutriments) continue;

      const calorias_100g = nutriments['energy-kcal_100g'];
      const proteinas_100g = nutriments['proteins_100g'];
      const carbohidratos_100g = nutriments['carbohydrates_100g'];
      const grasas_100g = nutriments['fat_100g'];

      // Verificar que la información nutricional esté completa
      if (
        calorias_100g === undefined || 
        proteinas_100g === undefined || 
        carbohidratos_100g === undefined || 
        grasas_100g === undefined
      ) {
        continue;
      }

      // Redondear los valores a 2 decimales para que coincidan con Decimal(6,2)
      const calorias = Number(Number(calorias_100g).toFixed(2));
      const proteinas = Number(Number(proteinas_100g).toFixed(2));
      const carbohidratos = Number(Number(carbohidratos_100g).toFixed(2));
      const grasas = Number(Number(grasas_100g).toFixed(2));

      // Inserción o actualización con Prisma usando el índice compuesto
      await prisma.alimentos.upsert({
        where: {
          nombre_marca: {
            nombre: nombre,
            marca: marca,
          }
        },
        update: {
          calorias_100g: calorias,
          proteinas_100g: proteinas,
          carbohidratos_100g: carbohidratos,
          grasas_100g: grasas,
        },
        create: {
          nombre: nombre,
          marca: marca,
          calorias_100g: calorias,
          proteinas_100g: proteinas,
          carbohidratos_100g: carbohidratos,
          grasas_100g: grasas,
        }
      });
      
      importedCount++;
    }

    console.log(`Importación finalizada. Se insertaron/actualizaron ${importedCount} productos exitosamente.`);
  } catch (error) {
    console.error('Error al importar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
