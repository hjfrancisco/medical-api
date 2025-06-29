import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Usamos Promise.all para ejecutar todas las consultas en paralelo y ser más eficientes
    const [patientCount, totalStudies, pendingStudies, recentStudies] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.study.count(),
      this.prisma.study.count({ where: { status: 'INCOMPLETO' } }),
      this.prisma.study.findMany({
        take: 5, // Traemos solo los últimos 5
        orderBy: { createdAt: 'desc' },
        include: { // Incluimos los datos relacionados para mostrarlos en la tabla
          patient: {
            select: { firstName: true, lastName: true }
          },
          studyType: {
            select: { name: true }
          }
        }
      })
    ]);

    // Devolvemos un solo objeto con todas las estadísticas
    return {
      patientCount,
      totalStudies,
      pendingStudies,
      recentStudies,
    };
  }
}