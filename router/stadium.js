import express from "express";
import * as stadiumController from "../controller/stadium.js";
import * as fileUpload from "../middleware/fileUpload.js";
import multer from "multer";

const router = express.Router();

// 구장 리스트 페이지
router.get("/", stadiumController.stadiumList);

// 구장 등록 페이지
router.get("/regist", stadiumController.registPage);

// 구장 등록 로직
router.post("/regist", fileUpload.fileUpload, fileUpload.aws_s3_upload, stadiumController.create);

// 구장 수정 페이지
router.get("/edit/:id", stadiumController.editPage);

// 구장 수정 로직
router.post("/edit/:id", fileUpload.fileUpload, fileUpload.aws_s3_upload, stadiumController.update);

// 메인 지역에 맞는 하위 지역 리스트 반환
router.get("/subRegion/:id", stadiumController.subRegion)

export default router;
