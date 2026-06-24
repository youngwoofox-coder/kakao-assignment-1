"use client";

import MonthNav from "@/components/MonthNav";
import WeekNav from "@/components/WeekNav";
import {
  changeMonth,
  changeWeek,
  getTodayKey,
  getWeekDates,
  parseDate,
} from "@/lib/dateUtils";
import { useRouter, useSearchParams } from "next/navigation";

interface DateNavigationProps {
  countByDate: Record<string, number>;
}

export default function DateNavigation({ countByDate }: DateNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("date") ?? getTodayKey();

  function pushDate(nextDate: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextDate === getTodayKey()) {
      params.delete("date");
    } else {
      params.set("date", nextDate);
    }

    const query = params.toString();
    router.push(query ? `/todos?${query}` : "/todos");
  }

  const weekDates = getWeekDates(parseDate(selectedDate));

  return (
    <div className="flex flex-col gap-4">
      <MonthNav
        selectedDate={selectedDate}
        onPrevMonth={() => pushDate(changeMonth(selectedDate, -1))}
        onNextMonth={() => pushDate(changeMonth(selectedDate, 1))}
      />
      <WeekNav
        weekDates={weekDates}
        countByDate={countByDate}
        selectedDate={selectedDate}
        todayKey={getTodayKey()}
        onSelectDate={pushDate}
        onPrevWeek={() => pushDate(changeWeek(selectedDate, -1))}
        onNextWeek={() => pushDate(changeWeek(selectedDate, 1))}
      />
    </div>
  );
}
