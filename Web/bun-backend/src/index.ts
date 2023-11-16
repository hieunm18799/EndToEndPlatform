import { PrismaClient } from "@prisma/client";
import express from "express";
import * as bodyParser from "body-parser"
import cors from "cors"

import routes from "./routes";

import {User} from "./entity/user"
import { Sensor_CAM_OV2640 } from "./entity/sensor_cam_ov2640";

export const prisma = new PrismaClient();
await prisma.user.upsert({
  where: {
    email: 'admin@gmail.com',
  },
  update: new User({email: 'admin@gmail.com',
  name: 'admin',
  password: "admin",
  role: "admin"}),
  create:
    new User({email: 'admin@gmail.com',
    name: 'admin',
    password: "admin",
    role: "admin"}),
})
await prisma.sensor.upsert({
  where: {
    name: 'CAMERA OV2640',
  },
  update: new Sensor_CAM_OV2640({
    name: 'CAMERA OV2640',
    sampleSpeed: 1,
    frequencies: [1],
  }),
  create: new Sensor_CAM_OV2640({
    name: 'CAMERA OV2640',
    sampleSpeed: 1,
    frequencies: [1],
  })
})


const app = express();

// Call midlewares
app.use(cors())
app.use(bodyParser.json())

//Set all routes from routes folder
app.use("/", routes);

app.listen(process.env.API_PORT ?? 8080, () => {
  console.log(`Express server has started on port ${process.env.API_PORT}.`)
})