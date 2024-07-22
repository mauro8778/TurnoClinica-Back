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
exports.enviarCorreoAppoiment = exports.cancelarAppoimentServices = exports.createAppoiment = exports.getAppoimentServicesID = exports.getAppoimentServices = void 0;
const data_source_1 = require("../config/data-source");
const nodemailer_1 = __importDefault(require("nodemailer"));
const appoiment = [];
let turnid = 1;
const getAppoimentServices = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield data_source_1.appoimentModel.find({
        relations: {
            user: true
        }
    });
    return users;
});
exports.getAppoimentServices = getAppoimentServices;
const getAppoimentServicesID = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield data_source_1.appoimentModel.findOne({
        where: { id },
        relations: ['user']
    });
    if (!user) {
        throw new Error('El turno no fue encontrado');
    }
    return user;
});
exports.getAppoimentServicesID = getAppoimentServicesID;
const createAppoiment = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const newappoiment = yield data_source_1.appoimentModel.create(params);
    const result = yield data_source_1.appoimentModel.save(newappoiment);
    const user = yield data_source_1.userModel.findOneBy({
        id: params.userId
    });
    if (user) {
        newappoiment.user = user;
        yield data_source_1.appoimentModel.save(newappoiment);
        yield (0, exports.enviarCorreoAppoiment)(newappoiment, user);
    }
    return newappoiment;
});
exports.createAppoiment = createAppoiment;
const cancelarAppoimentServices = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const appoiment = yield data_source_1.appoimentModel.findOneBy({ id });
    if (!appoiment) {
        throw new Error('El turno no existe');
    }
    appoiment.status = 'cancelado';
    yield data_source_1.appoimentModel.save(appoiment);
    return appoiment;
});
exports.cancelarAppoimentServices = cancelarAppoimentServices;
const enviarCorreoAppoiment = (appoiment, user) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'clinicaosorio77@gmail.com',
                pass: 'nqfj xiym bzaq xpdo'
            }
        });
        const mailOptions = {
            from: 'CLINICA OSORIO',
            to: user.email,
            subject: 'Confirmación de Turno en Clínica Osorio',
            text: `¡Bienvenido a Clínica Osorio, ${user.name}!\n\nTu turno ha sido confirmado con los siguientes detalles:\nFecha: ${appoiment.date}\nHora: ${appoiment.time}\nEspecialidad: ${appoiment.description}\n\n¡Gracias por elegirnos! Esperamos brindarte el mejor servicio.`
        };
        yield transporter.sendMail(mailOptions);
        console.log('Correo electrónico de confirmación de turno enviado');
    }
    catch (error) {
        console.error("Error al enviar correo electrónico de confirmación de turno:", error);
        throw error;
    }
});
exports.enviarCorreoAppoiment = enviarCorreoAppoiment;
