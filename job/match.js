import { db } from "../mysql.js";
import schedule from "node-schedule";
import { config } from "../config.js";
import { sendEmail } from "../utils/email.js";

// 이메일로 실행 오류시 알려주는 로직 필요!!!

// 현재 시간을 KST(한국 시간)으로 변환
function getKoreanTime() {
  const now = new Date();
  const koreanOffset = 9 * 60 * 60 * 1000; // UTC+9
  const koreanTime = new Date(now.getTime() + koreanOffset);
  return koreanTime;
}

// 특정 조건으로 PFB_MATCH 업데이트
async function executeWithRetries(query, params, logMessage) {
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      console.log(`[재시도 ${attempt + 1}/${maxAttempts}] 실행 중: ${logMessage}`);
      const [result] = await db.execute(query, params);
      console.log(`${logMessage} 성공: ${JSON.stringify(result)}`);
      return result; // 성공 시 반환

    } catch (error) {
      attempt++;
      console.error(`[실패 ${attempt}/${maxAttempts}] ${logMessage} 오류 발생: ${error.message}`);

      if (attempt < maxAttempts) {
        const delay = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
        console.log(`${delay / 1000}초 후 재시도합니다...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`최대 재시도 초과 - 관리자에게 이메일 전송`);

        const errorMessage = `${logMessage} 실패: ${error.message}\nStack Trace:\n${error.stack}`;
        sendEmail({
          to: config.admin_account.email,
          subject: `[시스템 오류 발생] ${logMessage} 실패`,
          text: errorMessage,
        }).catch(mailError => {
          console.error("관리자 이메일 전송 실패:", mailError);
        });

        throw error;
      }
    }
  }
}

// 특정 조건으로 PFB_MATCH 업데이트
async function updateMatchStatusAndExecuteUpdate(query, params, statusCode, logMessage) {
  console.log(`실행 중: ${logMessage}`);

  const matches = await executeWithRetries(query, params, logMessage);
  console.log(`${logMessage} 조회 결과:`, matches); // 조회된 데이터 직접 출력

  if (matches.length > 0) {
    const matchIds = matches.map((match) => match.id);
    console.log(`업데이트할 Match IDs: ${matchIds}`);

    if (matchIds.length > 0) {
      const updateQuery = `UPDATE PFB_MATCH SET status_code = ? WHERE id IN (${matchIds.map(() => "?").join(",")})`;
      const updateParams = [statusCode, ...matchIds];

      const result = await executeWithRetries(updateQuery, updateParams, `${logMessage} - 매치 상태 업데이트`);
      console.log(`${logMessage} - 업데이트된 행 수: ${result.affectedRows}`);
    }
  } else {
    console.log(`${logMessage}: 조건에 맞는 매치가 없습니다.`);
  }
}

// 스케줄러 작업
export async function scheduleMatchCheck() {
  console.log("스케줄 작업이 시작되었습니다.");

  /* 매치 상태 업데이트 Job (1시간마다) */
  schedule.scheduleJob(config.scheduler.match_status_change_cron, async () => {
    console.log("매 시간마다 매치 상태 업데이트 실행...");

    try {
      const now = getKoreanTime();
      const formattedNow = now.toISOString().slice(0, 19).replace("T", " ");
      const threeHoursBefore = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      const formattedThreeHoursBefore = threeHoursBefore.toISOString().slice(0, 19).replace("T", " ");

      console.log(`현재 시간(KST): ${formattedNow}, 3시간 전(KST): ${formattedThreeHoursBefore}`);

      // 1. 3시간 전 참가자 부족 매치 처리
      console.log("⚡ [STEP 1] 3시간 전 유저 부족 매치 업데이트 시작");
      await updateMatchStatusAndExecuteUpdate(
        `SELECT m.id 
         FROM PFB_MATCH m
         LEFT JOIN PFB_MATCH_USER mu ON m.id = mu.match_id
         WHERE m.match_start_time BETWEEN ? AND ?  
           AND m.status_code = 0
         GROUP BY m.id
         HAVING COUNT(mu.user_id) < 18`,
        [formattedThreeHoursBefore, formattedNow],
        4,
        "3시간 전 유저 부족 매치 업데이트"
      );
      console.log('1번째의 formattedThreeHoursBefore',formattedThreeHoursBefore);
      console.log("✅ [STEP 1] 3시간 전 유저 부족 매치 업데이트 완료");

      // 2. 현재 시작 매치 처리
      console.log("⚡ [STEP 2] 현재 시작 매치 업데이트 시작");
      await updateMatchStatusAndExecuteUpdate(
        `SELECT id 
         FROM PFB_MATCH 
         WHERE ? BETWEEN match_start_time AND match_end_time 
           AND status_code = 1`,
        [formattedNow],
        2,
        "현재 시작 매치 업데이트"
      );
      console.log("2번째의 formattedNow",formattedNow);
      console.log("✅ [STEP 2] 현재 시작 매치 업데이트 완료");

      // 3. 현재 종료 매치 처리
      console.log("⚡ [STEP 3] 현재 종료 매치 업데이트 시작");
      await updateMatchStatusAndExecuteUpdate(
        `SELECT id 
         FROM PFB_MATCH 
         WHERE match_end_time < ?
           AND status_code IN (0, 1, 2)`,
        [formattedNow],
        3,
        "현재 종료 매치 업데이트"
      );

      console.log("3번째째의 formattedNow",formattedNow);
      console.log("✅ [STEP 3] 현재 종료 매치 업데이트 완료");

      console.log("✅ [매치 상태 업데이트] 전체 완료");
    } catch (error) {
      console.error("매치 상태 업데이트 작업 중 오류 발생:", error);
    }
  });

  /* 매치 삭제 스케줄러 (하루마다 실행) */
  schedule.scheduleJob(config.scheduler.match_regist_cron, async () => {
    console.log("매 시간마다 7일 범위 매치 삭제 스케줄 작업 실행...");

    try {
      const now = getKoreanTime();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysLater = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

      const formattedStart = startOfToday.toISOString().slice(0, 19).replace("T", " ");
      const formattedEnd = sevenDaysLater.toISOString().slice(0, 19).replace("T", " ");

      console.log(`삭제 대상 기간: ${formattedStart} ~ ${formattedEnd}`);

      await executeWithRetries(
        `DELETE FROM PFB_MATCH
         WHERE manager_id IS NULL
           AND match_start_time >= ?
           AND match_start_time < ?`,
        [formattedStart, formattedEnd],
        "7일 범위 매치 삭제"
      );

    } catch (error) {
      console.error("7일 범위 매치 삭제 작업 중 오류 발생:", error.message);
    }
  });
}
  /* 매일 새벽 3시 구동 (구장 설정대로 매치를 생성하는 job) */
  schedule.scheduleJob(config.scheduler.match_regist_cron, async () => {
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
        row.match_start_time = getAddedDate(config.scheduler.match_regist_delay_date, row.match_start_time);
        row.match_end_time = getAddedDate(config.scheduler.match_regist_delay_date, row.match_end_time);
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


/** DB에서 받은 datetime string을 30일 뒤 UTC시간으로 리턴 */
function getAddedDate(num, dateString) {
  console.log('num: ', num, ' dateString: ', dateString);
  
  // DB에서 받아온 날짜 string값에서 '시', '분'만 뽑는다
  let [hour, minute] = dateString.split(' ')[1].split(':').map(item => parseInt(item, 10));
  console.log('hour = ', hour, ' minute = ', minute);

  // 현재시간 now를 UTC시간으로 환산 후 '연', '월', '일' 획득
  let [year, month, day] = new Date().toISOString().split('T')[0].split('-').map(item => parseInt(item, 10));
  month -= 1;
  console.log('year = ', year, ' month = ', month, ' day = ', day);
  let timestamp = Date.UTC(year, month, day, hour, minute);
  timestamp += num*24*60*60*1000;
  return new Date(timestamp).toISOString().split('.')[0].replace('T', ' ');
}