import { Module } from '@nestjs/common';
import { StudyTypesService } from './study-types.service';
import { StudyTypesController } from './study-types.controller';

@Module({
  providers: [StudyTypesService],
  controllers: [StudyTypesController]
})
export class StudyTypesModule {}
