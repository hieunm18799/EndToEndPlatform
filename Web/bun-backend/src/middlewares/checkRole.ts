
import { Request, Response, NextFunction, Router } from "express";
import { prisma } from "..";
import { ROLES } from "../entity/user"
import config from "../config/config";

export const checkRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Get the user ID from previous midleware
    const email = res.locals[config.middle_val.userInfor].email;

    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: email,
        }
      })

      if (roles.indexOf(ROLES.ADMIN) > -1) next();
      else res.status(401).send();
    } catch (id) {
      res.status(401).send();
    }

    //Check if array of authorized roles includes the user's role
  };
};