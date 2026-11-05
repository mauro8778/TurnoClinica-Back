"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarCorreoAppoiment = exports.cancelarAppoimentServices = exports.createAppoiment = exports.getAppoimentServicesID = exports.getAppoimentServices = void 0;
const data_source_1 = require("../config/data-source");
const nodemailer_1 = __importDefault(require("nodemailer"));
const appoiment = [];
let turnid = 1;
const getAppoimentServices = async () => {
    const users = await data_source_1.appoimentModel.find({
        relations: {
            user: true
        }
    });
    return users;
};
exports.getAppoimentServices = getAppoimentServices;
const getAppoimentServicesID = async (id) => {
    const user = await data_source_1.appoimentModel.findOne({
        where: { id },
        relations: ['user']
    });
    if (!user) {
        throw new Error('El turno no fue encontrado');
    }
    return user;
};
exports.getAppoimentServicesID = getAppoimentServicesID;
const createAppoiment = async (params) => {
    const newappoiment = await data_source_1.appoimentModel.create(params);
    const result = await data_source_1.appoimentModel.save(newappoiment);
    const user = await data_source_1.userModel.findOneBy({
        id: params.userId
    });
    if (user) {
        newappoiment.user = user;
        await data_source_1.appoimentModel.save(newappoiment);
        await (0, exports.enviarCorreoAppoiment)(newappoiment, user);
    }
    return newappoiment;
};
exports.createAppoiment = createAppoiment;
const cancelarAppoimentServices = async (id) => {
    const appoiment = await data_source_1.appoimentModel.findOneBy({ id });
    if (!appoiment) {
        throw new Error('El turno no existe');
    }
    appoiment.status = 'cancelado';
    await data_source_1.appoimentModel.save(appoiment);
    return appoiment;
};
exports.cancelarAppoimentServices = cancelarAppoimentServices;
const enviarCorreoAppoiment = async (appoiment, user) => {
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
        await transporter.sendMail(mailOptions);
        console.log('Correo electrónico de confirmación de turno enviado');
    }
    catch (error) {
        console.error("Error al enviar correo electrónico de confirmación de turno:", error);
        throw error;
    }
};
exports.enviarCorreoAppoiment = enviarCorreoAppoiment;
