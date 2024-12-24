import express from "express";
// import auth from '../middleware/auth.js';

const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("list_page", {
    page_title: "QnA",
    table_title: "QnA 목록",
    regist_url: "/qna/regist",
  });
});

router.get("/regist", (req, res, next) => {
  res.render("detail_page", { page_title: "QnA" });
});

export default router;
