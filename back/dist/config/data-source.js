"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appoimentModel = exports.triageModel = exports.specialtyModel = exports.doctorModel = exports.appointmentModel = exports.credentialModel = exports.userModel = exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const envs_1 = require("./envs");
const entities_1 = require("../entities");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: envs_1.envs.DB_HOST,
    port: envs_1.envs.DB_PORT,
    username: envs_1.envs.DB_USERNAME,
    password: envs_1.envs.DB_PASSWORD,
    database: envs_1.envs.DB_DATABASE,
    dropSchema: false, // ¡Protección crítica contra borrado accidental de datos!
    synchronize: envs_1.envs.NODE_ENV === "development",
    logging: envs_1.envs.NODE_ENV === "development" ? ["error", "warn"] : false,
    entities: [entities_1.User, entities_1.Credential, entities_1.Doctor, entities_1.Specialty, entities_1.Appointment, entities_1.TriageAssessment],
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
exports.userModel = exports.AppDataSource.getRepository(entities_1.User);
exports.credentialModel = exports.AppDataSource.getRepository(entities_1.Credential);
exports.appointmentModel = exports.AppDataSource.getRepository(entities_1.Appointment);
exports.doctorModel = exports.AppDataSource.getRepository(entities_1.Doctor);
exports.specialtyModel = exports.AppDataSource.getRepository(entities_1.Specialty);
exports.triageModel = exports.AppDataSource.getRepository(entities_1.TriageAssessment);
// Alias de retrocompatibilidad
exports.appoimentModel = exports.appointmentModel;
