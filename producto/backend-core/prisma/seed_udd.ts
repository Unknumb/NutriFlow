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

const alimentosUDD = [
  { nombre: 'Pechuga de pollo (cruda)', categoria: 'Carnes Bajas en Grasa', calorias_100g: 165, proteinas_100g: 31, carbohidratos_100g: 0, grasas_100g: 3.6 },
  { nombre: 'Huevo (entero)', categoria: 'Carnes Altas en Grasa', calorias_100g: 155, proteinas_100g: 13, carbohidratos_100g: 1.1, grasas_100g: 11 },
  { nombre: 'Tomate', categoria: 'Verduras en general', calorias_100g: 18, proteinas_100g: 0.9, carbohidratos_100g: 3.9, grasas_100g: 0.2 },
  { nombre: 'Lechuga', categoria: 'Verduras libre consumo', calorias_100g: 15, proteinas_100g: 1.4, carbohidratos_100g: 2.9, grasas_100g: 0.2 },
  { nombre: 'Manzana', categoria: 'Frutas', calorias_100g: 52, proteinas_100g: 0.3, carbohidratos_100g: 13.8, grasas_100g: 0.2 },
  { nombre: 'Plátano', categoria: 'Frutas', calorias_100g: 89, proteinas_100g: 1.1, carbohidratos_100g: 22.8, grasas_100g: 0.3 },
  { nombre: 'Lentejas (crudas)', categoria: 'Leguminosas', calorias_100g: 352, proteinas_100g: 24.6, carbohidratos_100g: 63.4, grasas_100g: 1.1 },
  { nombre: 'Garbanzos (crudos)', categoria: 'Leguminosas', calorias_100g: 378, proteinas_100g: 20.5, carbohidratos_100g: 63, grasas_100g: 6 },
  { nombre: 'Arroz blanco (cocido)', categoria: 'Cereales', calorias_100g: 130, proteinas_100g: 2.7, carbohidratos_100g: 28, grasas_100g: 0.3 },
  { nombre: 'Marraqueta', categoria: 'Cereales', calorias_100g: 260, proteinas_100g: 8, carbohidratos_100g: 53, grasas_100g: 1.5 },
  { nombre: 'Hallulla', categoria: 'Cereales', calorias_100g: 310, proteinas_100g: 8.5, carbohidratos_100g: 54, grasas_100g: 6.5 },
  { nombre: 'Palta', categoria: 'Aceites y Grasas', calorias_100g: 160, proteinas_100g: 2, carbohidratos_100g: 8.5, grasas_100g: 14.7 },
  { nombre: 'Almendras', categoria: 'Aceites y Grasas', calorias_100g: 579, proteinas_100g: 21.2, carbohidratos_100g: 21.6, grasas_100g: 49.9 },
  { nombre: 'Nueces', categoria: 'Aceites y Grasas', calorias_100g: 654, proteinas_100g: 15.2, carbohidratos_100g: 13.7, grasas_100g: 65.2 },
  { nombre: 'Leche entera', categoria: 'Lácteos Altos en Grasa', calorias_100g: 61, proteinas_100g: 3.2, carbohidratos_100g: 4.8, grasas_100g: 3.3 },
  { nombre: 'Leche descremada', categoria: 'Lácteos Bajos en Grasa', calorias_100g: 35, proteinas_100g: 3.4, carbohidratos_100g: 5, grasas_100g: 0.1 },
  { nombre: 'Quesillo', categoria: 'Lácteos Bajos en Grasa', calorias_100g: 100, proteinas_100g: 12, carbohidratos_100g: 3, grasas_100g: 4.5 },
  { nombre: 'Avena', categoria: 'Cereales', calorias_100g: 389, proteinas_100g: 16.9, carbohidratos_100g: 66.3, grasas_100g: 6.9 },
  { nombre: 'Pescado blanco / Merluza', categoria: 'Carnes Bajas en Grasa', calorias_100g: 90, proteinas_100g: 19, carbohidratos_100g: 0, grasas_100g: 1.2 },
  { nombre: 'Atún al agua (lomo enlatado)', categoria: 'Carnes Bajas en Grasa', calorias_100g: 86, proteinas_100g: 19.4, carbohidratos_100g: 0, grasas_100g: 1 },
  { nombre: 'Papa', categoria: 'Cereales', calorias_100g: 77, proteinas_100g: 2, carbohidratos_100g: 17.5, grasas_100g: 0.1 },
  { nombre: 'Zanahoria', categoria: 'Verduras en general', calorias_100g: 41, proteinas_100g: 0.9, carbohidratos_100g: 9.6, grasas_100g: 0.2 },
  { nombre: 'Apio', categoria: 'Verduras libre consumo', calorias_100g: 14, proteinas_100g: 0.7, carbohidratos_100g: 3, grasas_100g: 0.2 },
  { nombre: 'Naranja', categoria: 'Frutas', calorias_100g: 47, proteinas_100g: 0.9, carbohidratos_100g: 11.8, grasas_100g: 0.1 },
  { nombre: 'Fideos / Pasta (cocida)', categoria: 'Cereales', calorias_100g: 158, proteinas_100g: 5.8, carbohidratos_100g: 31, grasas_100g: 0.9 },
  { nombre: 'Quinoa (cruda)', categoria: 'Cereales', calorias_100g: 368, proteinas_100g: 14.1, carbohidratos_100g: 64.2, grasas_100g: 6.1 },
  { nombre: 'Aceite de oliva', categoria: 'Aceites y Grasas', calorias_100g: 884, proteinas_100g: 0, carbohidratos_100g: 0, grasas_100g: 100 },
  { nombre: 'Carne de vacuno magra (Posta)', categoria: 'Carnes Bajas en Grasa', calorias_100g: 120, proteinas_100g: 22, carbohidratos_100g: 0, grasas_100g: 3.5 },
  { nombre: 'Espinaca', categoria: 'Verduras libre consumo', calorias_100g: 23, proteinas_100g: 2.9, carbohidratos_100g: 3.6, grasas_100g: 0.4 },
  { nombre: 'Frutilla', categoria: 'Frutas', calorias_100g: 32, proteinas_100g: 0.7, carbohidratos_100g: 7.7, grasas_100g: 0.3 }
];

