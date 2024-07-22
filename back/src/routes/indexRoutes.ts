import { Router } from "express";
import userRoutes from "./userRoutes";
import appoimentRoutes from "./appoimentRoutes";

const router:Router = Router();

router.use("/users",userRoutes);
router.use("/appoiment",appoimentRoutes);

export default router;