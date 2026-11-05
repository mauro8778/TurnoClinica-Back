import { Request, Response, NextFunction } from "express";
import { registerUserService, loginUserService } from "../services/auth.service";
import { getUserByIdService } from "../services/user.service";

export const postRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerUserService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUserService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 401, detail: "Usuario no autenticado" });
    }
    const user = await getUserByIdService(req.user.id);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
