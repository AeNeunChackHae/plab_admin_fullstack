import express from "express";
import { config } from "../config.js";
import jwt from 'jsonwebtoken';  // JWT 모듈 임포트

export async function loginPage(req, res, next) {
  res.render("login");
}

export async function loginLogic(req, res, next) {
  const { username, password } = req.body;
  const admin_account = config.admin_account.account;
  const admin_password = config.admin_account.password;
  const payload = {
    role: "super_admin"
  }

  if (admin_account === username && admin_password === password) {
    console.log('payload: ', payload)
    console.log('config.secretKey: ', config.jwtSecret)
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });  // JWT 토큰 생성
    console.log('token: ',  token)
    return res.status(200).json(token);
  } else {
    return res.status(401).redirect('/auth/login');  // 로그인 실패 시 리다이렉트
  }
}
