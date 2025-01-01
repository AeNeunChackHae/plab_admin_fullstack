import express from "express";
import * as qnaController from '../controller/qna.js';

const router = express.Router();

// qna 페이지
router.get("/", qnaController.qnaList);

// qna등록 페이지
router.get("/regist");

export default router;