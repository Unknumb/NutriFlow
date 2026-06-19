-- ============================================================================
-- NutriFlow — Script SQL final (DDL + datos de prueba)
-- Motor: PostgreSQL 15+ (compatible con Supabase)
-- Origen del modelo: producto/backend-core/prisma/schema.prisma
-- Genera el esquema de dominio de la aplicación (NO incluye las tablas
-- gestionadas por Supabase Auth: auth.users, sessions, etc.).
-- ============================================================================

-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- búsqueda de alimentos sin acentos

-- Limpieza para re-ejecución idempotente (respeta dependencias)
DROP TABLE IF EXISTS ingredientes_preparacion CASCADE;
DROP TABLE IF EXISTS detalle_pauta            CASCADE;
DROP TABLE IF EXISTS pautas                   CASCADE;
DROP TABLE IF EXISTS planificaciones          CASCADE;
DROP TABLE IF EXISTS "Evaluacion"             CASCADE;
DROP TABLE IF EXISTS antropometria            CASCADE;
DROP TABLE IF EXISTS consultas                CASCADE;
DROP TABLE IF EXISTS preparaciones            CASCADE;
DROP TABLE IF EXISTS pacientes                CASCADE;
DROP TABLE IF EXISTS alimentos                CASCADE;
DROP TABLE IF EXISTS perfiles_nutricionistas  CASCADE;

-- ============================================================================
-- DDL — Definición de tablas
-- ============================================================================

-- 1. perfiles_nutricionistas
--    En producción, id = auth.users.id (Supabase). Aquí es PK autónoma.
CREATE TABLE perfiles_nutricionistas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre                text NOT NULL,
  apellido              text NOT NULL,
  registro_profesional  text UNIQUE,
  email                 text NOT NULL UNIQUE,
  avatar_url            text,
  fecha_creacion        timestamptz DEFAULT now()
);

-- 2. alimentos (catálogo, grupos de intercambio)
CREATE TABLE alimentos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre              text NOT NULL,
  categoria           text,
  calorias_100g       numeric(6,2) NOT NULL,
  proteinas_100g      numeric(6,2) NOT NULL,
  carbohidratos_100g  numeric(6,2) NOT NULL,
  grasas_100g         numeric(6,2) NOT NULL,
  marca               text,
  restricciones       text[] NOT NULL DEFAULT '{}',
  CONSTRAINT alimentos_nombre_marca_key UNIQUE (nombre, marca)
);

-- 3. pacientes
CREATE TABLE pacientes (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutricionista_id           uuid NOT NULL REFERENCES perfiles_nutricionistas(id) ON DELETE CASCADE,
  nombre                     text NOT NULL,
  apellido                   text NOT NULL,
  fecha_nacimiento           date NOT NULL,
  sexo_biologico             char(1),
  email                      text,
  telefono                   text,
  rut                        text,
  ocupacion                  text,
  direccion                  text,
  enfermedades               text[] NOT NULL DEFAULT '{}',
  alergias                   text[] NOT NULL DEFAULT '{}',
  preferencias_alimentarias  text[] NOT NULL DEFAULT '{}',
  notas_preferencias         text,
  fecha_creacion             timestamptz DEFAULT now()
);
CREATE INDEX idx_pacientes_nutricionista ON pacientes(nutricionista_id);
-- RUT único por nutricionista, sólo cuando el paciente tiene RUT (índice parcial)
CREATE UNIQUE INDEX ux_pacientes_nutri_rut ON pacientes(nutricionista_id, rut) WHERE rut IS NOT NULL;

-- 4. Evaluacion (antropometría rápida ligada al paciente)
CREATE TABLE "Evaluacion" (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id             uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nutricionista_id        uuid NOT NULL,
  fecha_evaluacion        timestamptz NOT NULL DEFAULT now(),
  peso_actual             double precision NOT NULL,
  talla_cm                double precision NOT NULL,
  nivel_actividad_fisica  text NOT NULL,
  objetivo                text NOT NULL
);

-- 5. consultas
CREATE TABLE consultas (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id      uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_consulta   timestamptz DEFAULT now(),
  notas_evolucion  text
);
CREATE INDEX idx_consultas_paciente ON consultas(paciente_id);

-- 6. antropometria (medidas detalladas por consulta)
CREATE TABLE antropometria (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id                 uuid NOT NULL REFERENCES consultas(id) ON DELETE CASCADE,
  peso_kg                     numeric(5,2) NOT NULL,
  talla_cm                    numeric(5,2) NOT NULL,
  circunferencia_cintura_cm   numeric(5,2),
  porcentaje_grasa_estimado   numeric(4,2)
);
CREATE INDEX idx_antropometria_consulta ON antropometria(consulta_id);

