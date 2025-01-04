import { db } from "../mysql.js";
import schedule from "node-schedule";
import { config } from "../config.js";

// 이메일로  실행 오류시 알려주는 로직 필요!!!

// 현재 시간을 KST(한국 시간)으로 변환
function getKoreanTime() {
  const now = new Date();
  const koreanOffset = 9 * 60 * 60 * 1000; // UTC+9
  const koreanTime = new Date(now.getTime() + koreanOffset);
  return koreanTime;
}

// 특정 조건으로 PFB_MATCH 업데이트
async function updateMatchStatusAndExecuteUpdate(query, params, statusCode, logMessage) {
  console.log(`Executing query: ${query}`);
  console.log(`With params: ${JSON.stringify(params)}`);

  try {
    const [matches] = await db.execute(query, params);
    console.log(`Query result: ${JSON.stringify(matches)}`);

    if (matches.length > 0) {
      const matchIds = matches.map((match) => match.id);
      console.log(`Match IDs to update: ${matchIds}`);

      if (matchIds.length > 0) {
        const [updateResult] = await db.execute(
          `UPDATE PFB_MATCH
           SET status_code = ?
           WHERE id IN (${matchIds.join(",")})`, // 배열을 쉼표로 구분된 문자열로 변환
          [statusCode]
        );
        console.log(`Update result: ${JSON.stringify(updateResult)}`);
        console.log(`${logMessage}: ${matchIds.join(", ")}`);
      }
    } else {
      console.log(`${logMessage}: 조건에 맞는 매치가 없습니다.`);
    }
  } catch (error) {
    console.error(`Error during updateMatchStatusAndExecuteUpdate: ${error.message}`);
    throw error;
  }
}

// 스케줄러 작업
export async function scheduleMatchCheck() {
  console.log("스케줄 작업이 시작되었습니다.");

  // 매 1분마다 실행
  schedule.scheduleJob("0 * * * *", async () => {
    console.log("매 1분마다 스케줄 작업 실행...");

    try {
      const now = getKoreanTime(); // 한국 시간
      const formattedNow = now.toISOString().slice(0, 19).replace("T", " ");
      const threeHoursBefore = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3시간 전
      const formattedThreeHoursBefore = threeHoursBefore
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      console.log(`현재 시간(KST): ${formattedNow}, 3시간 전(KST): ${formattedThreeHoursBefore}`);

      // 1. 3시간 전 매치에서 참가자 수 부족 매치 처리
      await updateMatchStatusAndExecuteUpdate(
        `SELECT m.id 
         FROM PFB_MATCH m
         LEFT JOIN PFB_MATCH_USER mu ON m.id = mu.match_id
         WHERE m.match_start_time = ?
           AND m.status_code != 4  -- 4인 매치는 제외
         GROUP BY m.id
         HAVING COUNT(mu.user_id) < 18`,
        [formattedThreeHoursBefore],
        4,
        "3시간 전 유저 부족 매치 업데이트 완료"
      );

      // 2. 현재 시작 매치 처리
      await updateMatchStatusAndExecuteUpdate(
        `SELECT id 
         FROM PFB_MATCH 
         WHERE match_start_time = ? 
           AND status_code = 1  -- status_code가 1인 매치만
           AND status_code != 4`, // 4인 매치는 제외
        [formattedNow],
        2,
        "현재 시작 매치 업데이트 완료 (status_code 1 → 2)"
      );

      // 3. 현재 종료 매치 처리
      await updateMatchStatusAndExecuteUpdate(
        `SELECT id 
         FROM PFB_MATCH 
         WHERE match_end_time = ? 
           AND status_code IN (0, 1, 2)  -- status_code가 0, 1, 2인 매치만
           AND status_code != 4`, // 4인 매치는 제외
        [formattedNow],
        3,
        "현재 종료 매치 업데이트 완료 (status_code 0, 1, 2 → 3)"
      );
    } catch (error) {
      console.error("스케줄 작업 중 오류 발생:", error);
    }
  });

  /* 매일 새벽 3시 구동 (구장 설정대로 매치를 생성하는 job) */
  // '0 3 * * *' 매일 새벽 3시마다
  // '0 3 * * 1' 매주 월요일 새벽 3시마다
  // '*/5 * * * *' 매 5분마다 (테스트용)
  schedule.scheduleJob('*/5 * * * *', async () => {
    console.log('job / match.js / scheduleMatchCheck() / 매치 생성 job 동작!')
    const connection = await db.getConnection();  // 커넥션 획득
    try {
      await connection.beginTransaction();

      // 정상 운영중인 구장들의 각 매치 설정을 다 가져옴
      // (rows : 데이터, fields : 컬럼들의 상세 정보)
      const [rows, fields] = await connection.query(
        `SELECT
          B.stadium_id as stadium_id,
          0 as status_code,
          B.match_type as match_type,
          B.allow_gender as allow_gender,
          B.level_criterion as level_criterion,
          DATE_FORMAT(B.match_start_time, '%Y-%m-%d %H:%i') as match_start_time,
          DATE_FORMAT(B.match_end_time, '%Y-%m-%d %H:%i') as match_end_time,
          NULL as manager_id
        FROM
          (SELECT * FROM PFB_STADIUM WHERE status_code = 1) A
        INNER JOIN
          PFB_STADIUM_CONFIG B
        ON 
          A.id = B.stadium_id
        `)

      console.log('job / match.js / scheduleMatchCheck() / 매치 생성 job / match config SELECT 결과 row: ', rows);
      
      rows.map(row => {
        row.match_start_time = getAddedDate(config.schedule.scheduler_match_regist_delay_date, row.match_start_time);
        row.match_end_time = getAddedDate(config.schedule.scheduler_match_regist_delay_date, row.match_end_time);
      })
      console.log('job / match.js / scheduleMatchCheck() / 매치 생성 job / 가공된 rows: ', rows);

      // 매치 INSERT 쿼리
      const valuesArray = rows.map(row => [
        row.status_code,
        row.stadium_id,
        row.manager_id,
        row.match_type,
        row.allow_gender,
        row.level_criterion,
        row.match_start_time.replace('T', ' ').slice(0, 19), // T를 공백으로 변환하고 초 단위까지 잘라냄
        row.match_end_time.replace('T', ' ').slice(0, 19)
      ]);
      console.log('job / match.js / scheduleMatchCheck() / 매치 생성 job / valuesArray: ', valuesArray);
      const flattenedValues = [].concat(...valuesArray);
      console.log('job / match.js / scheduleMatchCheck() / 매치 생성 job / flattenedValues: ', flattenedValues);
      const placeholders = rows.map(() => `(?, ?, ?, ?, ?, ?, ?, ?)`).join(', ');
      const insertResult = await connection.execute(`
      INSERT INTO PFB_MATCH (
        status_code,
        stadium_id,
        manager_id,
        match_type,
        allow_gender,
        level_criterion,
        match_start_time,
        match_end_time
      ) VALUES ${placeholders}
        `, flattenedValues);

      await connection.commit();
      // 완료를 파일이나 DB에 시간과 함께 남기는 코드
      console.log('job / match.js / scheduleMatchCheck() / 매치 생성 job / successful commit rows : ', insertResult[0].affectedRows);

    }catch(error){
      await connection.rollback();
      // 실패를 파일이나 DB에 시간과 함께 남기는 코드
      console.error('job / match.js / scheduleMatchCheck() / 매치 생성 job / rollback except\n\n\n', error);
    }finally{
      connection.release(); // 커넥션 반환
    }
  })
}

function createUTCDateFromString(dateString) {
  // 날짜와 시간을 분리 ("2025-01-04 00:00" -> ["2025-01-04", "00:00"])
  const [datePart, timePart] = dateString.split(' ');

  // 날짜 부분을 더 분리 ("2025-01-04" -> ["2025", "01", "04"])
  const [year, month, day] = datePart.split('-').map(Number);

  // 시간 부분을 더 분리 ("00:00" -> ["00", "00"])
  const [hours, minutes] = timePart.split(':').map(Number);

  // Date.UTC를 사용하여 Date 객체 반환
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

// 시간과 분을 지키면서 num만큼 일자를 미루는 함수
function getAddedDate(num, dateString) {
  
  // num만큼 날짜 더하기
  const dateTime = createUTCDateFromString(dateString);
  console.error('job / match.js / getAddedDate(num, dateString) createUTCDateFromString(dateString) 반환값 : ', dateTime);
  dateTime.setDate(dateTime.getDate() + num);

  // 결과를 'YYYY-MM-DD HH:mm:ss' 형식으로 포맷
  const year = dateTime.getUTCFullYear(); // UTC 연도
  const month = dateTime.getUTCMonth() + 1; // UTC 월 (0부터 시작하므로 1을 더함)
  const day = dateTime.getUTCDate(); // UTC 일
  const hours = dateTime.getUTCHours(); // UTC 시
  const minutes = dateTime.getUTCMinutes(); // UTC 분
  const seconds = dateTime.getUTCSeconds(); // UTC 초

  // 각 구성 요소를 두 자리로 맞추기 위해 문자열 형식 조정
  const formattedMonth = month < 10 ? '0' + month : month;
  const formattedDay = day < 10 ? '0' + day : day;
  const formattedHours = hours < 10 ? '0' + hours : hours;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

  // 최종 문자열 생성
  return `${year}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}