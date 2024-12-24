import express from "express";

const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("list_page", {
    page_title: "매니저",
    table_title: "매니저 목록",
    regist_url: "/manager/regist",
  });
});

router.get("/regist", (req, res, next) => {
  res.render("detail_page", { page_title: "매니저" });
});

export default router;
