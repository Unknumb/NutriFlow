# Migraciones de base de datos

Estas migraciones reflejan los cambios aplicados a la base de datos de Supabase
durante el desarrollo. El SQL es **idéntico** al que se aplicó en producción
(extraído del historial de migraciones de Supabase).

## ⚠️ Importante: esta DB se gestionaba por introspección, no por Prisma Migrate

El `schema.prisma` se mantuvo con `prisma db pull` (introspección), no con
`prisma migrate`. Por eso **la base de datos YA tiene todas estas migraciones
aplicadas**. Estos archivos son el registro versionado de esos cambios.

### NO corras `prisma migrate deploy` contra la base existente sin baseline

Como la DB ya está al día pero la tabla `_prisma_migrations` no existe, un
`migrate deploy` intentaría re-aplicar todo y fallaría (columnas/policies ya
existen). Para adoptar Prisma Migrate sobre la DB actual, marca estas
migraciones como ya aplicadas (baseline):

```bash
# Una vez por cada carpeta de migración (en orden):
npx prisma migrate resolve --applied 20260612023212_revoke_handle_new_user_exec_from_anon_authenticated
npx prisma migrate resolve --applied 20260612023227_revoke_handle_new_user_exec_from_public
# ... y así con las 12
```

En una base **nueva/vacía** sí puedes correr `npx prisma migrate deploy` y se
aplicarán en orden cronológico.

## Orden y contenido

| Migración | Tipo | Qué hace |
|---|---|---|
| `20260612023212_revoke_handle_new_user_exec_from_anon_authenticated` | seguridad | Revoca EXECUTE de `handle_new_user()` a anon/authenticated |
| `20260612023227_revoke_handle_new_user_exec_from_public` | seguridad | Revoca EXECUTE de `handle_new_user()` a PUBLIC |
| `20260612032654_drop_insecure_pacientes_test_policy` | seguridad | Elimina policy de prueba que exponía todos los pacientes |
| `20260612033218_add_ficha_ampliada_pacientes` | schema | Columnas ocupacion/rut/direccion/enfermedades/alergias/preferencias + índice único RUT |
| `20260612113058_preparaciones_nutricionista_tipo_comida_rls` | schema | Columnas nutricionista_id/tipo_comida/imagen_url/fecha_creacion + RLS |
| `20260612115338_create_bucket_imagenes_preparaciones` | storage | Bucket público + policies de imágenes de preparaciones |
| `20260612115341_enable_unaccent_extension` | extensión | `unaccent` para búsqueda sin acentos |
| `20260612233804_recategorizar_alimentos_otros` | datos | Recategoriza los 108 alimentos de "Otros" |
| `20260613000947_avatar_perfil_bucket_y_columna` | schema/storage | `avatar_url` + bucket de avatares + policies |
| `20260613064337_mover_alimentos_a_ricos_en_grasas` | datos | Mueve palta/frutos secos a "Alimentos ricos en grasas" |
| `20260613230940_sacar_snacks_fritos_de_ricos_en_grasas` | datos | Saca snacks fritos de ARG a "Otros" |
| `20260614001540_unificar_verduras` | datos | Une "Verduras en general" + "Verduras libre consumo" → "Verduras" |
| `20260703000000_normalizacion_3fn_fks_uniques` | schema | Uniques compuestos en detalle_pauta/ingredientes_preparacion + FKs e índices de nutricionista_id (pautas, Evaluacion, planificaciones). Aplicada 2026-07-03 vía MCP de Supabase (ver `documentacion/Normalizacion_3FN.md`) |

> Las migraciones de **datos** referencian alimentos por nombre/id del catálogo
> importado (Open Food Facts/UDD). En una base sin esos datos no afectan filas
> (son idempotentes en la práctica).

## No incluido aquí

- **Tags de restricciones** (`restricciones` de alimentos): se aplicaron con el
  script `prisma/tag_restricciones.ts` (`ts-node prisma/tag_restricciones.ts --apply`),
  no como migración SQL. El script es el registro reproducible.
- **Buckets/policies de Storage** y **extensiones**: viven en los schemas
  `storage`/`extensions` de Supabase; se incluyen como SQL pero Prisma Migrate
  los trata como SQL plano (no los introspecta en el schema).
