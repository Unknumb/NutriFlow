import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class MacroDetailDto {
  @ApiProperty({ description: 'Cantidad en gramos', example: 150 })
  @IsNumber()
  @IsNotEmpty()
  gramos: number;

  @ApiProperty({ description: 'Porcentaje respecto a las calorías totales', example: 30 })
  @IsNumber()
  @IsNotEmpty()
  porcentaje: number;
}

export class MacrosDistribucionDto {
  @ApiProperty({ description: 'Distribución de proteínas' })
  @ValidateNested()
  @Type(() => MacroDetailDto)
  @IsNotEmpty()
  proteinas: MacroDetailDto;

  @ApiProperty({ description: 'Distribución de carbohidratos' })
  @ValidateNested()
  @Type(() => MacroDetailDto)
  @IsNotEmpty()
  carbohidratos: MacroDetailDto;

  @ApiProperty({ description: 'Distribución de grasas' })
  @ValidateNested()
  @Type(() => MacroDetailDto)
  @IsNotEmpty()
  grasas: MacroDetailDto;
}

export class GuardarDistribucionMacrosDto {
  @ApiProperty({ description: 'UUID del paciente', example: 'uuid-del-paciente' })
  @IsString()
  @IsNotEmpty()
  pacienteId: string;

  @ApiProperty({ description: 'Calorías totales objetivo de la pauta', example: 2000 })
  @IsNumber()
  @IsNotEmpty()
  caloriasTotales: number;

  @ApiProperty({ description: 'Peso de referencia utilizado para el cálculo (kg)', example: 70 })
  @IsNumber()
  @IsNotEmpty()
  pesoReferencia: number;

  @ApiProperty({ description: 'Distribución estructurada de los macronutrientes' })
  @IsObject()
  @ValidateNested()
  @Type(() => MacrosDistribucionDto)
  @IsNotEmpty()
  macros: MacrosDistribucionDto;
}