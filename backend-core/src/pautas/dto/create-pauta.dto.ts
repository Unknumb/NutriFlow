import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsNotEmpty } from 'class-validator';

export class CreatePautaDto {
  @ApiProperty({ description: 'ID del paciente' })
  @IsString()
  @IsNotEmpty()
  paciente_id: string;

  @ApiProperty({ description: 'Calorías totales de la pauta' })
  @IsNumber()
  @IsNotEmpty()
  calorias_totales: number;

  @ApiProperty({ description: 'Distribución de macronutrientes' })
  @IsObject()
  @IsNotEmpty()
  distribucion_macros: Record<string, any>;

  @ApiProperty({ description: 'Tiempos de comida y porciones' })
  @IsObject()
  @IsNotEmpty()
  tiempos_comida: Record<string, any>;
}