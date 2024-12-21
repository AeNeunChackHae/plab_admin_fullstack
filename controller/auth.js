import express from "express";
import { config } from "../config.js";

export async function loginPage(req, res, next) {
  res.render("login");
}

export async function loginLogic(req, res, next) {
  const { username, password } = req.body;
  const admin_account = config.admin_account.account
  console.log("admin_account : ", admin_account)
  const admin_password = config.admin_account.password
  console.log("admin_password : ", admin_password)
  if (admin_account === username && admin_password === password) {
    // 로그인 성공 시 메인 페이지로 리다이렉트
    res.redirect('/');
  } else {
    // 로그인 실패 시 로그인 페이지로 다시 리다이렉트
    res.status(401).redirect('/auth/login');
  }
}
