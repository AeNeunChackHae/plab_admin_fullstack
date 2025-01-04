import express from "express";
import * as userController from '../controller/user.js';
import multer from 'multer';

const upload = multer();

const router = express.Router();

router.get("/", userController.userList);

router.get("/withdraw", userController.withdrawUserList);

router.get("/regist");

router.get("/edit/:id", userController.editPage);

router.post("/edit/:id", upload.none(), userController.update);

export default router;