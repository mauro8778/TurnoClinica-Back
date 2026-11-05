import "reflect-metadata";
import { DataSource } from "typeorm";
import { envs } from "./envs";
import { User, Credential, Doctor, Specialty, Appointment, TriageAssessment } from "../entities";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: envs.DB_HOST,
  port: envs.DB_PORT,
  username: envs.DB_USERNAME,
  password: envs.DB_PASSWORD,
  database: envs.DB_DATABASE,
  dropSchema: false, // ¡Protección crítica contra borrado accidental de datos!
  synchronize: envs.NODE_ENV === "development",
  logging: envs.NODE_ENV === "development" ? ["error", "warn"] : false,
  entities: [User, Credential, Doctor, Specialty, Appointment, TriageAssessment],
  subscribers: [],
  migrations: [],
  extra: {
    // Connection Pool optimizado para alta concurrencia (~1M peticiones/día)
    max: 25,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  },
});

export const userModel = AppDataSource.getRepository(User);
export const credentialModel = AppDataSource.getRepository(Credential);
export const appointmentModel = AppDataSource.getRepository(Appointment);
export const doctorModel = AppDataSource.getRepository(Doctor);
export const specialtyModel = AppDataSource.getRepository(Specialty);
export const triageModel = AppDataSource.getRepository(TriageAssessment);

// Alias de retrocompatibilidad
export const appoimentModel = appointmentModel;
