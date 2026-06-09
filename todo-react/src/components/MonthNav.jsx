import PropTypes from 'prop-types';
import { formatMonth, parseDate } from '../utils/dateUtils';

// 월 네비게이션: 이전/다음 달 이동 + 현재 월 표시
// selectedDate: "YYYY-MM-DD" 문자열 — formatMonth 사용 전 parseDate로 변환
function MonthNav({ selectedDate, onPrevMonth, onNextMonth }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-[14px] px-5 py-4 shadow-[0_2px_12px_rgba(103,43,224,0.08)]">
      <button
        className="w-[38px] h-[38px] rounded-[10px] bg-primary-light text-primary text-[18px] font-bold flex items-center justify-center cursor-pointer hover:bg-primary-dim active:scale-[0.92] transition-all border-0"
        aria-label="이전 월"
        onClick={onPrevMonth}
      >
        «
      </button>
      <span className="text-[20px] font-bold text-primary tracking-tight">
        {formatMonth(parseDate(selectedDate))}
      </span>
      <button
        className="w-[38px] h-[38px] rounded-[10px] bg-primary-light text-primary text-[18px] font-bold flex items-center justify-center cursor-pointer hover:bg-primary-dim active:scale-[0.92] transition-all border-0"
        aria-label="다음 월"
        onClick={onNextMonth}
      >
        »
      </button>
    </div>
  );
}

MonthNav.propTypes = {
  selectedDate: PropTypes.string.isRequired,
  onPrevMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired,
};

export default MonthNav;
