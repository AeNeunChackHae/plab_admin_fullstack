import express from "express";
import * as managerController from '../controller/manager.js';
import multer from 'multer';

const upload = multer();

const router = express.Router();

// 매니저 페이지
router.get("/", managerController.managerList);

// 승인 대기 매니저 페이지
router.get("/wait", managerController.waitManagerList);

// 매니저 수정 페이지
router.get("/edit/:id", managerController.editPage);

// 매니저 상태 업데이트
router.post("/edit", upload.none(), managerController.update);

export default router;