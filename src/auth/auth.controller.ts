// src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './guard/jwt.guard';

// El decorador `@Controller('auth')` establece el prefijo de la URL para todos los endpoints de este archivo.
// Todas las rutas aquí empezarán con `/auth`.
@Controller('auth')
export class AuthController {
  // Inyectamos el AuthService para poder usar sus métodos.
  constructor(private authService: AuthService) {}

  // --- ENDPOINT DE REGISTRO ---
  // `@Post('register')` mapea las peticiones POST a la URL `/auth/register`.
  @Post('register')
  signUp(@Body() dto: AuthDto) {
    // 1. El decorador `@Body()` extrae todo el cuerpo (body) de la petición HTTP.
    // 2. NestJS (gracias al `ValidationPipe` que se configura globalmente) valida automáticamente
    //    que el cuerpo de la petición cumpla con las reglas definidas en nuestro `AuthDto`.
    //    Si falta un campo o es del tipo incorrecto, NestJS devolverá un error 400 Bad Request automáticamente.
    // 3. Si la validación pasa, simplemente llamamos al método `signUp` del servicio,
    //    pasándole el DTO con los datos.
    // 4. Devolvemos lo que sea que el servicio nos devuelva. El controlador no sabe ni le importa la lógica interna.
    return this.authService.signUp(dto);
  }

  // --- ENDPOINT DE INICIO DE SESIÓN ---
  // `@Post('login')` mapea las peticiones POST a la URL `/auth/login`.
  // Por defecto, un POST devuelve el código de estado HTTP 201 Created.
  // Para un login, el código correcto es 200 OK. `@HttpCode(HttpStatus.OK)` se encarga de eso.
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() dto: AuthDto) {
    // El flujo es idéntico al de registro:
    // 1. `@Body()` extrae y valida los datos del cuerpo de la petición contra el `AuthDto`.
    // 2. Llamamos al método `signIn` del servicio.
    // 3. Devolvemos la respuesta del servicio (que será el `access_token`).
    return this.authService.signIn(dto);
  }

  @UseGuards(JwtAuthGuard)
  //@Get('me')
  //getProfile(@Request() req) {
    // Devolvemos el perfil del usuario sin la contraseña
    //const { password, ...user } = req.user;
    //return user;
  //}
  @Get('me')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    return this.authService.changePassword(userId, changePasswordDto);
  }

}