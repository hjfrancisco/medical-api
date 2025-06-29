// src/auth/guard/jwt.guard.ts
import { AuthGuard } from '@nestjs/passport';

// Esta clase simplemente usa la estrategia 'jwt' que creamos antes.
export class JwtAuthGuard extends AuthGuard('jwt') {}