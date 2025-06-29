// src/doctors/dto/update-doctor.dto.ts
import { IsEmail, IsOptional, IsString } from 'class-validator';
export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}