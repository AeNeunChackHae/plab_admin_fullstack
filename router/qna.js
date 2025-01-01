import express from "express";
import * as qnaController from '../controller/qna.js';

const router = express.Router();

// qna 페이지
router.get("/", qnaController.qnaList);

// qna수정 페이지
router.get("/edit/:id", qnaController.editPage);
router.post("/edit/:id", qnaController.update);

export default router;