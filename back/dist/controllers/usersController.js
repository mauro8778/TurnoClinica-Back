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
exports.postLogin = exports.postRegister = exports.getUsersID = exports.getUsers = void 0;
const userServices_1 = require("../services/userServices");
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, userServices_1.getUserServices)();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(404).json({ message: 'no se encontro usuarios' });
    }
});
exports.getUsers = getUsers;
const getUsersID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const usersid = yield (0, userServices_1.getUserServicesID)(Number(id));
        res.status(200).json(usersid);
    }
    catch (error) {
        res.status(404).json({ message: "no se encontro usuario con ese id" });
    }
});
exports.getUsersID = getUsersID;
const postRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, username, password, birthdate, nDni } = req.body;
        if (!name || !email || !username || !password || !birthdate || !nDni) {
            return res.status(400).json({ message: 'Faltan datos para crear el usuario' });
        }
        const user = yield (0, userServices_1.createUserServices)({ name, email, username, password, birthdate, nDni });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.postRegister = postRegister;
const postLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield (0, userServices_1.loguinUserServices)({ username, password });
        console.log("usuario logueado con exito");
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.postLogin = postLogin;
