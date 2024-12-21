import express from "express";
import * as stadiumController from "../controller/stadium.js";
import * as fileUpload from "../middleware/fileUpload.js";

const router = express.Router();

router.get("/regist", stadiumController.registPage);

router.get("/edit", stadiumController.editPage);

router.get("/waitList", stadiumController.waitStadiumList);

router.post(
  "/regist",
  fileUpload.fileUpload,
  fileUpload.aws_s3_upload,
  stadiumController.create
);

export default router;
