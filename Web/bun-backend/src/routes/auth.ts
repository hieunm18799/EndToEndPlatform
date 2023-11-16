import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { checkJwtUser } from "../middlewares/checkJwt";

const router = Router();
//Login route
router.post("/login", AuthController.login);

//Change my password
router.post("/change-password", [checkJwtUser], AuthController.changePassword);

export default router;