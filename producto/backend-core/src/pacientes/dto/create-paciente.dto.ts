// backend-core/src/pacientes/dto/create-paciente.dto.ts
import {
  IsString,
  IsEmail,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { esRutValido, IsRutChileno, normalizarRut } from '../utils/rut.util';

/** Convierte strings vacíos en undefined para que IsOptional aplique correctamente. */
const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

/** Limpia las listas de texto (trim) y descarta entradas vacías. */
const sanitizeStringArray = ({ value }: { value: unknown }) =>
  Array.isArray(value)
    ? value
        .filter((v): v is string => typeof v === 'string')
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
    : value;

export class CreatePacienteDto {

  @ApiProperty({ description: 'Nombre del paciente', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Apellido del paciente', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiPropertyOptional({ description: 'Correo electrónico del paciente', example: 'juan@example.com' })
  @Transform(emptyToUndefined)
  @IsEmail({}, { message: 'El correo del paciente no es válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Fecha de nacimiento', example: '1990-05-20' })
  @IsDateString()
  fecha_nacimiento: string;

  @ApiPropertyOptional({ description: 'Sexo biológico (ej. M o F)', example: 'M' })
  @IsString()
  @IsOptional()
  sexo_biologico?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto', example: '+56912345678' })
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(20)
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'RUT chileno (con o sin puntos/guión); se guarda normalizado como "12345678-9"',
    example: '12.345.678-5',
  })
  @Transform(({ value }) => {
    if (value === null) return null; // permite limpiar el RUT en updates (PATCH)
    if (typeof value !== 'string' || value.trim() === '') return undefined;
    // Solo normalizamos si es válido; si no, dejamos el valor original para que el validador lo rechace
    return esRutValido(value) ? normalizarRut(value) : value;
  })
  @IsRutChileno()
  @IsOptional()
  rut?: string;

  @ApiPropertyOptional({ description: 'Ocupación del paciente', example: 'Profesora' })
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(120)
  @IsOptional()
  ocupacion?: string;

  @ApiPropertyOptional({ description: 'Dirección del paciente', example: 'Av. Providencia 1234, Santiago' })
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(250)
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Enfermedades o condiciones de salud',
    example: ['Diabetes tipo 2', 'Hipotiroidismo'],
    type: [String],
  })
  @Transform(sanitizeStringArray)
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @IsOptional()
  enfermedades?: string[];

  @ApiPropertyOptional({
    description: 'Alergias alimentarias',
    example: ['Maní', 'Mariscos'],
    type: [String],
  })
  @Transform(sanitizeStringArray)
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @IsOptional()
  alergias?: string[];

  @ApiPropertyOptional({
    description: 'Preferencias alimentarias',
    example: ['Vegetariano', 'Sin lactosa'],
    type: [String],
  })
  @Transform(sanitizeStringArray)
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  @IsOptional()
  preferencias_alimentarias?: string[];

  @ApiPropertyOptional({
    description: 'Notas libres sobre salud y preferencias',
    example: 'Prefiere comidas sin picante. Cena temprano.',
  })
  @Transform(emptyToUndefined)
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notas_preferencias?: string;

  @ApiProperty({ description: 'Talla inicial en cm', example: 170 })
  @IsNotEmpty()
  talla_cm: number;

  @ApiProperty({ description: 'Peso inicial en kg', example: 70 })
  @IsNotEmpty()
  peso_kg: number;
}
