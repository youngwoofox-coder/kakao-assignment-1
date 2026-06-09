import { useState, useEffect, useCallback } from 'react';

// localStorage에서 todos 배열을 불러온다. 파싱 실패 시 빈 배열 반환
function loadTodos() {
  try {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/**
 * Todo CRUD + localStorage 동기화를 담당하는 커스텀 훅
 * App.jsx가 UI 조합에만 집중할 수 있도록 데이터 레이어를 분리한다
 */
export function useTodos() {
  const [todos, setTodos] = useState(loadTodos);

  // todos가 변경될 때마다 localStorage에 자동 저장 (단일 저장 통로)
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // useCallback + 함수형 업데이터 패턴:
  // setTodos((prev) => ...) 형태로 최신 state를 읽으므로 deps 배열이 빈 채로 안정적
  // → 반환된 함수들이 마운트 시 1회만 생성되어 불필요한 자식 re-render를 방지한다

  // 새 todo 추가. id는 기존 최댓값 + 1 (reduce로 spread 한계 방지)
  const addTodo = useCallback((text, date) => {
    setTodos((prev) => {
      const newId = prev.reduce((max, t) => Math.max(max, t.id), 0) + 1;
      return [...prev, { id: newId, text, completed: false, date }];
    });
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const updateTodo = useCallback((id, newText) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: newText } : t))
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { todos, addTodo, toggleTodo, updateTodo, deleteTodo };
}
