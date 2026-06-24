import { describe, expect, it } from "vitest";
import {
  buildCountByDate,
  changeMonth,
  changeWeek,
  formatDateKey,
  formatMonth,
  getWeekDates,
  parseDate,
} from "./dateUtils";

describe("parseDate", () => {
  it("UTC가 아닌 로컬 타임존 기준으로 날짜를 만든다", () => {
    const date = parseDate("2026-06-24");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(24);
  });
});

describe("formatDateKey / parseDate 라운드트립", () => {
  it("문자열로 만든 Date를 다시 같은 문자열로 되돌린다", () => {
    expect(formatDateKey(parseDate("2026-01-05"))).toBe("2026-01-05");
    expect(formatDateKey(parseDate("2026-12-31"))).toBe("2026-12-31");
  });
});

describe("formatMonth", () => {
  it("년/월 한글 형식으로 포맷한다", () => {
    expect(formatMonth(parseDate("2026-06-24"))).toBe("2026년 6월");
  });
});

describe("getWeekDates", () => {
  it("월요일부터 시작하는 7일을 반환한다 (평일 입력)", () => {
    const week = getWeekDates(parseDate("2026-06-24")); // 수요일
    expect(formatDateKey(week[0])).toBe("2026-06-22"); // 월요일
    expect(formatDateKey(week[6])).toBe("2026-06-28"); // 일요일
    expect(week).toHaveLength(7);
  });

  it("일요일을 넣어도 그 주의 월요일부터 시작한다", () => {
    const week = getWeekDates(parseDate("2026-06-28")); // 일요일
    expect(formatDateKey(week[0])).toBe("2026-06-22");
    expect(formatDateKey(week[6])).toBe("2026-06-28");
  });
});

describe("changeMonth", () => {
  it("말일 기준 다음 달로 이동하면 그 달의 마지막 날로 클램핑한다", () => {
    expect(changeMonth("2026-01-31", 1)).toBe("2026-02-28");
  });

  it("연말에서 다음 달로 이동하면 연도가 증가한다", () => {
    expect(changeMonth("2026-12-15", 1)).toBe("2027-01-15");
  });

  it("연초에서 이전 달로 이동하면 연도가 감소한다", () => {
    expect(changeMonth("2026-01-15", -1)).toBe("2025-12-15");
  });
});

describe("changeWeek", () => {
  it("7일 단위로 이동한다", () => {
    expect(changeWeek("2026-06-24", 1)).toBe("2026-07-01");
    expect(changeWeek("2026-06-24", -1)).toBe("2026-06-17");
  });
});

describe("buildCountByDate", () => {
  it("빈 배열이면 빈 객체를 반환한다", () => {
    expect(buildCountByDate([])).toEqual({});
  });

  it("같은 날짜의 todo를 개수로 집계한다", () => {
    const todos = [
      { date: "2026-06-24" },
      { date: "2026-06-24" },
      { date: "2026-06-25" },
    ];
    expect(buildCountByDate(todos)).toEqual({
      "2026-06-24": 2,
      "2026-06-25": 1,
    });
  });
});
