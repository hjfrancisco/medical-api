import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';
import { StudiesModule } from './studies/studies.module';
import { StudyTypesModule } from './study-types/study-types.module';
import { DoctorsModule } from './doctors/doctors.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true, // Hace que el ConfigService esté disponible en toda la app
    }),
    AuthModule, 
    PatientsModule, 
    PrismaModule, StorageModule, StudiesModule, StudyTypesModule, DoctorsModule, DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
