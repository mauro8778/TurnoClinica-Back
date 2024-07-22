import { Request , Response } from "express"
import { cancelarAppoimentServices, createAppoiment, getAppoimentServices, getAppoimentServicesID } from "../services/appoimentServices"
import { appoiments } from "../entities/appoiments";


export const getAppoiment= async(req:Request,res:Response)=>{
    const users: appoiments[] = await getAppoimentServices();
    res.status(200).json(users)
}
export const getAppoimentid= async(req:Request,res:Response)=>{

    try {
        const { id } =  req.params;
        const appoimentid: appoiments | null = await getAppoimentServicesID(Number(id));
        if (!appoimentid) {
            return res.status(404).json({ message: 'El turno no existe' });
        }
        res.status(200).json(appoimentid);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
}
export const agendarAppoiment= async(req:Request,res:Response)=>{
    try {
        const {date,time,status,description,userId}=req.body
        if (!date || !time || !status || !description || !userId ) {
            return res.status(400).json({ message: "Faltan datos para crear el turno" })}
        const newAppoiment= await createAppoiment({ date, time,status, description,userId});
        return res.status(201).json(newAppoiment)
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
}
export const cancelarAppoiment=async(req:Request,res:Response)=>{
    try {
        const { id } = req.params;
        
        
        const canceledAppointment = await cancelarAppoimentServices(Number(id));
        
        res.status(200).json(canceledAppointment);
    } catch (error: any) {
    
        res.status(400).json({ message: error.message });
    }



}


