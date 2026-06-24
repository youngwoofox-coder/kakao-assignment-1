import { DAY_LABELS } from "@/lib/dateUtils";

interface WeekDayCellProps {
  date: Date;
  dateKey: string;
  isSelected: boolean;
  isToday: boolean;
  count: number;
  onSelect: (dateKey: string) => void;
}

export default function WeekDayCell({
  date,
  dateKey,
  isSelected,
  isToday,
  count,
  onSelect,
}: WeekDayCellProps) {
  return (
    <button
      type="button"
      aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
      onClick={() => onSelect(dateKey)}
      className={`flex min-w-0 flex-1 flex-col items-center gap-[3px] rounded-[10px] border-0 px-0.5 py-2 transition ${
        isSelected ? "bg-[#672be0]" : "bg-transparent hover:bg-zinc-50"
      }`}
    >
      <span
        className={`text-[11px] font-medium leading-none ${
          isSelected ? "text-white" : isToday ? "text-[#672be0]" : "text-zinc-400"
        }`}
      >
        {DAY_LABELS[date.getDay()]}
      </span>
      <span
        className={`text-base font-semibold leading-tight ${
          isSelected ? "text-white" : isToday ? "text-[#672be0]" : "text-zinc-800"
        }`}
      >
        {date.getDate()}
      </span>
      {count > 0 && (
        <span
          className={`min-w-[18px] rounded-[10px] px-[5px] py-[1px] text-center text-[10px] font-bold leading-snug ${
            isSelected
              ? "bg-white/30 text-white"
              : "bg-[#f3edff] text-[#672be0]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
