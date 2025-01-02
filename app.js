import express from "express";
import rootRouter from "./router/root.js";
import authRouter from "./router/auth.js";
import userRouter from "./router/user.js";
import managerRouter from "./router/manager.js";
import stadiumRouter from "./router/stadium.js";
import noticeRouter from "./router/notice.js";
import qnaRouter from "./router/qna.js";
import { config } from './config.js'
import cors from "cors";
import path from "path";
import { scheduleMatchCheck } from "./job/match.js";

const app = express();

// 내가 호스팅한 웹서버에 내가 접근하기 위한 CORS 설정
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// URL-encoded 데이터를 파싱하는 미들웨어 추가
app.use(express.urlencoded({ extended: true }));

// req 정보를 json으로 파싱
app.use(express.json());

// 루트 디렉토리에 'template'폴더의 html, css, js, ejs를 정적 파일로 지정
app.use(express.static(path.join(process.cwd(), "template")));

// 템플릿 엔진을 'ejs'로 지정
app.set("view engine", "ejs");

// 템플릿 소스(html) 경로 지정 (루트 디렉토리 기준)
app.set("views", path.join(process.cwd(), "template"));

// Router 설정
app.use("/", rootRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/manager", managerRouter);
app.use("/stadium", stadiumRouter);
app.use("/notice", noticeRouter);
app.use("/qna", qnaRouter);

// 404 error page
app.use("*", (req, res, next) => {
  res.render("not_found");
});

// 스케줄러
scheduleMatchCheck(); // 스케줄러 초기화

// 서버 호스팅
const server = app.listen(config.hosting_port.admin_full);