async function main() {
  console.log('Iniciando la carga de Alimentos Genéricos (Porciones de Intercambio UDD/MINSAL)...');
  
  let importedCount = 0;

  for (const alimento of alimentosUDD) {
    const restricciones: string[] = [];
    
    // Aplicamos la misma lógica de "alto_en_proteina"
    if (alimento.proteinas_100g > 12) {
      restricciones.push('alto_en_proteina');
    }

    await prisma.alimentos.upsert({
      where: {
        nombre_marca: {
          nombre: alimento.nombre,
          marca: 'Genérico'
        }
      },
      update: {
        categoria: alimento.categoria,
        calorias_100g: alimento.calorias_100g,
        proteinas_100g: alimento.proteinas_100g,
        carbohidratos_100g: alimento.carbohidratos_100g,
        grasas_100g: alimento.grasas_100g,
        restricciones: restricciones
      },
      create: {
        nombre: alimento.nombre,
        marca: 'Genérico',
        categoria: alimento.categoria,
        calorias_100g: alimento.calorias_100g,
        proteinas_100g: alimento.proteinas_100g,
        carbohidratos_100g: alimento.carbohidratos_100g,
        grasas_100g: alimento.grasas_100g,
        restricciones: restricciones
      }
    });

    importedCount++;
  }

  console.log(`¡Carga finalizada! Se insertaron/actualizaron ${importedCount} alimentos genéricos correctamente.`);
}

main()
  .catch((e) => {
    console.error('Error al insertar alimentos genéricos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
