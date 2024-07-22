import { Request , Response } from "express";
import { createUserServices, getUserServices, getUserServicesID, loguinUserServices } from "../services/userServices";
import userDtos from "../dtos/userDtos";
import { user } from "../entities/user";



export const getUsers = async ( req:Request , res:Response )=>{

    try{const users: user[] = await getUserServices();
    res.status(200).json(users)}
    catch(error){
        res.status(404).json({ message: 'no se encontro usuarios' });
    }
}

export const getUsersID= async ( req:Request , res: Response )=>{
    try {
        const { id } =  req.params;
        const usersid: user|null = await getUserServicesID(Number(id));
        
        res.status(200).json(usersid);
      } catch (error: any) {
        res.status(404).json({ message: "no se encontro usuario con ese id" });
      }
}

export const postRegister = async (req: Request, res: Response) => {
    try {
        const { name, email, username, password, birthdate, nDni }:userDtos = req.body;
        if (!name || !email || !username || !password || !birthdate || !nDni) {
            return res.status(400).json({ message: 'Faltan datos para crear el usuario' });
        }

        const user: user = await createUserServices({ name, email, username, password, birthdate, nDni });

        res.status(201).json(user);
    
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const postLogin = async(req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const user = await loguinUserServices({ username, password });
        console.log("usuario logueado con exito")

        res.status(200).json(user);
    } catch (error:any) {
        res.status(400).json({ message: error.message });
    }
  };