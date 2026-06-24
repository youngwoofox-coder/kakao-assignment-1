import { formatMonth, parseDate } from "@/lib/dateUtils";

interface MonthNavProps {
  selectedDate: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function MonthNav({
  selectedDate,
  onPrevMonth,
  onNextMonth,
}: MonthNavProps) {
  return (
    <div className="flex items-center justify-between rounded-[14px] bg-white px-5 py-4 shadow-[0_2px_12px_rgba(103,43,224,0.08)]">
      <button
        type="button"
        aria-label="이전 월"
        onClick={onPrevMonth}
        className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border-0 bg-[#f3edff] text-lg font-bold text-[#672be0] transition hover:bg-[#e8dcff]"
      >
        «
      </button>
      <span className="text-xl font-bold tracking-tight text-[#672be0]">
        {formatMonth(parseDate(selectedDate))}
      </span>
      <button
        type="button"
        aria-label="다음 월"
        onClick={onNextMonth}
        className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border-0 bg-[#f3edff] text-lg font-bold text-[#672be0] transition hover:bg-[#e8dcff]"
      >
        »
      </button>
    </div>
  );
}
