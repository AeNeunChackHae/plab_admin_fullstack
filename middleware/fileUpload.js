import AWS from "aws-sdk";
import multer from "multer";
import path from "path";
import { config } from "../config.js";
import fs from "fs";

export async function aws_s3_upload(req, res, next) {
  // AWS 설정
  AWS.config.update({
    accessKeyId: config.aws.access_key,
    secretAccessKey: config.aws.secret_key,
    region: config.aws.bucket_region,
  });

  // S3 인스턴스 생성
  const s3 = new AWS.S3();

  // 웹서버에 업로드한
  const fileObject = req.file;

  // // 업로드할 파일의 경로
  const filePath = path.join(process.cwd(), fileObject.path);

  // // 버킷 이름과 S3에서의 파일명 설정
  const bucketName = config.aws.bucket_name;
  const key = "uploads/" + fileObject.filename;

  // 파일을 읽고 S3에 업로드
  const uploadFile = () => {
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
    };

    s3.upload(params, function (err, data) {
      if (err) {
        console.log("Error", err);
      }
      if (data) {
        console.log("Upload Success", data.Location);
      }
    });
  };

  uploadFile();
  next();
}

// Body에 multipart file을 서버에 업로드
export async function fileUpload(req, res, next) {
  const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      const uploadPath = path.join(process.cwd(), "uploads");
      if (uploadPath) {
        callback(null, "./uploads");
      } else {
        callback(new Error("Upload target directory None"), null);
      }
    },
    filename: function (req, file, callback) {
      callback(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  const upload = multer({ storage: storage }).single("profile_avatar");

  // 미들웨어라서 실행을 해줘야 업로드가 진행됨
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: "A file upload error occurred!" });
    }
    next();
  });
}
