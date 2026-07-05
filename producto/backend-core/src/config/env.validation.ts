import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

/**
 * Esquema de validación de variables de entorno.
 *
 * Se ejecuta al arrancar la app (vía `ConfigModule.forRoot({ validate })`): si
 * falta un secreto obligatorio o está vacío, el proceso falla de inmediato en
 * lugar de arrancar en un estado inseguro/roto. Esto convierte errores de
 * despliegue (secreto no configurado en Render/Vercel) en fallos tempranos y
 * visibles, no en 500 intermitentes en producción.
 */
class EnvironmentVariables {
  // ---- Base de datos (Supabase / PostgreSQL) ----
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  DIRECT_URL!: string;

  // ---- Supabase Auth ----
  // Secreto legado HS256: la validación de tokens usa JWKS/ES256, pero se
  // mantiene presente por compatibilidad. No debe quedar vacío si está definido.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  SUPABASE_JWT_SECRET?: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  SUPABASE_ANON_KEY!: string;

  // ---- Redis (Upstash) ----
  @IsString()
  @IsNotEmpty()
  UPSTASH_REDIS_REST_URL!: string;

  @IsString()
  @IsNotEmpty()
  UPSTASH_REDIS_REST_TOKEN!: string;

  // ---- Configuración no secreta (opcional; tiene defaults en el código) ----
  @IsOptional()
  @IsString()
  MATH_ENGINE_URL?: string;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  @IsOptional()
  @IsString()
  PORT?: string;

  @IsOptional()
  @IsIn(['development', 'production', 'test'])
  NODE_ENV?: string;

  // ---- Observabilidad (Grafana Cloud OTLP) ----
  // Si no se define, `tracing.ts` no inicializa el SDK (no-op).
  @IsOptional()
  @IsString()
  OTEL_EXPORTER_OTLP_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  OTEL_EXPORTER_OTLP_HEADERS?: string;

  @IsOptional()
  @IsString()
  OTEL_SERVICE_NAME?: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const detalle = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n  - ');
    throw new Error(
      `Validación de variables de entorno fallida. Revisa el .env / los secretos de la plataforma:\n  - ${detalle}`,
    );
  }

  return validated;
}
