import { IsString, IsEmail, IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePacienteDto {
  @ApiProperty({ description: 'ID UUID del nutricionista asignado', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  nutricionista_id: string;

  @ApiProperty({ description: 'Nombre del paciente', example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Apellido del paciente', example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiPropertyOptional({ description: 'Correo electrónico del paciente', example: 'juan@example.com' })
  @IsEmail()
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
  @IsString()
  @IsOptional()
  telefono?: string;
}

