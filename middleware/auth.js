import express from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

function token_validation(req, res, next) {
  const header = req.headers;
  console.log("header: ", header);
  // HTTP 요청 헤더에서 'Authorization' 필드를 읽음
  const authHeader = req.headers.authorization;
  console.log("authHeader: ", authHeader);

  // 'Bearer TOKEN' 형식에서 토큰만 추출
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token: ", token);

  if (!token) {
    return res.status(401).json({ status: false });
  }
  // aurhToken이 있는데 유효한지 확인
  else {
    jwt.verify(token, config.jwt.secretKey, (err, decoded) => {
      if (err) {
        console.log("Token is invalid: ", err.message);
        return res.json({ status: false });
      }

      // 정상 authToken이 있을 떄
      next();
    });
  }
}

export default token_validation;
