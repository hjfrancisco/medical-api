// src/patients/patients.service.ts
import { Prisma, Role} from '@prisma/client';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// Necesitaremos un DTO para crear pacientes, lo crearemos en el siguiente paso.
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PatientsService {

  constructor(private prisma: PrismaService) {}

  // --- CREAR UN NUEVO PACIENTE ---

  async create(dto: CreatePatientDto) {
    // --- Verificación de DNI y email duplicado (esta parte se queda igual) ---
    const existingPatientByIdNumber = await this.prisma.patient.findUnique({
      where: { idNumber: dto.idNumber },
    });
    if (existingPatientByIdNumber) {
      throw new ConflictException(`El DNI ${dto.idNumber} ya se encuentra registrado.`);
    }
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email: dto.email }
    })
    if (existingUserByEmail) {
      throw new ConflictException(`El email ${dto.email} ya está en uso.`)
    }

    // --- Lógica de creación de contraseña (se queda igual) ---
    const hashedPassword = await bcrypt.hash(dto.idNumber, 10);

    // La transacción se queda igual, pero el objeto 'data' dentro de 'patient.create' cambia
    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: 'PATIENT',
        },
      });

      const patient = await prisma.patient.create({
        data: {
          // Campos obligatorios que ya teníamos
          firstName: dto.firstName,
          lastName: dto.lastName,
          idNumber: dto.idNumber,
          userId: user.id,

          // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! AÑADIMOS LOS CAMPOS OPCIONALES ---
          address: dto.address,
          phone: dto.phone,
          // Convertimos el string de fecha a objeto Date si es que existe
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        },
      });

      return patient;
    });
  }

  // --- LISTAR PACIENTES ---

  async findAll(user: { id: number; role: Role }, searchTerm?: string) {
    // 1. Definimos el filtro de búsqueda sin el 'mode: insensitive'
    const searchFilter = searchTerm
      ? {
          OR: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
            { idNumber: { contains: searchTerm } },
          ],
        }
      : {};

    // Para el ADMIN, la consulta ahora usa el searchFilter simplificado
    if (user.role === Role.ADMIN) {
      return this.prisma.patient.findMany({
        where: searchFilter, // Usamos el filtro simplificado
        include: { user: { select: { email: true } } },
        orderBy: { lastName: 'asc' },
      });
    }

    // Para el DOCTOR, también usamos el searchFilter simplificado
    if (user.role === Role.DOCTOR) {
      const doctorProfile = await this.prisma.doctor.findUnique({
        where: { userId: user.id },
      });

      if (!doctorProfile) {
        return [];
      }

      const patients = await this.prisma.patient.findMany({
        where: {
          ...searchFilter, // Usamos el filtro simplificado
          studies: {
            some: {
              requestingDoctorId: doctorProfile.id,
            },
          },
        },
        include: { user: { select: { email: true } } },
        orderBy: { lastName: 'asc' },
      });

      return patients;
    }

    return [];
  }

  // --- findOne ---

  async findOne(id: number) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Paciente con ID #${id} no encontrado.`);
    }

    return patient;
  }

  // --- UPDATE ---

  async update(id: number, dto: UpdatePatientDto) {
    // La verificación de DNI duplicado se queda igual
    if (dto.idNumber) {
      const existingPatient = await this.prisma.patient.findUnique({
        where: { idNumber: dto.idNumber },
      });
      if (existingPatient && existingPatient.id !== id) {
        throw new ConflictException(`El DNI ${dto.idNumber} ya pertenece a otro paciente.`);
      }
    }

    // --- LÓGICA DE ACTUALIZACIÓN MEJORADA Y EXPLÍCITA ---

    // 1. Primero, manejamos la actualización del email por separado, si es que viene.
    if (dto.email) {
      const patient = await this.prisma.patient.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!patient) {
        throw new NotFoundException(`Paciente con ID #${id} no encontrado.`);
      }
      await this.prisma.user.update({
        where: { id: patient.userId },
        data: { email: dto.email },
      });
    }

    // 2. Construimos el objeto de datos para la tabla Patient pieza por pieza.
    const patientDataToUpdate: Prisma.PatientUpdateInput = {};

    // Solo añadimos los campos al objeto si tienen un valor en el DTO.
    if (dto.firstName) patientDataToUpdate.firstName = dto.firstName;
    if (dto.lastName) patientDataToUpdate.lastName = dto.lastName;
    if (dto.idNumber) patientDataToUpdate.idNumber = dto.idNumber;
    if (dto.address || dto.address === null) patientDataToUpdate.address = dto.address;
    if (dto.phone || dto.phone === null) patientDataToUpdate.phone = dto.phone;

    // 3. Manejo especial y explícito para la fecha.
    if (dto.dateOfBirth) {
      // Si se recibe una fecha (como string), se convierte a objeto Date.
      patientDataToUpdate.dateOfBirth = new Date(dto.dateOfBirth);
    } else if (dto.dateOfBirth === null || dto.dateOfBirth === '') {
      // Si se recibe un string vacío o null, se borra la fecha en la DB.
      patientDataToUpdate.dateOfBirth = null;
    }

    // 4. Finalmente, actualizamos el paciente solo con los datos que hemos preparado.
    return this.prisma.patient.update({
      where: { id: id },
      data: patientDataToUpdate,
    });
  }

}