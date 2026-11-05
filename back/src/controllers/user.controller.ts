import { Request, Response, NextFunction } from "express";
import { getAllUsersService, getUserByIdService } from "../services/user.service";

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const result = await getAllUsersService(page, limit);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await getUserByIdService(id);
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
