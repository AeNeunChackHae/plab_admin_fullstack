import express from "express";
import * as authController from "../controller/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/login", authController.loginPage);

router.post("/login", authController.loginLogic);

router.get("/tokenVal", auth, (req, res) =>
  res.status(200).json({ status: true })
);

export default router;