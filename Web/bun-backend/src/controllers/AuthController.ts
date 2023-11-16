import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { prisma } from "..";
import { User } from "../entity/user";
import config, { UserJWT } from "../config/config";

class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let { email, password } = req.body;
    console.log(req);
    if (!(email && password)) {
      res.status(400).send();
    }

    try {
      const user = new User(await prisma.user.findUniqueOrThrow({
        where: {
          email: email,
        }
      }))

      if (user.checkIfUnencryptedPasswordIsValid(password)) {
        res.status(401).send("Wrong email or password!");
        return;
      }

      //JWT, valid for 1 hour
      const token = jwt.sign(
        <UserJWT>{email: email, password: password},
        config.jwtSecret,
        { expiresIn: config.jwtExpiresTime }
      );

      res.status(200).send(token);

    } catch (error) {
      res.status(401).send("Login error!");
    }
  };

  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const email = res.locals[config.middle_val.userInfor].email;

    //Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    //Get user from the database
    try {
      const user = new User(await prisma.user.findUniqueOrThrow({
        where: {
          email: email,
        }
      }))

      if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
        res.status(401).send();
        return;
      }
      
      //Hash the new password and save
      user.hashPassword();
      await prisma.user.update({
        where: {
          email: email,
        },
        data: user,
      })
    } catch (id) {
      res.status(401).send();
    }


    res.status(204).send();
  };
}
export default AuthController;