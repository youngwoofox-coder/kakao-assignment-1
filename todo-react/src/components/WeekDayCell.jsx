import { memo } from 'react';
import PropTypes from 'prop-types';
import { DAY_LABELS } from '../utils/dateUtils';

/**
 * 주간 네비의 개별 날짜 셀
 *
 * React.memo 적용 이유:
 * - date      : weekDates는 useMemo([selectedDate]) → 같은 주 내에서는 동일 인스턴스
 * - dateKey   : 같은 주 내에서 불변인 string 원시값
 * - isSelected: 선택 변경 시 정확히 2개 셀만 바뀜 (이전 선택 해제 + 새 선택)
 * - count     : todo 추가 시 해당 날짜 셀만 바뀜
 * - onSelect  : useState의 setter(setSelectedDate) → React가 안정성 보장
 *
 * WeekNav가 re-render될 때 변경된 props를 가진 셀만 실제로 re-render한다
 */
const WeekDayCell = memo(function WeekDayCell({
  date,
  dateKey,
  isSelected,
  isToday,
  count,
  onSelect,
}) {
  const cellClass = [
    'flex-1 flex flex-col items-center gap-[3px] py-2 px-0.5 rounded-[10px] cursor-pointer border-0 transition-all min-w-0',
    isSelected ? 'bg-primary' : 'bg-transparent hover:bg-page',
  ].join(' ');

  // 선택 > 오늘 > 기본 순서로 색상 우선순위 결정
  const labelClass = [
    'text-[11px] font-medium leading-none',
    isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-faint',
  ].join(' ');

  const numberClass = [
    'text-[16px] font-semibold leading-[1.2]',
    isSelected ? 'text-white' : isToday ? 'text-primary' : 'text-body',
  ].join(' ');

  const countClass = [
    'text-[10px] font-bold rounded-[10px] px-[5px] py-[1px] min-w-[18px] text-center leading-[1.6]',
    isSelected ? 'bg-white/28 text-white' : 'bg-primary-light text-primary',
  ].join(' ');

  return (
    <button
      className={cellClass}
      aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
      onClick={() => onSelect(dateKey)}
    >
      <span className={labelClass}>{DAY_LABELS[date.getDay()]}</span>
      <span className={numberClass}>{date.getDate()}</span>
      {count > 0 && <span className={countClass}>{count}</span>}
    </button>
  );
});

WeekDayCell.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  dateKey: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isToday: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default WeekDayCell;
