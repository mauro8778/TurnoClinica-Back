"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentialModel = exports.appoimentModel = exports.userModel = exports.AppDataSource = void 0;
// src/config/db-config.ts
require("dotenv/config");
const typeorm_1 = require("typeorm");
const user_1 = require("../entities/user");
const credential_1 = require("../entities/credential");
const appoiments_1 = require("../entities/appoiments");
exports.AppDataSource = new typeorm_1.DataSource({
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    dropSchema: true,
    synchronize: true,
    logging: false,
    entities: [user_1.user, credential_1.credential, appoiments_1.appoiments],
    subscribers: [],
    migrations: [],
});
exports.userModel = exports.AppDataSource.getRepository(user_1.user);
exports.appoimentModel = exports.AppDataSource.getRepository(appoiments_1.appoiments);
exports.credentialModel = exports.AppDataSource.getRepository(credential_1.credential);
