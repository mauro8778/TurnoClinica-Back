// src/config/db-config.ts
import "dotenv/config";
import { DataSource } from "typeorm";
import { user } from "../entities/user";
import { credential } from "../entities/credential";
import { appoiments } from "../entities/appoiments";

export const AppDataSource = new DataSource({
  type: process.env.DB_TYPE as "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dropSchema: true,
  synchronize: true,
  logging: false,
  entities: [user, credential, appoiments],
  subscribers: [],
  migrations: [],
});

export const userModel = AppDataSource.getRepository(user);
export const appoimentModel = AppDataSource.getRepository(appoiments);
export const credentialModel = AppDataSource.getRepository(credential);
