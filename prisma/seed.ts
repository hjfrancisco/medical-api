// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Iniciando siembra de datos...`);

  // --- Hashear contraseñas por defecto ---
  const saltRounds = 10;
  const defaultPasswordPatient = await bcrypt.hash('32201201', saltRounds);
  const defaultPasswordDoctor = await bcrypt.hash('Welcome123', saltRounds);
  const defaultPasswordAdmin = await bcrypt.hash('admin123', saltRounds);

  // --- Crear un Administrador con su Perfil ---
  await prisma.user.create({
    data: {
      email: 'admin@clinica.com',
      password: defaultPasswordAdmin,
      role: Role.ADMIN,
      adminProfile: {
        create: {
          name: 'Admin Principal',
        },
      },
    },
  });

  // --- Crear un Paciente con su Perfil ---
  await prisma.user.create({
    data: {
      email: 'paciente.test@email.com',
      password: defaultPasswordPatient,
      role: Role.PATIENT,
      patientProfile: {
        create: {
          firstName: 'Carlos',
          lastName: 'Santana',
          idNumber: '32201201',
          address: 'Av. Siempre Viva 123',
          phone: '3814567890',
          dateOfBirth: new Date('1986-05-20T03:00:00.000Z'),
        },
      },
    },
  });

  // --- Crear un Médico con su Perfil ---
  await prisma.user.create({
    data: {
        email: 'doctor.test@email.com',
        password: defaultPasswordDoctor,
        role: Role.DOCTOR,
        doctorProfile: {
            create: {
                name: 'Dr. Gregory House',
            }
        }
    }
  });

  // --- Crear Tipos de Estudio ---
  await prisma.studyType.createMany({
    data: [
      { name: 'Fondo de Ojo' },
      { name: 'Tonometría Ocular' },
      { name: 'Campo Visual Computarizado' },
    ],
    skipDuplicates: true, // No falla si ya existen
  });

  console.log(`Siembra de datos finalizada.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });