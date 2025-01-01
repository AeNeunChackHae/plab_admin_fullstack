import AWS from "aws-sdk";
import multer from "multer";
import path from "path";
import { config } from "../config.js";
import fs from "fs";
import { v4 } from "uuid";

export async function aws_s3_upload(req, res, next) {

  // '수정하기'에서 사진을 안바꿨을 때 req.file이 null일 수 있음
  if(!req.file){
    req.photo_except = true;
    return next();
  }

  // AWS 설정
  AWS.config.update({
    accessKeyId: config.aws.access_key,
    secretAccessKey: config.aws.secret_key,
    region: config.aws.bucket_region,
  });

  // S3 인스턴스 생성
  const s3 = new AWS.S3();

  // 버킷 이름과 S3에서의 파일명 설정
  const bucketName = config.aws.bucket_name;
  const key = config.aws.bucket_directory + '/' + req.body.requestTable + '/' + v4() + '-' + req.filename;

  // 파일을 읽고 S3에 업로드
  let fileContent;
  try{
    fileContent = fs.readFileSync(req.filePath);
  }catch(error){
    console.error('웹서버 업로드 파일 리딩중 exception\n\n\n', error);
    return res.json({status:false, error})
  }

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ACL: 'public-read'
  };

  // s3 업로드 실시
  try{
    const data = await s3.upload(params).promise();
    console.log("Upload Success", data.Location);
    req.awsUploadPath = data.Location;

    // s3 업로드 후 웹서버 업로드 파일 삭제
    fs.unlink(req.filePath, (error) => { // 비동기 파일 삭제로 변경
      if (error) {
        console.error('fs 파일 삭제 중 오류 발생:', error);
        return res.json({status: false, error});
      }
      console.log('파일이 성공적으로 삭제되었습니다.');
      next();
    });
  }catch(error){
    console.log('AWS S3 Bucket upload Exception \n\n\n', error);
  }
}


/* Body에 multipart file을 서버에 업로드 */
export async function fileUpload(req, res, next) {

  // uploads 폴더가 없으면 생성하기
  const uploadPath = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  try{
    // multer 미들웨어 획득
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage }).single(config.fileUpload.admin_stadium_input_name);

    // multer 미들웨어 실행
    upload(req, res, function (err) {
      
      // multer 기능 수행 중 err 발생시 처리
      if (err) {
        console.log('-----fileUpload Module multer parse Error-----\n\n\n', err);
        return res.json({ status: false, error: err });
      }
      console.log('fileUpload module fileUpload() multer 후 req.body\n', req.body);
  
      // 파일이 성공적으로 처리된 경우
      if (req.file) {
        const filePath = path.join(process.cwd(), 'uploads', req.file.originalname);
  
        // 서버 PC에 파일을 저장
        fs.writeFile(filePath, req.file.buffer, (err) => {
          if (err) {
            console.log('fs.writeFile err: ', err)
            return res.json({ status: false, error: "Failed to save the file." });
          }
          // 파일 저장 성공 로그
          console.log("File saved successfully : ", filePath);

          // aws 저장시 필요한 값 전달달
          req.filePath = filePath;
          req.filename = req.file.originalname;
          next();
        });
      }else{
        next();
      }
    });
  }catch(error){
    console.log('-----fileUpload Module multer parse Error-----\n\n\n', error)
    return res.json({ status: false, error});
  }
}