# plab_admin_fullstack

관리자 사이트 ejs 활용

## 프로젝트 개요

이 프로젝트는 EJS(Embedded JavaScript)를 활용하여 관리자 사이트를 구축하는 것을 목표로 합니다.  
Node.js와 Express.js를 기반으로 서버를 구성하고, EJS를 템플릿 엔진으로 사용하여 동적인 웹 페이지를 생성합니다.

## 디렉토리 구조

```plaintext
plab_admin_fullstack/
├── controller/         # 컨트롤러 파일
├── data/               # 데이터 파일
├── job/                # 스케줄러 작업 파일
├── middleware/         # 미들웨어 파일
├── router/             # 라우터 파일
├── template/           # EJS 템플릿 파일
├── utils/              # 유틸리티 함수 파일
├── .gitignore          # Git 무시 파일 목록
├── README.md           # 프로젝트 설명 파일
├── app.js              # 애플리케이션 진입점
├── config.js           # 설정 파일
├── mysql.js            # MySQL 연결 파일
├── package-lock.json   # NPM 패키지 잠금 파일
├── package.json        # NPM 패키지 정보 파일
└── scheduler_error.log # 스케줄러 오류 로그 파일
```
## 🛠 기술 스택

### 📌 Backend
- **Node.js**: 서버 사이드 JavaScript 런타임
- **Express.js**: 간결하고 강력한 웹 프레임워크
- **MySQL**: 관계형 데이터베이스 관리 시스템
- **Sequelize**: ORM(Object Relational Mapping) 사용
- **Cron Jobs**: 정기적인 작업 스케줄링

### 📌 Frontend
- **EJS (Embedded JavaScript)**: 템플릿 엔진
- **HTML5 & CSS3**: 프론트엔드 UI 구성
- **JavaScript (ES6+)**: 동적 기능 구현

### 📌 DevOps & 기타
- **AWS EC2 서비스** : 배포
- **PM2**: Node.js 애플리케이션 프로세스 매니저

---

## 🚀 주요 기능

### 🔹 관리자 페이지
- **EJS 기반 템플릿 렌더링**
- **Node.js & Express로 서버 구축**
- **MySQL 데이터 관리**

### 🔹 사용자 인증 및 관리
- **JWT 기반 로그인 및 세션 관리**
- **사용자 권한(Role) 기반 접근 제어**

### 🔹 스케줄링 기능
- **Cron Jobs을 이용한 정기 작업 실행**
- **로그 파일을 통한 에러 관리 (`scheduler_error.log`)**

### 🔹 기타 기능
- **Express 미들웨어를 활용한 요청 처리**
- **라우터 기반 API 설계**
- **유틸리티 함수로 공통 기능 정리 (`utils/` 디렉토리 활용)**

---

## 📚 참고 자료

- [Express 공식 문서](https://expressjs.com/)
- [EJS 공식 문서](https://ejs.co/)
- [MySQL 공식 문서](https://dev.mysql.com/doc/)
- [Sequelize 공식 문서](https://sequelize.org/)
- [PM2 공식 문서](https://pm2.keymetrics.io/)
