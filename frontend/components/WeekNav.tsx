import { formatDateKey } from "@/lib/dateUtils";
import WeekDayCell from "@/components/WeekDayCell";

interface WeekNavProps {
  weekDates: Date[];
  countByDate: Record<string, number>;
  selectedDate: string;
  todayKey: string;
  onSelectDate: (dateKey: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

const arrowBtnClass =
  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border-0 bg-zinc-50 text-xl font-bold text-[#672be0] transition hover:bg-[#f3edff]";

export default function WeekNav({
  weekDates,
  countByDate,
  selectedDate,
  todayKey,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}: WeekNavProps) {
  return (
    <div className="flex items-center gap-2 rounded-[14px] bg-white px-3.5 py-3 shadow-[0_2px_12px_rgba(103,43,224,0.08)]">
      <button type="button" aria-label="이전 주" onClick={onPrevWeek} className={arrowBtnClass}>
        ‹
      </button>
      <div className="flex flex-1 gap-1">
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
      <button type="button" aria-label="다음 주" onClick={onNextWeek} className={arrowBtnClass}>
        ›
      </button>
    </div>
  );
}
