// src/auth/strategy/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config'; 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // 'jwt' es un nombre clave para esta estrategia
  constructor(
  private prisma: PrismaService,
  private config: ConfigService,
) {
  // Obtenemos el secreto ANTES de llamar a super()
  const secret = config.get('JWT_SECRET');

  // Si el secreto no está definido en el archivo .env, detenemos la aplicación al iniciar.
  // Esto previene errores inesperados en producción.
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en el archivo .env');
  }

  // Ahora que TypeScript sabe que 'secret' es un string, lo pasamos a super()
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
  });
}

  // Este método se ejecuta DESPUÉS de que el token se ha verificado como válido.
  // Recibe el "payload" que pusimos dentro del token al momento de crearlo.
  async validate(payload: { sub: number; role: string }) {
    // Buscamos al usuario en la base de datos para asegurarnos de que todavía existe.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Token inválido, el usuario no existe.');
    }

    // Lo que sea que devuelva esta función, NestJS lo adjuntará al objeto `request` como `request.user`.
    // Así, en nuestros controladores, podremos acceder a los datos del usuario logueado.
    const { password, ...result } = user;
    return result;
  }
}