// src/auth/auth.service.ts

import { Injectable, UnauthorizedException, ConflictException, NotFoundException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service'; // Asumiendo que tienes un servicio para Prisma
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto'; // Un DTO para validar los datos de entrada
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // --- REGISTRO (SIGNUP) ---
  async signUp(dto: AuthDto) {
    // 1. Hashear la contraseña: La parte más crítica de la seguridad.
    // Nunca, NUNCA, guardes una contraseña en texto plano.
    // `bcrypt.hash` es una función asíncrona que toma la contraseña y un "cost factor" o "salt rounds" (10 es un buen estándar).
    // A mayor número, más difícil de romper por fuerza bruta, pero más lento de calcular.
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      // 2. Guardar el nuevo usuario en la base de datos.
      // Usamos `this.prisma.user.create` para crear un nuevo registro en la tabla User.
      // Pasamos el email del DTO y, crucialmente, la `hashedPassword`, no la original.
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: dto.role || Role.PATIENT,
        },
      });

      // 3. Devolver el usuario creado (sin la contraseña).
      // Es una buena práctica no devolver el hash de la contraseña en la respuesta.
      const { password, ...result } = user;
      return result;

    } catch (error) {
      // 4. Manejar errores comunes, como un email duplicado.
      // Si Prisma intenta crear un usuario con un email que ya existe (definido como @unique en el schema), lanzará un error.
      // Lo capturamos y devolvemos un error HTTP 409 Conflict, que es más descriptivo para el cliente.
      if (error.code === 'P2002') { // Código de error de Prisma para violación de restricción única
        throw new ConflictException('El email ya está en uso');
      }
      throw error; // Si es otro tipo de error, lo relanzamos.
    }
  }

  // --- INICIO DE SESIÓN (SIGNIN) ---
  async signIn(dto: AuthDto) {
    // 1. Buscar al usuario por su email.
    // El email debe ser único, por lo que `findUnique` es perfecto para esto.
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // 2. Si el usuario no existe, lanzar un error.
    // Usamos `UnauthorizedException` (HTTP 401) para no dar pistas a posibles atacantes
    // sobre si el email existe o no. Es una práctica de seguridad estándar.
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Comparar la contraseña proporcionada con la guardada en la DB.
    // `bcrypt.compare` toma la contraseña que el usuario envió (dto.password) y el hash que tenemos en la base de datos (user.password).
    // Internamente, hashea la contraseña enviada y compara los hashes. Devuelve `true` o `false`.
    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    // 4. Si las contraseñas no coinciden, lanzar el mismo error.
    // De nuevo, no damos pistas. El error es el mismo que si el usuario no existiera.
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 5. Si todo es correcto, generar y devolver el JWT.
    return this.signToken(user.id, user.role);
  }

  // --- FUNCIÓN AUXILIAR PARA FIRMAR EL TOKEN ---
  async signToken(userId: number, role: string): Promise<{ access_token: string }> {
    // a. Definir el "payload" del token.
    // El payload son los datos que queremos guardar dentro del token.
    // `sub` (subject) es el estándar para el ID del usuario.
    // Incluir el `role` es VITAL para la autorización posterior.
    const payload = {
      sub: userId,
      role: role,
    };

    const secret = this.config.get('JWT_SECRET'); // USA ConfigService

    // c. Firmar el token usando el payload, el secreto y una fecha de expiración.
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    // d. Devolver el token en el formato esperado.
    return {
      access_token: token,
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  const passwordMatches = await bcrypt.compare(dto.oldPassword, user.password);
  if (!passwordMatches) {
    throw new UnauthorizedException('La contraseña actual es incorrecta.');
  }

  const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      hasChangedPassword: true, // Marcamos que ya la ha cambiado
    },
  });

  return { message: 'Contraseña actualizada correctamente.' };
}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      // Le pedimos que incluya los perfiles asociados
      include: {
        adminProfile: true,
        doctorProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...result } = user;
    return result;
  }

}