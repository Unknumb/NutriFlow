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
    if (fat > 3) {
      return 'Lácteos Altos en Grasa';
    }
    return 'Lácteos Bajos en Grasa';
  }
  
  if (n.includes('pan') || n.includes('avena') || n.includes('fideo') || n.includes('arroz') || n.includes('galleta')) {
    return 'Cereales';
  }
  
  if (n.includes('pollo') || n.includes('carne') || n.includes('pescado') || n.includes('atún') || n.includes('atun') || n.includes('jamon')) {
    return 'Carnes Bajas en Grasa'; // Puedes ajustar las reglas finas si deseas diferenciar embutidos
  }
  
  return 'Otros';
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log('Iniciando la importación multicategoría masiva desde Open Food Facts (Chile)...');
  
  // Array de keywords más consumidas en Chile
  const keywords = [
    'pan', 'leche', 'yogurt', 'queso', 'galleta', 
    'fideos', 'arroz', 'avena', 'jamon', 'atun', 
    'cereal', 'aceite', 'salsa'
  ];

  const axiosConfig = {
    headers: {
      'User-Agent': 'NutriFlowApp - Node - Version 1.0'
    }
  };

  const uniqueProductsMap = new Map();
  const failedKeywords: string[] = [];

  try {
    // 1. Fase de Recolección (Fetch y Consolidación)
    for (const keyword of keywords) {
      console.log(`\nBuscando productos para la palabra clave: "${keyword}"...`);
      const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=chile&search_terms=${keyword}&json=true&page_size=100`;

      try {
        const response = await axios.get(url, axiosConfig);
        const products = response.data.products || [];
        console.log(`  -> Obtenidos ${products.length} productos.`);

        // Añadir al Map para deduplicación instantánea
        for (const p of products) {
          const nombre = p.product_name?.trim();
          const marca = p.brands?.trim();
          if (nombre && marca) {
            const key = `${nombre.toLowerCase()}-${marca.toLowerCase()}`;
            if (!uniqueProductsMap.has(key)) {
              uniqueProductsMap.set(key, p);
            }
          }
        }
      } catch (e: any) {
        console.warn(`  [!] Advertencia: Falló la petición para "${keyword}" ->`, e.message);
        failedKeywords.push(keyword);
      }

      // Sistema Anti-Bloqueos: Esperar 2 segundos antes de la siguiente petición
      console.log('  -> Esperando 2 segundos para evitar rate limits de Open Food Facts...');
      await delay(2000);
    }
    
    // 2. Fase de Reintentos (Retry Pattern)
    if (failedKeywords.length > 0) {
      console.log(`\n-----------------------------------------`);
      console.log(`Se detectaron fallos en ${failedKeywords.length} palabras clave. Reintentando en 5 segundos...`);
      console.log(`-----------------------------------------`);
      await delay(5000);

      for (const keyword of failedKeywords) {
        console.log(`\n[REINTENTO] Buscando productos para: "${keyword}"...`);
        const url = `https://world.openfoodfacts.org/cgi/search.pl?action=process&tagtype_0=countries&tag_contains_0=contains&tag_0=chile&search_terms=${keyword}&json=true&page_size=100`;

        try {
          const response = await axios.get(url, axiosConfig);
          const products = response.data.products || [];
          console.log(`  -> Obtenidos ${products.length} productos en el reintento.`);

          for (const p of products) {
            const nombre = p.product_name?.trim();
            const marca = p.brands?.trim();
            if (nombre && marca) {
              const key = `${nombre.toLowerCase()}-${marca.toLowerCase()}`;
              if (!uniqueProductsMap.has(key)) {
                uniqueProductsMap.set(key, p);
              }
            }
          }
        } catch (e: any) {
          console.warn(`  [!] Falló definitivamente el reintento para "${keyword}" ->`, e.message);
        }

        console.log('  -> Esperando 2 segundos...');
        await delay(2000);
      }
    }
    
    // 3. Fase de Procesamiento e Inserción en Base de Datos
    const uniqueProducts = Array.from(uniqueProductsMap.values());
    console.log(`\n=========================================`);
    console.log(`Recolección finalizada. Procesando ${uniqueProducts.length} productos únicos.`);
    console.log(`=========================================\n`);

    if (uniqueProducts.length === 0) {
      console.log('No se encontraron productos para insertar.');
      return;
    }

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

      // Redondear a 2 decimales para Prisma Decimal(6,2)
      const calorias = Number(Number(calorias_100g).toFixed(2));
      const proteinas = Number(Number(proteinas_100g).toFixed(2));
      const carbohidratos = Number(Number(carbohidratos_100g).toFixed(2));
      const grasas = Number(Number(grasas_100g).toFixed(2));

      // Asignar categoría inteligentemente
      const categoria = determinarCategoria(nombre, product.categories_tags || [], grasas);
      
      // Etiquetado automático de restricción
      const restricciones: string[] = [];
      if (proteinas > 12) {
        restricciones.push('alto_en_proteina');
      }

      // Inserción / Actualización
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

    console.log(`¡Importación masiva finalizada! Se insertaron/actualizaron ${importedCount} productos exitosamente en la base de datos.`);
  } catch (error) {
    console.error('Error general durante la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
