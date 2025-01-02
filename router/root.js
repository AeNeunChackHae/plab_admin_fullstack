import express from "express";
import { config } from "../config.js";

const router = express.Router();

router.get("/", (req, res, next) => {
  const data_object = {
    basic_profile:config.profile.basic_profile_path
  }
  res.render("index",data_object);
});

export default router;
