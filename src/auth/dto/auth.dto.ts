// src/auth/dto/auth.dto.ts

import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client'; // Importamos el Enum del schema de Prisma

export class AuthDto {
  @IsEmail() // Valida que el campo sea un email válido.
  @IsNotEmpty() // Valida que el campo no esté vacío.
  email: string;

  @IsString() // Valida que sea un string.
  @IsNotEmpty()
  @MinLength(8) // Valida que la contraseña tenga al menos 8 caracteres.
  password: string;

  @IsEnum(Role) // Valida que el rol sea uno de los valores definidos en nuestro Enum (PATIENT o ADMIN).
  @IsOptional() // Hace que este campo sea opcional (útil para el login, donde no se envía el rol).
  role?: Role;
}