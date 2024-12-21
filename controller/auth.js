import express from "express";

export async function loginPage(req, res, next) {
  res.render("login");
}

// export async function loginLogic(req, res, next) {
// req.body
//  config.js에서 admin_account랑 admin_password를 받아와서 입력값과 비교
//   res.status(200);
// }