-- 7. planificaciones  (★ SEPARADA de pautas: contiene el OBJETIVO de macros)
CREATE TABLE planificaciones (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id          uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  nutricionista_id     uuid NOT NULL,
  nombre               text,
  activa               boolean NOT NULL DEFAULT false,
  calorias_totales     double precision NOT NULL,
  distribucion_macros  jsonb NOT NULL,
  fecha_creacion       timestamptz DEFAULT now()
);
-- Regla de negocio: una sola planificación activa por paciente
CREATE UNIQUE INDEX ux_planif_activa_por_paciente ON planificaciones(paciente_id) WHERE activa;

-- 8. pautas  (★ SEPARADA de planificaciones: materializa la GRILLA de comidas)
CREATE TABLE pautas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consulta_id           uuid REFERENCES consultas(id) ON DELETE CASCADE,
  nombre                text,
  descripcion_general   text,
  estructura_grid_json  jsonb DEFAULT '{}'::jsonb,
  fecha_creacion        timestamptz DEFAULT now(),
  nutricionista_id      uuid NOT NULL,
  paciente_id           uuid NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  tiempos_comida        jsonb NOT NULL,
  planificacion_id      uuid REFERENCES planificaciones(id) ON DELETE CASCADE
);
CREATE INDEX idx_pautas_consulta      ON pautas(consulta_id);
CREATE INDEX idx_pautas_planificacion ON pautas(planificacion_id);

-- 9. detalle_pauta (alimentos y cantidades dentro de una pauta)
CREATE TABLE detalle_pauta (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pauta_id     uuid NOT NULL REFERENCES pautas(id) ON DELETE CASCADE,
  alimento_id  uuid NOT NULL REFERENCES alimentos(id),
  cantidad_g   numeric(6,2) NOT NULL,
  momento_dia  text
);
CREATE INDEX idx_detalle_pauta_pauta ON detalle_pauta(pauta_id);

-- 10. preparaciones (recetas)
CREATE TABLE preparaciones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text NOT NULL,
  descripcion       text,
  instrucciones     text,
  nutricionista_id  uuid REFERENCES perfiles_nutricionistas(id) ON DELETE CASCADE,
  tipo_comida       text,
  imagen_url        text,
  fecha_creacion    timestamptz DEFAULT now(),
  CONSTRAINT chk_tipo_comida CHECK (tipo_comida IS NULL OR tipo_comida IN ('desayuno','almuerzo','cena','colacion'))
);
CREATE INDEX idx_preparaciones_nutricionista ON preparaciones(nutricionista_id);

-- 11. ingredientes_preparacion
CREATE TABLE ingredientes_preparacion (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preparacion_id  uuid NOT NULL REFERENCES preparaciones(id) ON DELETE CASCADE,
  alimento_id     uuid NOT NULL REFERENCES alimentos(id) ON DELETE CASCADE,
  cantidad_g      numeric(6,2) NOT NULL
);

-- ============================================================================
-- DATOS DE PRUEBA
-- ============================================================================

