"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCredentialServices = exports.createCredentialServices = void 0;
const data_source_1 = require("../config/data-source");
const credential_1 = require("../entities/credential");
const createCredentialServices = async (credentialData) => {
    try {
        const newCredential = data_source_1.AppDataSource.manager.create(credential_1.credential, credentialData);
        const savedCredential = await data_source_1.AppDataSource.manager.save(newCredential);
        return savedCredential;
    }
    catch (error) {
        console.error("Error al crear la credencial:", error);
        throw error;
    }
};
exports.createCredentialServices = createCredentialServices;
const checkCredentialServices = async (credentialData) => {
    try {
        const foundCredential = await data_source_1.AppDataSource.manager.findOne(credential_1.credential, {
            where: {
                username: credentialData.username,
                password: credentialData.password
            }
        });
        if (foundCredential) {
            return foundCredential.id;
        }
        else {
            throw new Error("Credencial incorrecta");
        }
    }
    catch (error) {
        console.error("Error al verificar la credencial:", error);
        throw error;
    }
};
exports.checkCredentialServices = checkCredentialServices;
