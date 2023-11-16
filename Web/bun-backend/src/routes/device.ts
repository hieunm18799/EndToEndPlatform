import { Router } from "express";

import { checkJwtProject, checkJwtUser } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import DeviceController from "../controllers/DeviceController";

const router = Router();
const flash = Router();

//Get all device by owner
router.get(
    "/",
    [checkJwtUser],
    DeviceController.listAllByEmail
);

// Get one device
router.get(
  "/:id",
  [checkJwtUser],
  DeviceController.getDevice
);

//Create a new device
router.post(
    "/", 
    [checkJwtUser, checkRole(['admin'])],
    DeviceController.newDevice
);

//Edit one device
router.patch(
  "/:id",
  [checkJwtUser, checkRole(['admin'])],
  DeviceController.editDevice
);

//Delete one device
router.delete(
  "/:id",
  [checkJwtUser, checkRole(['admin'])],
  DeviceController.deleteDevice
);

// Flash code for device
router.use('/flash', [checkJwtProject],
  flash.post('/firmware', DeviceController.flashFirmware)
)

export default router