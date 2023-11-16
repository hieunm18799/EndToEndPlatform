import { Request, Response } from "express";

import { prisma } from "../index";
import { Project } from "../entity/project";
import config, { ProjectJWT } from "../config/config";
import * as jwt from "jsonwebtoken";

class ProjectController{

  static listAllProjects = async (req: Request, res: Response) => {
      //Get current email
      const email = res.locals[config.middle_val.userInfor].email;
      console.log(email);
      //Get project by owener
      const projects = await prisma.project.findMany({
          where: {
              userEmail: email,
          }
      })

      //Send the users object
      res.send(projects);
  };

  static getProject = async (req: Request, res: Response) => {
    //Get the email from the url
    const id: string = req?.params?.id;
    //Get current email
    const email = res.locals[config.middle_val.userInfor].email;

    //Get the user from database
    try {
      const project = await prisma.project.findUniqueOrThrow({
        where: {
          id: id,
          userEmail: email,
        }
      })
      res.send(project)
    } catch (error) {
      res.status(404).send("Project not found!");
    }
  };

  static newProject = async (req: Request, res: Response) => {
    try {
      //Get current email
      const email = res.locals[config.middle_val.userInfor].email;
      //Get project's val
      const project = new Project(req?.body)
      project.userEmail = email
      
      await prisma.project.create({data: {
          name: project.name,
          // datas: project.datas,
          sensorName: project.sensorName,
          deviceName: project.deviceName,
          userEmail: project.userEmail,
      }})
    } catch (e) {
      res.status(409).send("Error in creat project!");
      return;
    }

    //If all ok, send 201 response
    res.status(201).send("Project created!");
  };

  static editProject = async (req: Request, res: Response) => {
    //Get the id from the url
    const id = req?.params?.id;
    //Get current email
    const email = res.locals[config.middle_val.userInfor].email;

    //Get values from the body
    const project = new Project(req.body);

    try {
        await prisma.project.update({
        where: {
          id: id,
          userEmail: email,
        },
        data: {
          name: project.name,
          // datas: project.datas,
          sensorName: project.sensorName,
          deviceName: project.deviceName,
      },
      })
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("Project not found!");
      return;
    }

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteProject = async (req: Request, res: Response) => {
    //Get the id from the url
    const id = req.params.id;
    //Get current email
    const email = res.locals[config.middle_val.userInfor].email;

    try {
      const project = await prisma.project.delete({
        where: {
          id: id,
          userEmail: email,
        },
      })
      res.send(project);
    } catch (error) {
      res.status(404).send("Project not found!");
      return;
    }

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static getProjectApiKey = async (req: Request, res: Response) => {
    //Get current email
    const email = res.locals[config.middle_val.userInfor].email;
    //Get the id from the url
    const id = req.params.id;

    try {
      const project = await prisma.project.findUniqueOrThrow({
        where: {
          id: id,
          userEmail: email,
        }
      })
      if (project) {
        //JWT, valid for 1 hour
        const token = jwt.sign(
          <ProjectJWT>{email: email, projectId: id},
          config.jwtSecret,
          // { expiresIn: config.jwtExpiresTime }
        );

        res.send(token);
      }
    } catch (error) {
      res.status(404).send("Project not found!");
    }
  }
};

export default ProjectController;