import { useMemo } from 'react';
import PropTypes from 'prop-types';
import TodoItem from './TodoItem';

// 빈 상태 메시지: 현재 필터에 따라 안내 문구 분기
function getEmptyMessage(filter) {
  if (filter === 'active') return '진행 중인 할 일이 없습니다.';
  if (filter === 'completed') return '완료된 할 일이 없습니다.';
  return '이 날짜의 할 일이 없습니다.';
}

// Todo 목록: 날짜 필터 → 상태 필터 → 렌더링
// selectedDate가 "YYYY-MM-DD" 문자열이므로 변환 없이 직접 비교
function TodoList({ todos, selectedDate, currentFilter, onToggle, onEdit, onDelete }) {
  const filteredTodos = useMemo(
    () =>
      todos
        .filter((todo) => todo.date === selectedDate)
        .filter((todo) => {
          if (currentFilter === 'active') return !todo.completed;
          if (currentFilter === 'completed') return todo.completed;
          return true; // 'all'
        }),
    [todos, selectedDate, currentFilter]
  );

  return (
    <ul className="flex flex-col gap-2.5 p-0 m-0">
      {filteredTodos.length === 0 ? (
        <li className="text-center py-10 px-5 text-empty text-[15px] bg-white rounded-[12px] shadow-[0_2px_8px_rgba(103,43,224,0.06)] list-none">
          {getEmptyMessage(currentFilter)}
        </li>
      ) : (
        filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}
    </ul>
  );
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedDate: PropTypes.string.isRequired,
  currentFilter: PropTypes.oneOf(['all', 'active', 'completed']).isRequired,
  onToggle: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TodoList;
