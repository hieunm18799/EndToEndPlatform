import { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import project from "./project";
import data from "./data";
import device from "./device";

const routes = Router();
const api = Router();

routes.use("/api", 
    api.use("/user", user),
    api.use("/project", project),
    api.use("/data", data),
    api.use("/device", device),
)
routes.use("/auth", auth);

export default routes;