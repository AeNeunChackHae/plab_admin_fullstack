import express from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("list_page", {
    page_title: "사용자",
    table_title: "사용자 목록",
    regist_url: "/user/regist",
  });
});

router.get("/regist", (req, res, next) => {
  res.render("detail_page", { page_title: "사용자" });
});

export default router;
