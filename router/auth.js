import express from "express";
import * as authController from "../controller/auth.js";

const router = express.Router();

router.get("/login", authController.loginPage);

router.post("/login", authController.loginLogic);

export default router;
