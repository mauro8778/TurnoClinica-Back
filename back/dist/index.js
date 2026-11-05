"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const server_1 = __importDefault(require("./server"));
const envs_1 = require("./config/envs");
const data_source_1 = require("./config/data-source");
const redis_1 = require("./config/redis");
const email_worker_1 = require("./queues/email.worker");
async function bootstrap() {
    try {
        // 1. Inicializar Base de Datos Relacional PostgreSQL
        await data_source_1.AppDataSource.initialize();
        console.log("🐘 Conexión a PostgreSQL establecida con éxito.");
        // Sembrar especialidades y médicos iniciales si la base está vacía
        await seedInitialData();
        // 2. Inicializar Conexión a Redis
        await (0, redis_1.getRedisClient)();
        // 3. Iniciar Worker de Colas de Tareas en Segundo Plano (BullMQ)
        (0, email_worker_1.startEmailWorker)();
        // 4. Iniciar Servidor HTTP
        const appServer = server_1.default.listen(envs_1.PORT, () => {
            console.log(`====================================================`);
            console.log(`🚀 TurnoClínica Enterprise API lista en puerto: ${envs_1.PORT}`);
            console.log(`📑 Swagger API Docs: http://localhost:${envs_1.PORT}/api-docs`);
            console.log(`🏥 Healthcheck: http://localhost:${envs_1.PORT}/health`);
            console.log(`🤖 Módulo de Triaje IA: http://localhost:${envs_1.PORT}/triage/assess`);
            console.log(`====================================================`);
        });
        // 5. Cierre Grácil (Graceful Shutdown)
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Recibida señal ${signal}. Cerrando conexiones grácilmente...`);
            appServer.close(async () => {
                if (data_source_1.AppDataSource.isInitialized) {
                    await data_source_1.AppDataSource.destroy();
                    console.log("🐘 Conexión PostgreSQL cerrada.");
                }
                process.exit(0);
            });
        };
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    }
    catch (error) {
        console.error("💥 Error fatal durante el arranque de la aplicación:", error);
        process.exit(1);
    }
}
async function seedInitialData() {
    try {
        const count = await data_source_1.specialtyModel.count();
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
                const spec = data_source_1.specialtyModel.create(specData);
                await data_source_1.specialtyModel.save(spec);
            }
            // Crear médicos de muestra
            const clinica = await data_source_1.specialtyModel.findOne({ where: { name: "Clínica Médica" } });
            const cardio = await data_source_1.specialtyModel.findOne({ where: { name: "Cardiología" } });
            const trauma = await data_source_1.specialtyModel.findOne({ where: { name: "Traumatología" } });
            if (clinica) {
                await data_source_1.doctorModel.save(data_source_1.doctorModel.create({
                    name: "Dr. Carlos Osorio",
                    licenseNumber: "MN-45892",
                    email: "carlos.osorio@clinicaosorio.com",
                    specialty: clinica,
                }));
            }
            if (cardio) {
                await data_source_1.doctorModel.save(data_source_1.doctorModel.create({
                    name: "Dra. Mariana López",
                    licenseNumber: "MN-51204",
                    email: "mariana.lopez@clinicaosorio.com",
                    specialty: cardio,
                }));
            }
            if (trauma) {
                await data_source_1.doctorModel.save(data_source_1.doctorModel.create({
                    name: "Dr. Roberto Gómez",
                    licenseNumber: "MN-38910",
                    email: "roberto.gomez@clinicaosorio.com",
                    specialty: trauma,
                }));
            }
            console.log("✅ Datos iniciales sembrados con éxito.");
        }
    }
    catch (err) {
        console.warn("Aviso en el sembrado de datos iniciales:", err.message);
    }
}
bootstrap();
