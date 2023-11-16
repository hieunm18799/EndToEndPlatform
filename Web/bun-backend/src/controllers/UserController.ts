import { Request, Response } from "express";

import { prisma } from "../index";

class UserController{

  static listAllUsers = async (req: Request, res: Response) => {
    //Get users from database
    const users = await prisma.user.findMany({
      select: {
        email:true,
        name:true,
        role:true,
      }
    })

    //Send the users object
    res.send(users);
  };

  static getUser = async (req: Request, res: Response) => {
    //Get the email from the url
    const email: string = req?.params?.email;

    //Get the user from database
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          email: email,
        }
      })
    } catch (error) {
      res.status(404).send("User not found!");
    }
    res.status(201).send("User created!");
  };

  static newUser = async (req: Request, res: Response) => {
    try {
      //Get parameters from the body
      let { email, name, password, role } = req?.body;
      
      await prisma.user.create({data: {
        email: email,
        name: name,
        password: password,
        role: role
      }})
    } catch (e) {
      res.status(409).send("User existed!");
      return;
    }

    //If all ok, send 201 response
    res.status(201).send("User created");
  };

  static editUser = async (req: Request, res: Response) => {
    //Get the email from the url
    const email = req?.params?.email;

    //Get values from the body
    const { name, role, password } = req.body;

    //Try to find user on database
    let user;
    try {
        await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          name: name,
          password: password,
          role: role,
        },
      })
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("User not found!");
      return;
    }

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteUser = async (req: Request, res: Response) => {
    //Get the email from the url
    const email = req.params.email;

    try {
      const user = await prisma.user.delete({
        where: {
          email: email,
        },
      })
      res.send(user);
    } catch (error) {
      res.status(404).send("User not found!");
      return;
    }

  };
};

export default UserController;