import express from "express";
import auth from '../middleware/auth.js';

const router = express.Router();

router.get("/", auth, (req, res, next) => {
  res.render("index");
});

export default router;
