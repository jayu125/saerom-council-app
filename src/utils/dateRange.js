export function monthRangeUTC(year, month) {
  // month: 1~12
  const startLocal = new Date(year, month - 1, 1, 0, 0, 0);
  const endLocal = new Date(year, month, 0, 23, 59, 59, 999); // 말일 23:59:59.999
  return {
    start: startLocal.toISOString(), // timestamptz 비교에 사용
    end: endLocal.toISOString(),
  };
}

export function ymdToISO(year, month, day, hour = 9, minute = 0) {
  // 사용자의 Asia/Seoul 로컬 시각으로 구성 -> ISO 문자열
  const local = new Date(year, month - 1, day, hour, minute, 0, 0);
  return local.toISOString();
}
