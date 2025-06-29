// src/patients/dto/create-patient.dto.ts - VERSIÓN SIMPLIFICADA
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  // Nuevos campos opcionales
  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  phone?: string;

}