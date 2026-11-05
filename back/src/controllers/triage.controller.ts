import { Request, Response, NextFunction } from "express";
import { processAITriageService } from "../services/triage.service";
import { triageModel } from "../config/data-source";

export const assessTriage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(401).json({ status: 401, detail: "Se requiere autenticación para evaluar el triaje" });
    }

    const result = await processAITriageService(req.body, userId);
    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTriageHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 401, detail: "Usuario no autenticado" });
    }

    const history = await triageModel.find({
      where: { user: { id: userId } },
      relations: ["appointment"],
      order: { createdAt: "DESC" },
    });

    return res.status(200).json({
      status: "success",
      total: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
