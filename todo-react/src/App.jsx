import { useState, useMemo, useCallback } from 'react';
import { useTodos } from './hooks/useTodos';
import { useDateNavigation } from './hooks/useDateNavigation';
import MonthNav from './components/MonthNav';
import WeekNav from './components/WeekNav';
import TodoInput from './components/TodoInput';
import FilterTabs from './components/FilterTabs';
import TodoList from './components/TodoList';

/**
 * App.jsx 역할: 상태 선언 + 컴포넌트 조합 + UI 렌더링
 * - Todo 로직  → useTodos
 * - 날짜 로직  → useDateNavigation
 */
function App() {
  const { todos, addTodo, toggleTodo, updateTodo, deleteTodo } = useTodos();
  const {
    selectedDate,
    setSelectedDate,
    changeMonth,
    movePrevWeek,
    moveNextWeek,
    weekDates,
  } = useDateNavigation();

  const [currentFilter, setCurrentFilter] = useState('all');

  // todos가 바뀔 때만 재계산 — WeekNav에 안정적인 참조 전달
  // currentFilter 변경 시에는 countByDate가 유지되므로 WeekNav re-render 없음
  const countByDate = useMemo(
    () =>
      todos.reduce((map, t) => {
        map[t.date] = (map[t.date] ?? 0) + 1;
        return map;
      }, {}),
    [todos]
  );

  // changeMonth는 useCallback([]) → 안정적이므로 아래 두 핸들러도 안정적
  const handlePrevMonth = useCallback(() => changeMonth(-1), [changeMonth]);
  const handleNextMonth = useCallback(() => changeMonth(1), [changeMonth]);

  // addTodo는 useCallback([]) (함수형 업데이터 패턴) → selectedDate 변경 시만 재생성
  const handleAddTodo = useCallback(
    (text) => addTodo(text, selectedDate),
    [addTodo, selectedDate]
  );

  return (
    <div className="min-h-screen bg-page text-body flex justify-center py-12 px-4 font-sans">
      <div className="w-full max-w-[560px] flex flex-col gap-4">
        <h1 className="text-[28px] font-bold text-primary tracking-tight m-0">Todo</h1>

        <MonthNav
          selectedDate={selectedDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* weekDates, countByDate, movePrevWeek, moveNextWeek 모두 안정적 참조
            → React.memo(WeekNav)가 실제로 re-render를 건너뜀 */}
        <WeekNav
          weekDates={weekDates}
          countByDate={countByDate}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onPrevWeek={movePrevWeek}
          onNextWeek={moveNextWeek}
        />

        <TodoInput onAdd={handleAddTodo} />

        <FilterTabs currentFilter={currentFilter} onFilterChange={setCurrentFilter} />

        <TodoList
          todos={todos}
          selectedDate={selectedDate}
          currentFilter={currentFilter}
          onToggle={toggleTodo}
          onEdit={updateTodo}
          onDelete={deleteTodo}
        />
      </div>
    </div>
  );
}

export default App;
