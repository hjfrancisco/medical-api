// src/doctors/doctors.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  private generateSimplePassword(): string {
    // Genera una contraseña más simple, ej: "Clave" + 4 números aleatorios
    const randomNumbers = Math.floor(1000 + Math.random() * 9000);
    return `Clave${randomNumbers}`;
  }


  /**
   * Crea un nuevo Doctor y su Usuario asociado en una sola transacción.
   */

  async create(createDoctorDto: CreateDoctorDto) {
    const { name, email } = createDoctorDto;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`El email ${email} ya está en uso.`);
    }

    // Punto 3: Usamos la nueva función para generar una clave más simple
    const tempPassword = this.generateSimplePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.DOCTOR,
        // El flag hasChangedPassword será 'false' por defecto
        doctorProfile: { create: { name } },
      },
      include: { doctorProfile: true },
    });

    // Devolvemos el perfil y la contraseña temporal para que el admin la vea
    return { ...newUser.doctorProfile, tempPassword };
  }

  // MÉTODO PARA RESETEAR CONTRASEÑA
  async resetPassword(doctorId: number) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Médico no encontrado');
    }

    const tempPassword = this.generateSimplePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Actualizamos la contraseña del usuario y lo forzamos a cambiarla de nuevo
    await this.prisma.user.update({
      where: { id: doctor.userId },
      data: {
        password: hashedPassword,
        hasChangedPassword: false,
      },
    });

    return { tempPassword };
  }

  /**
   * Busca y devuelve todos los doctores.
   */
  findAll() {
    return this.prisma.doctor.findMany({
      orderBy: { name: 'asc' },
      include: { user: { select: { email: true } } }
    });
  }

  /**
   * Actualiza los datos de un Doctor y/o su email de usuario asociado.
   */
  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    const { name, email } = updateDoctorDto;

    // Si se va a cambiar el email, lo actualizamos en la tabla User
    if (email) {
      const doctor = await this.prisma.doctor.findUnique({ where: { id } });
      if (!doctor) {
        throw new NotFoundException(`Doctor con ID #${id} no encontrado.`);
      }
      await this.prisma.user.update({
        where: { id: doctor.userId },
        data: { email },
      });
    }

    // Actualizamos el nombre en la tabla Doctor, solo si se proveyó.
    const dataToUpdate: Prisma.DoctorUpdateInput = {};
    if (name) {
      dataToUpdate.name = name;
    }

    return this.prisma.doctor.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  /**
   * Elimina un Doctor y su Usuario asociado.
   */
  async remove(id: number) {
    // En una transacción para asegurar que se borren ambos o ninguno.
    return this.prisma.$transaction(async (prisma) => {
      const doctor = await prisma.doctor.findUnique({ where: { id } });
      if (!doctor) {
        throw new NotFoundException(`Doctor con ID #${id} no encontrado.`);
      }

      // Primero borramos el perfil del doctor
      await prisma.doctor.delete({ where: { id: doctor.id } });
      // Luego, borramos el usuario asociado.
      await prisma.user.delete({ where: { id: doctor.userId } });

      return { message: `Doctor y usuario asociado eliminados correctamente.` };
    });
  }
}