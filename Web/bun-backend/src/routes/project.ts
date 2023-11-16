import { Router, Request, Response} from "express";

import { checkJwtUser } from "../middlewares/checkJwt";
import ProjectController from "../controllers/ProjectController";

const router = Router();

//Get all projects by owner
router.get(
    "/",
    [checkJwtUser],
    ProjectController.listAllProjects
);

// Get one project
router.get(
  "/:id",
  [checkJwtUser],
  ProjectController.getProject
);

//Create a new project
router.post(
    "/", 
    [checkJwtUser],
    ProjectController.newProject
);

//Edit one project
router.patch(
  "/:id",
  [checkJwtUser],
  ProjectController.editProject
);

//Delete one project
router.delete(
  "/:id",
  [checkJwtUser],
  ProjectController.deleteProject
);

// Get project's key
router.get(
  "/key/:id",
  [checkJwtUser],
  ProjectController.getProjectApiKey
);

export default router