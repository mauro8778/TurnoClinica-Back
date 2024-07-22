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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loguinUserServices = exports.createUserServices = exports.getUserServicesID = exports.getUserServices = void 0;
const data_source_1 = require("../config/data-source");
const credentialServices_1 = require("./credentialServices");
const nodemailer_1 = __importDefault(require("nodemailer"));
const users = [];
let userID = 1;
const getUserServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield data_source_1.userModel.find({
        relations: {
            appoiments: true,
            credential: true
        }
    });
    return users;
});
exports.getUserServices = getUserServices;
const getUserServicesID = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield data_source_1.userModel.findOne({
        where: { id },
        relations: ['credential', 'appoiments']
    });
    if (!user) {
        throw new Error(`No existen usuarios con el ID ${id}`);
    }
    return user;
});
exports.getUserServicesID = getUserServicesID;
const createUserServices = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!params.username || !params.password || !params.email || !params.birthdate || !params.nDni) {
            throw new Error('Los datos proporcionados son incorrectos');
        }
        const newCredential = yield (0, credentialServices_1.createCredentialServices)({
            username: params.username,
            password: params.password,
        });
        const user = yield data_source_1.userModel.create(params);
        user.credential = newCredential;
        yield data_source_1.userModel.save(user);
        yield enviarCorreoBienvenida(user);
        return user;
    }
    catch (error) {
        console.error("Error al crear usuario:", error);
        throw error;
    }
});
exports.createUserServices = createUserServices;
const loguinUserServices = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = params;
    const credential = yield data_source_1.credentialModel.findOne({ where: { username } });
    if (!credential) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 400;
        throw error;
    }
    if (credential.password !== password) {
        const error = new Error('Contraseña incorrecta');
        error.statusCode = 401;
        throw error;
    }
    const user = yield data_source_1.userModel.findOne({ where: { id: credential.id }, relations: ['credential'] });
    if (!user) {
        const error = new Error('Error al encontrar el usuario');
        error.statusCode = 500;
        throw error;
    }
    return user;
});
exports.loguinUserServices = loguinUserServices;
function enviarCorreoBienvenida(newUser) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: 'clinicaosorio77@gmail.com',
                    pass: 'nqfj xiym bzaq xpdo'
                }
            });
            const mailOptions = {
                from: 'CLINICA OSORIO ',
                to: newUser.email,
                subject: 'Bienvenido a Clínica Osorio',
                text: `¡Bienvenido a Clínica Osorio, ${newUser.name}!\n\nTus credenciales de inicio de sesión son:\nUsuario: ${newUser.credential.username}\nContraseña: ${newUser.credential.password}\n\n¡Gracias por registrarte con nosotros! Esperamos brindarte el mejor servicio.`
            };
            const info = yield transporter.sendMail(mailOptions);
            return { statusCode: 201, message: 'Correo electrónico enviado con éxito' };
        }
        catch (error) {
            console.error("Error al enviar correo electrónico de bienvenida:", error);
            throw error;
        }
    });
}
;
