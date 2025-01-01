import express from "express";
import * as userController from '../controller/user.js';

const router = express.Router();

router.get("/", userController.userList);

router.get("/regist");

export default router;