// src/study-types/dto/update-study-type.dto.ts
import { IsOptional, IsString } from 'class-validator';
export class UpdateStudyTypeDto {
  @IsString()
  @IsOptional()
  name?: string;
}