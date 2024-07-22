import { AppDataSource } from "../config/data-source";
import credentialDtos from "../dtos/credentialDtos";
import { credential } from "../entities/credential";

export const createCredentialServices = async (credentialData: credentialDtos): Promise<credential> => {
    try {
        const newCredential = AppDataSource.manager.create(credential, credentialData);
        const savedCredential = await AppDataSource.manager.save(newCredential);
        return savedCredential;
    } catch (error) {
        console.error("Error al crear la credencial:", error);
        throw error;
    }
};
export const checkCredentialServices = async (credentialData: credentialDtos): Promise<number> => {
    try {
        const foundCredential = await AppDataSource.manager.findOne(credential, {
            where: {
                username: credentialData.username,
                password: credentialData.password
            }
        });

        if (foundCredential) {
            return foundCredential.id;
        } else {
            throw new Error("Credencial incorrecta");
        }
    } catch (error) {
        console.error("Error al verificar la credencial:", error);
        throw error;
    }
};