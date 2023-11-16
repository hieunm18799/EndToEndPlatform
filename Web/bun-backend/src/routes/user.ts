import { Router } from "express";
import UserController from "../controllers/UserController";
import { checkJwtUser } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

const router = Router();

//Get all users
router.get(
  "/",
  [checkJwtUser, checkRole(["admin"])],
  UserController.listAllUsers
);

// Get one user
router.get(
  "/:id",
  [checkJwtUser, checkRole(["admin"])],
  UserController.getUser
);

//Create a new user
router.post("/", [checkJwtUser, checkRole(["admin"])], UserController.newUser);

//Edit one user
router.patch(
  "/:id",
  [checkJwtUser, checkRole(["admin"])],
  UserController.editUser
);

//Delete one user
router.delete(
  "/:id",
  [checkJwtUser, checkRole(["admin"])],
  UserController.deleteUser
);

export default router;