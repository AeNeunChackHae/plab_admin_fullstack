import { db } from "../mysql.js";
import schedule from "node-schedule";

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
    console.log("매 1시간 마마다 스케줄 작업 실행...");

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
}
