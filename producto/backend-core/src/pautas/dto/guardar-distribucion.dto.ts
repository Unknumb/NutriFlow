import { IsString, IsObject, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class GuardarDistribucionDto {
  @IsString()
  @IsNotEmpty()
  paciente_id: string;

  @IsObject()
  distributions: Record<string, Record<string, number>>;

  @IsObject()
  targets: Record<string, number>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  activeMeals?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  activeGroups?: string[];
}
