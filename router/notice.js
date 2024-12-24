import express from "express";
// import auth from '../middleware/auth.js';

const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("list_page", {
    page_title: "공지사항",
    table_title: "공지사항 목록",
    regist_url: "/notice/regist",
  });
});

router.get("/regist", (req, res, next) => {
  res.render("detail_page", { page_title: "공지사항" });
});

export default router;
