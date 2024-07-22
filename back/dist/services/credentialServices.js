"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCredentialServices = exports.createCredentialServices = void 0;
const data_source_1 = require("../config/data-source");
const credential_1 = require("../entities/credential");
const createCredentialServices = (credentialData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newCredential = data_source_1.AppDataSource.manager.create(credential_1.credential, credentialData);
        const savedCredential = yield data_source_1.AppDataSource.manager.save(newCredential);
        return savedCredential;
    }
    catch (error) {
        console.error("Error al crear la credencial:", error);
        throw error;
    }
});
exports.createCredentialServices = createCredentialServices;
const checkCredentialServices = (credentialData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const foundCredential = yield data_source_1.AppDataSource.manager.findOne(credential_1.credential, {
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
});
exports.checkCredentialServices = checkCredentialServices;
