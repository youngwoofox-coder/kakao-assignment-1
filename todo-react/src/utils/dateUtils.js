// 요일 레이블 (일요일=0 기준, JS Date.getDay()와 인덱스 일치)
export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

// "YYYY-MM-DD" → Date 객체 (로컬 시간 기준, UTC 시차 문제 없음)
export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Date → "YYYY-MM-DD" (todos 저장 및 날짜 비교에 사용)
export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Date → "YYYY년 M월" (월 네비게이션 표시에 사용)
export function formatMonth(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

// date가 속한 주의 월요일~일요일 Date 배열 7개 반환
export function getWeekDates(date) {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);
  const day = base.getDay();
  // 일요일(0)이면 -6, 나머지는 1-day
  const diffToMonday = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diffToMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}
