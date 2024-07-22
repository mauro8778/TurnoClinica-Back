import { Router } from "express";
import { getUsers, getUsersID, postLogin, postRegister } from "../controllers/usersController";


const router = Router();

router.get("/",getUsers);
router.get("/:id",getUsersID);
router.post("/register",postRegister);

router.post("/login",postLogin);



export default router;