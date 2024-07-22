import { appoimentModel, userModel } from "../config/data-source";
import appoimentDtos from "../dtos/appoimentDtos";
import { appoiments } from "../entities/appoiments";
import { user } from "../entities/user";
import iAppoiment from "../interface/iAppoiment";
import nodemailer from 'nodemailer';

const appoiment: appoiments[] = [];
let turnid: number = 1;

export const getAppoimentServices = async (): Promise<appoiments[]> => {
    const users = await appoimentModel.find({
        relations: {
            user: true
        }
    });
    return users;
}

export const getAppoimentServicesID = async (id: number): Promise<appoiments | null> => {
    const user = await appoimentModel.findOne({
        where: { id },
        relations: ['user']
    });
    if (!user) {
        throw new Error('El turno no fue encontrado');
    }
    return user;
}

export const createAppoiment = async (params: appoimentDtos): Promise<appoiments> => {
    const newappoiment = await appoimentModel.create(params);
    const result = await appoimentModel.save(newappoiment);

    const user = await userModel.findOneBy({
        id: params.userId
    });

    if (user) {
        newappoiment.user = user;
        await appoimentModel.save(newappoiment);


        await enviarCorreoAppoiment(newappoiment, user);
    }

    return newappoiment;
}

export const cancelarAppoimentServices = async (id: number): Promise<appoiments | null> => {
    const appoiment = await appoimentModel.findOneBy({ id });

    if (!appoiment) {
        throw new Error('El turno no existe');
    }

    appoiment.status = 'cancelado';
    await appoimentModel.save(appoiment);


    return appoiment;
}

export const enviarCorreoAppoiment = async (appoiment: appoiments, user: user): Promise<void> => {
    try {
        const transporter = nodemailer.createTransport({
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
    } catch (error) {
        console.error("Error al enviar correo electrónico de confirmación de turno:", error);
        throw error;
    }
};

