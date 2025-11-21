import { supabase } from "../supabaseClient";

export async function notifyTodayMeetings() {
  try {
    const { data, error } = await supabase.functions.invoke(
      "notify-today-meetings",
      {
        body: {}, // 특별히 보낼 데이터는 없음
      }
    );

    if (error) {
      console.error("notify-today-meetings 에러:", error);
      alert("알림 요청 중 오류가 발생했습니다.");
      return;
    }

    console.log("notify-today-meetings 결과:", data);
    if (data?.ok && data.meetings > 0) {
      alert(`FCM 푸시 전송 시도: 오늘 회의 ${data.meetings}건`);
    } else {
      alert("오늘 예정된 회의가 없거나, 푸시 토큰이 없습니다.");
    }
  } catch (e) {
    console.error("notifyTodayMeetings 호출 에러:", e);
  }
}
