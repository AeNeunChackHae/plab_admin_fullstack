import express from "express";
import * as stadiumController from "../controller/stadium.js";
import * as fileUpload from "../middleware/fileUpload.js";

const router = express.Router();

router.get("/", stadiumController.stadiumList);

router.get("/regist", stadiumController.registPage);

router.get("/edit/:id", stadiumController.editPage);

router.post("/regist", fileUpload.fileUpload, fileUpload.aws_s3_upload, stadiumController.create);

router.get("/subRegion/:id", stadiumController.subRegion)

export default router;
