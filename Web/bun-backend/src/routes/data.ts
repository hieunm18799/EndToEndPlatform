import { Router } from "express";
import { Express, Request, Response} from 'express';

import { checkJwtProject, checkJwtUser } from "../middlewares/checkJwt";
import DataController from "../controllers/DataController";
import { upload } from "../middlewares/fileStore";

const router = Router();

//Get all data by current project's id
router.get(
    "/",
    [checkJwtProject],
    DataController.listAllDatas
);

// Get one data in current project's id
router.get(
  "/:id",
  [checkJwtProject],
  DataController.getDataFile
);

//Create a new data - user can do
router.post(
    "/",
    [checkJwtProject, upload.single('data')],
    DataController.newData
);

//Edit one data in current project's id
router.patch(
  "/:id",
  [checkJwtProject],
  DataController.editData
);

//Delete one data in current project's id
router.delete(
  "/:id",
  [checkJwtProject],
  DataController.deleteData
);

// routes.post("/training/files", upload.single('data'), (req, res) => {
//     data = req.file

//     console.log(data);

//     res.json(
//         { success: true, files: [{ success: true },]}
//     )
// })

// routes.get("/training/files", (req, res: Response) => {
//     res.download('uploads/' + data.originalname, data.originalname, (err) => {
//         if (err) {
//           res.status(500).send({
//             message: "Could not download the file. " + err,
//           });
//         }
//       });
// })

export default router