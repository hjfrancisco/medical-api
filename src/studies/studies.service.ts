// src/studies/studies.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class StudiesService {
  constructor(
    private storageService: StorageService,
    private prisma: PrismaService,
  ) {}

// En src/studies/studies.service.ts

async generateUploadUrl(body: {
  patientId: number;
  studyTypeId: number;
  requestingDoctorId: number;
  studyDate: Date;
  fileName: string;
  contentType: string;
}) {
  const fileKey = `patient-${body.patientId}/study-${randomUUID()}-${body.fileName}`;

  // Creamos el registro del estudio con TODA la información requerida por el schema
  const study = await this.prisma.study.create({
    data: {
      name: body.fileName,
      date: new Date(body.studyDate),
      patientId: body.patientId,

      // --- AQUÍ ESTÁN LOS CAMPOS QUE FALTABAN ---
      studyTypeId: body.studyTypeId,
      requestingDoctorId: body.requestingDoctorId,
      // -----------------------------------------

      files: {
        studyFileKey: fileKey,
      },
    },
  });

  const uploadUrl = await this.storageService.getPresignedUploadUrl(
    fileKey,
    body.contentType,
  );

  return { uploadUrl, studyId: study.id };
}

async generateReportUploadUrl(
  studyId: number,
  fileName: string,
  contentType: string,
) {
  // 1. Verificamos que el estudio exista
  const study = await this.prisma.study.findUnique({
    where: { id: studyId },
  });
  if (!study) {
    throw new NotFoundException('Estudio no encontrado.');
  }

  // 2. Generamos una nueva "llave" para el archivo del informe en S3
  const reportFileKey = `patient-${study.patientId}/report-${randomUUID()}-${fileName}`;

  // 3. Pedimos la URL de subida a nuestro StorageService
  const uploadUrl = await this.storageService.getPresignedUploadUrl(
    reportFileKey,
    contentType,
  );

  // 4. Actualizamos el registro del estudio en la base de datos
  await this.prisma.study.update({
    where: { id: studyId },
    data: {
      // Usamos la función de merge de Prisma para añadir una nueva clave al JSON existente
      files: {
        ...(study.files as Prisma.JsonObject),
        reportFileKey: reportFileKey,
      },
      // Cambiamos el estado para reflejar que el informe ya fue cargado
      status: 'COMPLETO',
      reportUploadedAt: new Date(),
    },
  });

  // 5. Devolvemos la URL para que el frontend pueda subir el archivo
  return { uploadUrl };
}

async getDownloadUrl(
  studyId: number,
  fileType: 'studyFileKey' | 'reportFileKey',
  disposition?: 'inline' | 'attachment', // <-- 1. ACEPTAMOS EL NUEVO PARÁMETRO OPCIONAL
) {
  const study = await this.prisma.study.findUnique({ where: { id: studyId } });
  if (!study || !study.files) {
    throw new NotFoundException('Estudio o archivos no encontrados');
  }

  const fileKey = (study.files as any)[fileType];
  if (!fileKey) {
    throw new NotFoundException(`El archivo de tipo '${fileType}' no existe para este estudio.`);
  }

  const originalFileName = study.name;

  // 2. PASAMOS EL PARÁMETRO 'disposition' A LA FUNCIÓN DEL STORAGE SERVICE
  const downloadUrl = await this.storageService.getPresignedDownloadUrl(
    fileKey,
    originalFileName,
    disposition,
  );

  return { downloadUrl };
}


  async findAllForPatient(patientId: number, doctorId?: number) {
    const whereCondition: Prisma.StudyWhereInput = {
      patientId: patientId,
    };

    // Si nos pasan un doctorId, añadimos esa condición al filtro
    if (doctorId) {
      whereCondition.requestingDoctorId = doctorId;
    }

    return this.prisma.study.findMany({
      where: whereCondition,
      // ¡AQUÍ ESTÁ LA CORRECCIÓN CLAVE!
      // Le decimos a Prisma que incluya los datos de las tablas relacionadas.
      include: {
        studyType: true,
        requestingDoctor: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }


async findMyStudies(userId: number) {
  const patientProfile = await this.prisma.patient.findUnique({
    where: { userId },
  });

  if (!patientProfile) {
    throw new NotFoundException('Perfil de paciente no encontrado para este usuario.');
  }

  return this.prisma.study.findMany({
    where: {
      patientId: patientProfile.id,
    },
    // ¡AQUÍ TAMBIÉN! Aplicamos el mismo 'include' para el portal del paciente.
    include: {
      studyType: true,
      requestingDoctor: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
}

}