-- 1) Catálogo de alimentos semilla (Porciones de intercambio UDD/MINSAL)
INSERT INTO alimentos (nombre, categoria, calorias_100g, proteinas_100g, carbohidratos_100g, grasas_100g, marca, restricciones) VALUES
  ('Pechuga de pollo (cruda)', 'Carnes Bajas en Grasa', 165, 31, 0, 3.6, 'Genérico', '{alto_en_proteina}'),
  ('Huevo (entero)', 'Carnes Altas en Grasa', 155, 13, 1.1, 11, 'Genérico', '{alto_en_proteina}'),
  ('Tomate', 'Verduras en general', 18, 0.9, 3.9, 0.2, 'Genérico', '{}'),
  ('Lechuga', 'Verduras libre consumo', 15, 1.4, 2.9, 0.2, 'Genérico', '{}'),
  ('Manzana', 'Frutas', 52, 0.3, 13.8, 0.2, 'Genérico', '{}'),
  ('Plátano', 'Frutas', 89, 1.1, 22.8, 0.3, 'Genérico', '{}'),
  ('Lentejas (crudas)', 'Leguminosas', 352, 24.6, 63.4, 1.1, 'Genérico', '{alto_en_proteina}'),
  ('Garbanzos (crudos)', 'Leguminosas', 378, 20.5, 63, 6, 'Genérico', '{alto_en_proteina}'),
  ('Arroz blanco (cocido)', 'Cereales', 130, 2.7, 28, 0.3, 'Genérico', '{}'),
  ('Marraqueta', 'Cereales', 260, 8, 53, 1.5, 'Genérico', '{}'),
  ('Hallulla', 'Cereales', 310, 8.5, 54, 6.5, 'Genérico', '{}'),
  ('Palta', 'Aceites y Grasas', 160, 2, 8.5, 14.7, 'Genérico', '{}'),
  ('Almendras', 'Aceites y Grasas', 579, 21.2, 21.6, 49.9, 'Genérico', '{alto_en_proteina}'),
  ('Nueces', 'Aceites y Grasas', 654, 15.2, 13.7, 65.2, 'Genérico', '{alto_en_proteina}'),
  ('Leche entera', 'Lácteos Altos en Grasa', 61, 3.2, 4.8, 3.3, 'Genérico', '{}'),
  ('Leche descremada', 'Lácteos Bajos en Grasa', 35, 3.4, 5, 0.1, 'Genérico', '{}'),
  ('Quesillo', 'Lácteos Bajos en Grasa', 100, 12, 3, 4.5, 'Genérico', '{}'),
  ('Avena', 'Cereales', 389, 16.9, 66.3, 6.9, 'Genérico', '{alto_en_proteina}'),
  ('Pescado blanco / Merluza', 'Carnes Bajas en Grasa', 90, 19, 0, 1.2, 'Genérico', '{alto_en_proteina}'),
  ('Atún al agua (lomo enlatado)', 'Carnes Bajas en Grasa', 86, 19.4, 0, 1, 'Genérico', '{alto_en_proteina}'),
  ('Papa', 'Cereales', 77, 2, 17.5, 0.1, 'Genérico', '{}'),
  ('Zanahoria', 'Verduras en general', 41, 0.9, 9.6, 0.2, 'Genérico', '{}'),
  ('Apio', 'Verduras libre consumo', 14, 0.7, 3, 0.2, 'Genérico', '{}'),
  ('Naranja', 'Frutas', 47, 0.9, 11.8, 0.1, 'Genérico', '{}'),
  ('Fideos / Pasta (cocida)', 'Cereales', 158, 5.8, 31, 0.9, 'Genérico', '{}'),
  ('Quinoa (cruda)', 'Cereales', 368, 14.1, 64.2, 6.1, 'Genérico', '{alto_en_proteina}'),
  ('Aceite de oliva', 'Aceites y Grasas', 884, 0, 0, 100, 'Genérico', '{}'),
  ('Carne de vacuno magra (Posta)', 'Carnes Bajas en Grasa', 120, 22, 0, 3.5, 'Genérico', '{alto_en_proteina}'),
  ('Espinaca', 'Verduras libre consumo', 23, 2.9, 3.6, 0.4, 'Genérico', '{}'),
  ('Frutilla', 'Frutas', 32, 0.7, 7.7, 0.3, 'Genérico', '{}');

-- 2) Datos de prueba relacionales (UUIDs fijos para demostrar el encadenamiento)
INSERT INTO perfiles_nutricionistas (id, nombre, apellido, registro_profesional, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Javiera', 'Soto', 'NUT-12345', 'javiera@nutriflow.cl');

INSERT INTO pacientes (id, nutricionista_id, nombre, apellido, fecha_nacimiento, sexo_biologico, rut) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Juan', 'Pérez', '1990-05-20', 'M', '12345678-5');

INSERT INTO "Evaluacion" (paciente_id, nutricionista_id, peso_actual, talla_cm, nivel_actividad_fisica, objetivo) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   70, 175, 'Sedentario', 'Mantención');

-- Planificación = OBJETIVO de macros (activa). Separada de la pauta.
INSERT INTO planificaciones (id, paciente_id, nutricionista_id, nombre, activa, calorias_totales, distribucion_macros) VALUES
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222',
   '11111111-1111-1111-1111-111111111111', 'Planificación 1', true, 2000,
   '{"proteina": 30, "grasa": 30, "carbohidrato": 40}'::jsonb);

-- Pauta = MATERIALIZACIÓN de la planificación en una grilla de comidas.
INSERT INTO pautas (id, paciente_id, nutricionista_id, planificacion_id, nombre, tiempos_comida, estructura_grid_json) VALUES
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
   '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
   'Pauta 1', '["desayuno","almuerzo","cena"]'::jsonb, '{}'::jsonb);

-- Detalle de pauta: se referencian alimentos por nombre (sus ids son generados).
INSERT INTO detalle_pauta (pauta_id, alimento_id, cantidad_g, momento_dia)
SELECT '44444444-4444-4444-4444-444444444444', id, 150, 'almuerzo'
FROM alimentos WHERE nombre = 'Pechuga de pollo (cruda)' AND marca = 'Genérico';

INSERT INTO detalle_pauta (pauta_id, alimento_id, cantidad_g, momento_dia)
SELECT '44444444-4444-4444-4444-444444444444', id, 200, 'almuerzo'
FROM alimentos WHERE nombre = 'Arroz blanco (cocido)' AND marca = 'Genérico';

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
