import express from "express";
import * as adminController from '../controller/admin.js';
import multer from 'multer';

const upload = multer();

const router = express.Router();

// 관리자 페이지
router.get("/", adminController.adminList);

// 탈퇴 관리자 페이지
router.get("/quit", adminController.quitAdminList);

// 관리자 등록 페이지
router.get("/regist", adminController.registPage);

// 관리자 등록 로직
router.post("/regist", upload.none(), adminController.create);

// 관리자 수정 페이지
router.get("/edit/:id", adminController.editPage);

// 관리자 수정 로직
router.post("/edit/:id", upload.none(), adminController.update);

export default router;