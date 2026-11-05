"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelarAppoiment = exports.agendarAppoiment = exports.getAppoimentid = exports.getAppoiment = void 0;
const appoimentServices_1 = require("../services/appoimentServices");
const getAppoiment = async (req, res) => {
    const users = await (0, appoimentServices_1.getAppoimentServices)();
    res.status(200).json(users);
};
exports.getAppoiment = getAppoiment;
const getAppoimentid = async (req, res) => {
    try {
        const { id } = req.params;
        const appoimentid = await (0, appoimentServices_1.getAppoimentServicesID)(Number(id));
        if (!appoimentid) {
            return res.status(404).json({ message: 'El turno no existe' });
        }
        res.status(200).json(appoimentid);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getAppoimentid = getAppoimentid;
const agendarAppoiment = async (req, res) => {
    try {
        const { date, time, status, description, userId } = req.body;
        if (!date || !time || !status || !description || !userId) {
            return res.status(400).json({ message: "Faltan datos para crear el turno" });
        }
        const newAppoiment = await (0, appoimentServices_1.createAppoiment)({ date, time, status, description, userId });
        return res.status(201).json(newAppoiment);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.agendarAppoiment = agendarAppoiment;
const cancelarAppoiment = async (req, res) => {
    try {
        const { id } = req.params;
        const canceledAppointment = await (0, appoimentServices_1.cancelarAppoimentServices)(Number(id));
        res.status(200).json(canceledAppointment);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.cancelarAppoiment = cancelarAppoiment;
