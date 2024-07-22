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
exports.cancelarAppoiment = exports.agendarAppoiment = exports.getAppoimentid = exports.getAppoiment = void 0;
const appoimentServices_1 = require("../services/appoimentServices");
const getAppoiment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield (0, appoimentServices_1.getAppoimentServices)();
    res.status(200).json(users);
});
exports.getAppoiment = getAppoiment;
const getAppoimentid = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const appoimentid = yield (0, appoimentServices_1.getAppoimentServicesID)(Number(id));
        if (!appoimentid) {
            return res.status(404).json({ message: 'El turno no existe' });
        }
        res.status(200).json(appoimentid);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.getAppoimentid = getAppoimentid;
const agendarAppoiment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, time, status, description, userId } = req.body;
        if (!date || !time || !status || !description || !userId) {
            return res.status(400).json({ message: "Faltan datos para crear el turno" });
        }
        const newAppoiment = yield (0, appoimentServices_1.createAppoiment)({ date, time, status, description, userId });
        return res.status(201).json(newAppoiment);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.agendarAppoiment = agendarAppoiment;
const cancelarAppoiment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const canceledAppointment = yield (0, appoimentServices_1.cancelarAppoimentServices)(Number(id));
        res.status(200).json(canceledAppointment);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.cancelarAppoiment = cancelarAppoiment;
