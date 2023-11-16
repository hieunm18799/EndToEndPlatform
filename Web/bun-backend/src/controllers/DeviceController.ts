import { Request, Response } from "express";

import { prisma } from "../index";
import { Device_ESP32 } from "../entity/device_esp32";
import { Device } from "../entity/interface/device";
import { Sensor } from "../entity/interface/sensor";

const zipdir = require('zip-dir');

class DeviceController {

  static listAllByEmail = async (req: Request, res: Response) => {
      //Get all device
      const devices = await prisma.device.findMany({});
      //Send the users object
      res.send(devices);
  };

  static getDevice = async (req: Request, res: Response) => {
    //Get the email from the url
    const name: string = req?.params?.name;

    //Get the user from database
    try {
      const device = await prisma.device.findUniqueOrThrow({
        where: {
          name: name,
        }
      })
      res.send(device)
    } catch (error) {
      res.status(404).send("Device not Found!");
    }
  };

  static newDevice = async (req: Request, res: Response) => {
    try {
      //Get device's val
      const device = new Device_ESP32(req?.body)
      
      await prisma.device.create({data: device})
    } catch (e) {
      res.status(409).send("Device already existed!");
      return;
    }

    //If all ok, send 201 response
    res.status(201).send("Device created!");
  };

  static editDevice = async (req: Request, res: Response) => {
    //Get the name from the url
    const name = req?.params?.name;

    //Get values from the body
    const device = new Device_ESP32(req.body);

    try {
        await prisma.device.update({
        where: {
          name: name,
        },
        data: device,
      })
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("Device not found!");
      return;
    }

    //After all send a 204 (no content, but accepted) response
    res.status(204).send();
  };

  static deleteDevice = async (req: Request, res: Response) => {
    //Get the name from the url
    const name = req.params.name;

    try {
      const device = await prisma.device.delete({
        where: {
          name: name,
        },
      })
      res.send(device)
    } catch (error) {
      res.status(404).send("Device not found!");
      return;
    }
  };

  static flashFirmware = async(req: Request, res: Response) => {
    const device = <Device>req.body.device;
    const sensor = <Sensor>req.body.sensor;

    try {
      // console.log(process.env.ROOT_FOLDER + `/code/root/esp32-cam-comm`);
      zipdir(process.env.ROOT_FOLDER + `/code/root/esp32-cam-comm`, { saveTo: process.env.ROOT_FOLDER + `/code/firmware/esp32-cam-comm.zip` }, (err: Error, buffer: Buffer) => {
        if (err) {
          console.error('Error zipping directory:', err);
          res.status(500).send('Internal Server Error');
        } else {
          res.setHeader('x-filename', 'esp32-cam-comm');
          res.setHeader('Content-Type', 'application/zip');
          res.send(buffer);
        }
      });
    } catch(err) {
      res.status(400);
      return;
    }
    // res.status(201);
  }
};

export default DeviceController;