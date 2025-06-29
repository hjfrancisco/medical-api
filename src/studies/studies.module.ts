// src/studies/studies.module.ts
import { Module } from '@nestjs/common';
import { StudiesService } from './studies.service';
import { StudiesController } from './studies.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule], // <-- IMPORTA EL MÓDULO DE STORAGE
  controllers: [StudiesController],
  providers: [StudiesService],
})
export class StudiesModule {}