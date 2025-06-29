// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // ¡Importante! Hace que el módulo esté disponible en toda la app.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // ¡Importante! Exporta el servicio para que otros módulos puedan inyectarlo.
})
export class PrismaModule {}
