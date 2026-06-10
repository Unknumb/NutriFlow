import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import axios from 'axios';

// Asegurarse de que dotenv cargue las variables de entorno si existe
try {
  require('dotenv').config();
} catch (e) {}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Categorizador inteligente de productos
 */
function determinarCategoria(nombre: string, tags_off: string[] = [], fat: number = 0): string {
  const n = nombre.toLowerCase();
  
  if (n.includes('mayo') || n.includes('aceite') || n.includes('mantequilla')) {
    return 'Aceites y Grasas';
  }
  
  if (n.includes('leche') || n.includes('yogurt') || n.includes('yogur') || n.includes('queso')) {
    // Si la grasa es mayor a 3g por cada 100g se clasifica como Alto en Grasa
    if (fat > 3) {
      return 'Lácteos Altos en Grasa';
    }
    return 'Lácteos Bajos en Grasa';
  }
  
  if (n.includes('pan') || n.includes('avena') || n.includes('fideo') || n.includes('arroz') || n.includes('galleta')) {
    return 'Cereales';
  }
  
  if (n.includes('pollo') || n.includes('carne') || n.includes('pescado') || n.includes('atún') || n.includes('atun')) {
    return 'Carnes Bajas en Grasa';
  }
  
  return 'Otros';
}

async function main() {
  console.log('Iniciando la importación masiva de productos desde Open Food Facts (Chile)...');
  
  const urlGeneral = 'https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=chile&json=true&page_size=100';
  const urlProtein = 'https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=chile&search_terms=protein&json=true&page_size=100';
  const urlProteina = 'https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=chile&search_terms=proteina&json=true&page_size=100';

  // Función auxiliar para esperar
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  try {
    const axiosConfig = {
      headers: {
        'User-Agent': 'NutriFlowApp - Node - Version 1.0'
      }
    };

    let allProducts: any[] = [];

    console.log('Obteniendo productos generales (page_size: 100)...');
    try {
      const resGeneral = await axios.get(urlGeneral, axiosConfig);
      allProducts.push(...(resGeneral.data.products || []));
    } catch (e: any) {
      console.warn('Advertencia: Falló la petición general ->', e.message);
    }
    
    await delay(2000); // Esperar 2 segundos para no saturar la API
    console.log('Obteniendo productos filtrados por "protein"...');
    try {
      const resProtein = await axios.get(urlProtein, axiosConfig);
      allProducts.push(...(resProtein.data.products || []));
    } catch (e: any) {
      console.warn('Advertencia: Falló la petición "protein" ->', e.message);
    }

    await delay(2000);
    console.log('Obteniendo productos filtrados por "proteina"...');
    try {
      const resProteina = await axios.get(urlProteina, axiosConfig);
      allProducts.push(...(resProteina.data.products || []));
    } catch (e: any) {
      console.warn('Advertencia: Falló la petición "proteina" ->', e.message);
    }
    
    if (allProducts.length === 0) {
      console.log('No se encontraron productos.');
      return;
    }

    // Eliminar duplicados basándose en el nombre y la marca para no hacer upserts de más
    const uniqueProductsMap = new Map();
    for (const p of allProducts) {
      const nombre = p.product_name?.trim();
      const marca = p.brands?.trim();
      if (nombre && marca) {
        const key = `${nombre.toLowerCase()}-${marca.toLowerCase()}`;
        if (!uniqueProductsMap.has(key)) {
          uniqueProductsMap.set(key, p);
        }
      }
    }
    
    const uniqueProducts = Array.from(uniqueProductsMap.values());
    console.log(`Se procesarán ${uniqueProducts.length} productos únicos (de ${allProducts.length} traídos en total).`);

    let importedCount = 0;

    for (const product of uniqueProducts) {
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

      const calorias = Number(Number(calorias_100g).toFixed(2));
      const proteinas = Number(Number(proteinas_100g).toFixed(2));
      const carbohidratos = Number(Number(carbohidratos_100g).toFixed(2));
      const grasas = Number(Number(grasas_100g).toFixed(2));

      // Asignar categoría inteligentemente, asegurando que nunca sea null
      const categoria = determinarCategoria(nombre, product.categories_tags || [], grasas);
      
      // Etiquetado automático de restricción "alto_en_proteina"
      const restricciones: string[] = [];
      if (proteinas > 12) {
        restricciones.push('alto_en_proteina');
      }

      // Upsert en la base de datos
      await prisma.alimentos.upsert({
        where: {
          nombre_marca: {
            nombre: nombre,
            marca: marca,
          }
        },
        update: {
          categoria: categoria,
          restricciones: restricciones,
          calorias_100g: calorias,
          proteinas_100g: proteinas,
          carbohidratos_100g: carbohidratos,
          grasas_100g: grasas,
        },
        create: {
          nombre: nombre,
          marca: marca,
          categoria: categoria,
          restricciones: restricciones,
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
