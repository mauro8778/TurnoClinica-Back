import "reflect-metadata";
import server from "./server";
import { PORT } from "./config/envs";
import { AppDataSource, doctorModel, specialtyModel } from "./config/data-source";
import { getRedisClient } from "./config/redis";
import { startEmailWorker } from "./queues/email.worker";

async function bootstrap() {
  try {
    // 1. Inicializar Base de Datos Relacional PostgreSQL
    await AppDataSource.initialize();
    console.log("🐘 Conexión a PostgreSQL establecida con éxito.");

    // Sembrar especialidades y médicos iniciales si la base está vacía
    await seedInitialData();

    // 2. Inicializar Conexión a Redis
    await getRedisClient();

    // 3. Iniciar Worker de Colas de Tareas en Segundo Plano (BullMQ)
    startEmailWorker();

    // 4. Iniciar Servidor HTTP
    const appServer = server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 TurnoClínica Enterprise API lista en puerto: ${PORT}`);
      console.log(`📑 Swagger API Docs: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Healthcheck: http://localhost:${PORT}/health`);
      console.log(`🤖 Módulo de Triaje IA: http://localhost:${PORT}/triage/assess`);
      console.log(`====================================================`);
    });

    // 5. Cierre Grácil (Graceful Shutdown)
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Recibida señal ${signal}. Cerrando conexiones grácilmente...`);
      appServer.close(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
          console.log("🐘 Conexión PostgreSQL cerrada.");
        }
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("💥 Error fatal durante el arranque de la aplicación:", error);
    process.exit(1);
  }
}

async function seedInitialData() {
  try {
    const count = await specialtyModel.count();
    if (count === 0) {
      console.log("🌱 Sembrando especialidades y médicos de muestra...");
      const specialties = [
        { name: "Clínica Médica", description: "Atención médica integral y diagnóstico general" },
        { name: "Cardiología", description: "Diagnóstico y tratamiento de afecciones cardíacas" },
        { name: "Traumatología", description: "Tratamiento de lesiones óseas y articulares" },
        { name: "Pediatría", description: "Atención médica integral para niños y adolescentes" },
        { name: "Dermatología", description: "Cuidado y diagnóstico de la piel" },
        { name: "Guardia Médica", description: "Atención de urgencias y emergencias 24 hs" },
      ];

      for (const specData of specialties) {
        const spec = specialtyModel.create(specData);
        await specialtyModel.save(spec);
      }

      // Crear médicos de muestra
      const clinica = await specialtyModel.findOne({ where: { name: "Clínica Médica" } });
      const cardio = await specialtyModel.findOne({ where: { name: "Cardiología" } });
      const trauma = await specialtyModel.findOne({ where: { name: "Traumatología" } });

      if (clinica) {
        await doctorModel.save(
          doctorModel.create({
            name: "Dr. Carlos Osorio",
            licenseNumber: "MN-45892",
            email: "carlos.osorio@clinicaosorio.com",
            specialty: clinica,
          })
        );
      }

      if (cardio) {
        await doctorModel.save(
          doctorModel.create({
            name: "Dra. Mariana López",
            licenseNumber: "MN-51204",
            email: "mariana.lopez@clinicaosorio.com",
            specialty: cardio,
          })
        );
      }

      if (trauma) {
        await doctorModel.save(
          doctorModel.create({
            name: "Dr. Roberto Gómez",
            licenseNumber: "MN-38910",
            email: "roberto.gomez@clinicaosorio.com",
            specialty: trauma,
          })
        );
      }
      console.log("✅ Datos iniciales sembrados con éxito.");
    }
  } catch (err: any) {
    console.warn("Aviso en el sembrado de datos iniciales:", err.message);
  }
}

bootstrap();
