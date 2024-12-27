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
  const key = config.aws.bucket_directory + fileObject.filename;

  // 파일을 읽고 S3에 업로드
  const uploadFile = () => {
    const fileContent = fs.readFileSync(filePath);

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileContent,
      ACL: 'public-read'
    };

    return new Promise((resolve, reject) =>{
      s3.upload(params, function (err, data) {
        if (err) {
          console.log("Error", err);
        }
        if (data) {
          console.log("Upload Success", data.Location);
          req.awsUploadPath = data.Location;
          try {
            fs.unlinkSync(filePath);
            console.log('파일이 성공적으로 삭제되었습니다.');
            resolve()
          } catch (err) {
              console.error('파일 삭제 중 오류 발생:', err);
              reject()
          }
        }
      });
    })
  };

  await uploadFile().then(result => next()).catch(error => console.log('uploadFile() catch: ', error));
}

// Body에 multipart file을 서버에 업로드
export async function fileUpload(req, res, next) {

  const uploadPath = path.join(process.cwd(), "uploads");

  // 폴더가 없으면 생성하기
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, callback) { // destination은 저장경로에 관련된 속성
      if (uploadPath) {
        callback(null, config.fileUpload.was_upload_directory); // 에러발생시 리턴되는 error 객체, 저장경로 or 파일면
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

  try{
    const upload = multer({ storage: storage }).single(config.fileUpload.admin_stadium_input_name);

    // 미들웨어라서 실행을 해줘야 업로드가 진행됨
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.render('error', {error:err.message})
      } else if (err) {
        return res.render('error', {error:'A file upload error occurred!'})
      } else if (!req.file) {
        // 파일이 없는 경우
        return res.render('error', {error: 'No file provided or wrong field name!'});
      }
      next();
    });
  }catch(error){
    console.log('fileUpload 92 line catch error\n', error)
    return res.render('error', {error})
  }
}
