// src/study-types/dto/create-study-type.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateStudyTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}