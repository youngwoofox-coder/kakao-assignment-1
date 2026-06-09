import { useState, useMemo, useCallback } from 'react';
import { formatDateKey, parseDate, getWeekDates } from '../utils/dateUtils';

/**
 * 날짜 상태 및 이동 로직을 담당하는 커스텀 훅
 * App.jsx에서 날짜 비즈니스 로직을 분리해 관심사를 명확히 구분한다
 *
 * useCallback + 함수형 업데이터 패턴 사용 이유:
 * - setSelectedDate((prev) => ...) 형태로 최신 state를 읽으므로 deps 배열이 빈 채로 안정적
 * - 안정적인 함수 참조 덕분에 React.memo(WeekNav)가 실제로 re-render를 건너뛸 수 있다
 */
export function useDateNavigation() {
  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));

  // 월 이동: 월말 날짜 클램핑 처리 (예: 1월 31일 → 2월 이동 시 마지막 날로 보정)
  const changeMonth = useCallback((offset) => {
    setSelectedDate((prev) => {
      const [y, m, d] = prev.split('-').map(Number);
      const base = new Date(y, m - 1, 1); // 1일로 고정 후 이동해 날짜 오버플로 방지
      base.setMonth(base.getMonth() + offset);
      const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
      base.setDate(Math.min(d, lastDay));
      return formatDateKey(base);
    });
  }, []);

  const movePrevWeek = useCallback(() => {
    setSelectedDate((prev) => {
      const date = parseDate(prev);
      date.setDate(date.getDate() - 7);
      return formatDateKey(date);
    });
  }, []);

  const moveNextWeek = useCallback(() => {
    setSelectedDate((prev) => {
      const date = parseDate(prev);
      date.setDate(date.getDate() + 7);
      return formatDateKey(date);
    });
  }, []);

  const movePrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const date = parseDate(prev);
      date.setDate(date.getDate() - 1);
      return formatDateKey(date);
    });
  }, []);

  const moveNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const date = parseDate(prev);
      date.setDate(date.getDate() + 1);
      return formatDateKey(date);
    });
  }, []);

  // selectedDate가 바뀔 때만 재계산 — WeekNav에 안정적인 배열 전달
  const weekDates = useMemo(() => getWeekDates(parseDate(selectedDate)), [selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    changeMonth,
    movePrevWeek,
    moveNextWeek,
    movePrevDay,
    moveNextDay,
    weekDates,
  };
}
