const { PrismaClient } = require('@prisma/client');

// Creamos una nueva instancia del cliente de Prisma
const prisma = new PrismaClient({
  // Habilitamos el log para ver qué hace Prisma por debajo
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Iniciando prueba de conexión a la base de datos...');
  try {
    // El comando $connect() intenta establecer una conexión con la base de datos.
    // Usará la DATABASE_URL de tu archivo .env automáticamente.
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos.');

    // Opcional: Haz una consulta simple para una prueba completa
    // const userCount = await prisma.user.count(); // Cambia 'user' por el nombre de uno de tus modelos
    // console.log(`✅ Encontrados ${userCount} usuarios.`);

  } catch (error) {
    console.error('❌ Error al intentar conectar a la base de datos:');
    console.error(error);
    process.exit(1); // Salimos del script con un código de error
  } finally {
    // Nos aseguramos de cerrar la conexión
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada.');
  }
}

main();