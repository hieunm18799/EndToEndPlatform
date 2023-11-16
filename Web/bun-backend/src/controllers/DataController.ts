import { Request, Response } from "express";
import { prisma } from "../index";
import { Data } from "../entity/data";

import config, { ProjectJWT } from "../config/config";
import { MULTER_FOLDER } from "../middlewares/fileStore";
import * as fs from "fs"

class DataController {

  static listAllDatas = async (req: Request, res: Response) => {
      //Get current project's id
      const projectId = res.locals[config.middle_val.projectInfor].projectId
      //Get data by project's id
      const datas = await prisma.data.findMany({
          where: {
              projectId: projectId,
          }
      });
      res.download(datas[0].location + datas[0].name, datas[0].name, (err) => {
        if (err) {
          res.status(500).send({
            message: "Could not download the file. " + err,
          });
        }
      });
  };

  static getDataFile = async (req: Request, res: Response) => {
    //Get the email from the url
    const id: string = req?.params?.id;
    //Get current project's id
    const projectId = res.locals[config.middle_val.projectInfor].projectId

    //Get the user from database
    try {
      const data = await prisma.data.findUniqueOrThrow({
        where: {
          id: id,
          projectId: projectId,
        }
      })
      console.log(data.location + data.id, data.name);
      res.download(data.location + data.id, data.name, (err) => {
        if (err) {
          console.log(err)
          if (!res.headersSent) {
          } else res.status(500)
        } else {
          console.log("download completed");
        }
      });
    } catch (error) {
      res.status(404).send("Data not found!");
    }
  };

  static newData = async (req: Request , res: Response) => {
    try {
      const file = req.file;
      if (!file?.originalname) throw 'No file received!' 
      //Get data's val
      
      const data = new Data({
        name: file?.originalname,
        label: req.get('x-label'),
        type: req.get('x-type'),
        projectId: (<ProjectJWT>res.locals[config.middle_val.projectInfor]).projectId,
      })
      data.location = `${MULTER_FOLDER}/${data.projectId}/${data.type}/${data.label}/`;
      
      await prisma.data.create({data: data})
      
      if (!fs.existsSync(data.location)) fs.mkdirSync(data.location, {recursive: true});
      fs.renameSync(`${MULTER_FOLDER}/${file?.originalname}`, data.location + data.id);
      console.log("ok")
      
      //If all ok, send 201 response
      res.status(201).send({dataId: data.id, msg: "Data created!"});
    } catch (e) {
      res.status(409).send("Error when creat!");
      return;
    }

    res.status(204);
  };

  static editData = async (req: Request, res: Response) => {
    //Get the id from the url
    const id = req?.params?.id;
    //Get current project's id
    const projectId = res.locals[config.middle_val.projectInfor].projectId

    //Get values from the body
    const data = new Data(req.body);

    try {
        await prisma.data.update({
        where: {
          id: id,
          projectId: projectId,
        },
        data: data,
      })
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("Data not found!");
      return;
    }

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteData = async (req: Request, res: Response) => {
    //Get the id from the url
    const id = req.params.id;
    //Get current project's id
    const projectId = res.locals[config.middle_val.projectInfor].projectId

    try {
      const data = await prisma.data.delete({
        where: {
          id: id,
          projectId: projectId,
        },
      })
      res.send(data)
    } catch (error) {
      res.status(404).send("Data not found!");
      return;
    }

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };
};

export default DataController;