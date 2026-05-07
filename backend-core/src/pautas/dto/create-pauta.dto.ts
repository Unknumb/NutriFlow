import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsNotEmpty, IsUUID } from 'class-validator';

export class PorcentajesMacrosDto {
  @ApiProperty({ example: 20 })
  @IsNumber()
  proteina: number;

  @ApiProperty({ example: 30 })
  @IsNumber()
  grasa: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  carbohidratos: number;
}

export class CreatePautaDto {
  @ApiProperty({ description: 'ID del paciente', example: 'uuid-del-paciente' })
  @IsUUID()
  @IsNotEmpty()
  paciente_id: string;

  @ApiProperty({ description: 'Calorías totales de la pauta objetivo', example: 2000 })
  @IsNumber()
  @IsNotEmpty()
  calorias_totales: number;

  @ApiProperty({ 
    description: 'Porcentajes para el cálculo de macronutrientes',
    example: { proteina: 20, grasa: 30, carbohidratos: 50 } 
  })
  @IsObject()
  @IsNotEmpty()
  porcentajes_macros: PorcentajesMacrosDto;

  @ApiProperty({ 
    description: 'Tiempos de comida y porciones distribuidas',
    example: { desayuno: { lacteos: 1, cereales: 2 } }
  })
  @IsObject()
  @IsNotEmpty()
  tiempos_comida: Record<string, any>;
}