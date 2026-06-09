import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatDateKey } from '../utils/dateUtils';
import WeekDayCell from './WeekDayCell';

// 컴포넌트 외부 상수 — 렌더링과 무관한 문자열이므로 매번 생성할 필요 없음
const arrowBtnClass =
  'flex-shrink-0 w-8 h-8 rounded-lg bg-page text-primary text-[20px] font-bold flex items-center justify-center cursor-pointer hover:bg-primary-light active:scale-[0.92] transition-all border-0';

/**
 * 주간 네비게이션 컴포넌트
 *
 * React.memo 적용 이유:
 * - weekDates  : useDateNavigation의 useMemo → selectedDate 변경 시에만 새 배열
 * - countByDate: App의 useMemo          → todos 변경 시에만 새 객체
 * - selectedDate: 문자열 원시값         → 값 비교로 안정적
 * - onSelectDate: useState의 setter     → React가 안정성 보장
 * - onPrevWeek, onNextWeek: useCallback([]) → 마운트 시 1회 생성, 이후 불변
 *
 * WeekDayCell에 onSelect={onSelectDate}(안정적)와 dateKey(string 원시값)를 전달해
 * React.memo(WeekDayCell)이 변경된 셀만 선택적으로 re-render할 수 있도록 한다
 */
const WeekNav = memo(function WeekNav({
  weekDates,
  countByDate,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) {
  // 오늘 날짜 키 — 앱 실행 중 변하지 않으므로 마운트 시 1회만 계산
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  return (
    <div className="flex items-center gap-2 bg-white rounded-[14px] px-3.5 py-3 shadow-[0_2px_12px_rgba(103,43,224,0.08)]">
      <button className={arrowBtnClass} aria-label="이전 주" onClick={onPrevWeek}>
        ‹
      </button>
      <div className="flex-1 flex gap-1">
        {weekDates.map((date) => {
          const dateKey = formatDateKey(date);
          return (
            <WeekDayCell
              key={dateKey}
              date={date}
              dateKey={dateKey}
              isSelected={dateKey === selectedDate}
              isToday={dateKey === todayKey}
              count={countByDate[dateKey] ?? 0}
              onSelect={onSelectDate}
            />
          );
        })}
      </div>
      <button className={arrowBtnClass} aria-label="다음 주" onClick={onNextWeek}>
        ›
      </button>
    </div>
  );
});

WeekNav.propTypes = {
  weekDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  countByDate: PropTypes.objectOf(PropTypes.number).isRequired,
  selectedDate: PropTypes.string.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  onPrevWeek: PropTypes.func.isRequired,
  onNextWeek: PropTypes.func.isRequired,
};

export default WeekNav;
