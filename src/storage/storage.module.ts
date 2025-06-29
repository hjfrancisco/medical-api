// src/storage/storage.module.ts
import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageService],
  exports: [StorageService], // <-- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ
})
export class StorageModule {}