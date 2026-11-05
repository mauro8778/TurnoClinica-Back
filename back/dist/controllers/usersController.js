"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postLogin = exports.postRegister = exports.getUsersID = exports.getUsers = void 0;
const userServices_1 = require("../services/userServices");
const getUsers = async (req, res) => {
    try {
        const users = await (0, userServices_1.getUserServices)();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(404).json({ message: 'no se encontro usuarios' });
    }
};
exports.getUsers = getUsers;
const getUsersID = async (req, res) => {
    try {
        const { id } = req.params;
        const usersid = await (0, userServices_1.getUserServicesID)(Number(id));
        res.status(200).json(usersid);
    }
    catch (error) {
        res.status(404).json({ message: "no se encontro usuario con ese id" });
    }
};
exports.getUsersID = getUsersID;
const postRegister = async (req, res) => {
    try {
        const { name, email, username, password, birthdate, nDni } = req.body;
        if (!name || !email || !username || !password || !birthdate || !nDni) {
            return res.status(400).json({ message: 'Faltan datos para crear el usuario' });
        }
        const user = await (0, userServices_1.createUserServices)({ name, email, username, password, birthdate, nDni });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.postRegister = postRegister;
const postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await (0, userServices_1.loguinUserServices)({ username, password });
        console.log("usuario logueado con exito");
        res.status(200).json(user);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.postLogin = postLogin;
