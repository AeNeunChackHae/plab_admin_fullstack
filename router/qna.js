import express from "express";
import * as qnaController from '../controller/qna.js';
import multer from 'multer';

const upload = multer();

const router = express.Router();

// qna 페이지
router.get("/", qnaController.qnaList);

// qna 수정 페이지
router.get("/edit/:id", qnaController.editPage);

// qna 답변 (multer)
router.post("/edit", upload.none(), qnaController.update);

export default router;