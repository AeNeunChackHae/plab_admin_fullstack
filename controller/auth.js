import express from "express";
import { config } from "../config.js";
import jwt from "jsonwebtoken";
import { db } from "../mysql.js"
import bcrypt from 'bcrypt'

// 관리자 조회
async function getAdminByEmail(email) {
  try {
      console.log("쿼리 실행: SELECT * FROM PFB_ADMIN WHERE email = ?", email);
      const [rows] = await db.query(
          "SELECT * FROM PFB_ADMIN WHERE email = ? AND del_yn = 'N'",
          [email]
      );
      console.log("쿼리 결과:", rows);
      return rows[0];
  } catch (error) {
      console.error("DB query error:", error);
      throw new Error("DB 조회 실패");
  }
}

// 로그인 페이지 렌더링
export async function loginPage(req, res, next) {
  res.render("login");
}

// 로그인 로직
export async function loginLogic(req, res, next) {
  const { email, password } = req.body;

  try {
      const admin = await getAdminByEmail(email);

      if (!admin) {
          console.log("조회된 데이터 없음:", email);
          return res.status(403).json({ status: false, message: "사용자가 존재하지 않습니다." });
      }

      const isMatch = await bcrypt.compare(password, admin.login_password)
      const super_admin_yn = admin.super_admin_yn;
      if (isMatch) {
          const payload = {
              role: admin.super_admin_yn === 'Y' ? "super_admin" : "admin",
              username: admin.admin_name,
              userId: admin.id,
              super_admin_yn
          };

          const token = jwt.sign(payload, config.jwt.admin_secretKey, { expiresIn: "1h" });

          console.log("token: ", token);
          return res.status(200).json({ status: true, token, super_admin_yn });
      } else {
          return res.status(403).json({ status: false, message: "비밀번호가 틀렸습니다." });
      }
  } catch (error) {
      console.error("login error: ", error);
      return res.status(500).json({ status: false, message: "서버 오류 발생" });
  }
}