import { Request, Response, NextFunction } from "express";
import {
  createAppointmentService,
  cancelAppointmentService,
  getAppointmentsService,
  getAppointmentByIdService,
} from "../services/appointment.service";

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user?.id || req.body.userId;
    if (!currentUserId) {
      return res.status(401).json({ status: 401, detail: "Usuario no identificado" });
    }

    const appointment = await createAppointmentService(req.body, currentUserId);
    return res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    const role = req.user?.role;

    const appointment = await cancelAppointmentService(id, userId, role);
    return res.status(200).json({
      message: "Turno cancelado exitosamente",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAppointmentsService(req.query as any);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const appointment = await getAppointmentByIdService(id);
    return res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};
