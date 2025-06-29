// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy'; // <--- 1. IMPORTA LA ESTRATEGIA

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // <--- 2. AÑADE LA ESTRATEGIA A LOS PROVIDERS
  ],
})
export class AuthModule {}