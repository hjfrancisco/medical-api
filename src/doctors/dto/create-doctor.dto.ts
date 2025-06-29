// src/doctors/dto/create-doctor.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class CreateDoctorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}