import express from "express";
import { config } from "../config.js";
import * as rootController from '../controller/root.js';

const router = express.Router();

router.get("/", rootController.dashboard);

export default router;
