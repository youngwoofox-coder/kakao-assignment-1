// ===== DOM 요소 참조 =====
const todoInput = document.getElementById("todoInput");
const addButton = document.getElementById("addButton");
const todoList = document.getElementById("todoList");
const validationMessage = document.getElementById("validationMessage");
const filterTabButtons = document.querySelectorAll(".filter-tab");
const prevMonthButton = document.getElementById("prevMonthButton");
const nextMonthButton = document.getElementById("nextMonthButton");
const monthDisplay = document.getElementById("monthDisplay");
const prevWeekButton = document.getElementById("prevWeekButton");
const nextWeekButton = document.getElementById("nextWeekButton");
const weekDatesContainer = document.getElementById("weekDates");

// ===== LocalStorage 키 =====
const STORAGE_KEY = "todos";

// 요일 레이블 (일요일=0 기준, JS Date.getDay()와 인덱스 일치)
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

// ===== 상태(State) =====
// todos: 모든 Todo 데이터 배열 (단일 진실 공급원)
// { id: number, text: string, completed: boolean, date: string("YYYY-MM-DD") }
let todos = [];
let nextId = 1;

// currentFilter: 상태 필터 ("all" | "active" | "completed")
let currentFilter = "all";

// selectedDate: 현재 선택된 날짜 (Date 객체)
// 월 표시, 주간 뷰, Todo 목록 조회 모두 이 값 기준으로 동작
let selectedDate = new Date();

// ===== LocalStorage 유틸 =====

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  const savedTodos = localStorage.getItem(STORAGE_KEY);
  if (!savedTodos) return [];
  try {
    return JSON.parse(savedTodos);
  } catch (error) {
    return [];
  }
}

// ===== 날짜 유틸 =====

// Date 객체 → "YYYY-MM-DD" 문자열 (todos 저장 및 비교에 사용)
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Date 객체 → "2026년 6월" 형식 (월 네비게이션 표시에 사용)
function formatMonth(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

// ===== 월 네비게이션 =====

// selectedDate의 월을 offset만큼 이동한다 (+1: 다음 달, -1: 이전 달)
// 월말 날짜 보정: 예) 1월 31일 → 2월 이동 시 2월의 마지막 날로 클램핑
function changeMonth(offset) {
  const originalDay = selectedDate.getDate();

  // 날짜를 1일로 먼저 고정한 뒤 월을 변경해 날짜 오버플로를 방지한다
  // 예) new Date(2026, 0, 31).setMonth(1) → 3월 3일로 밀림 방지
  const target = new Date(selectedDate);
  target.setDate(1);
  target.setMonth(target.getMonth() + offset);

  // 이동한 월의 마지막 날을 구해 원래 일(day)을 클램핑한다
  const lastDayOfTargetMonth = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();

  target.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  selectedDate = target;
  render();
}

// ===== 월 표시 렌더링 =====
function renderMonth() {
  monthDisplay.textContent = formatMonth(selectedDate);
}

// ===== 주간 유틸 =====

// date가 속한 주의 월요일부터 일요일까지 Date 배열 7개를 반환한다
function getWeekDates(date) {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);

  const day = base.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  base.setDate(base.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return d;
  });
}

// 특정 날짜의 Todo 전체 개수를 반환한다 (필터 무관)
function getTodoCountByDateKey(dateKey) {
  return todos.filter((t) => t.date === dateKey).length;
}

// ===== 주간 네비게이션 렌더링 =====
function renderWeekNav() {
  const weekDates = getWeekDates(selectedDate);
  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);

  weekDatesContainer.innerHTML = "";

  weekDates.forEach((date) => {
    const dateKey = formatDateKey(date);
    const isSelected = dateKey === selectedKey;
    const isToday = dateKey === todayKey;
    const count = getTodoCountByDateKey(dateKey);

    const cell = document.createElement("button");
    const classNames = ["week-day-cell"];
    if (isSelected) classNames.push("is-selected");
    if (isToday) classNames.push("is-today");
    cell.className = classNames.join(" ");
    cell.setAttribute("aria-label", `${date.getMonth() + 1}월 ${date.getDate()}일`);

    const labelEl = document.createElement("span");
    labelEl.className = "week-day-label";
    labelEl.textContent = DAY_LABELS[date.getDay()];

    const numEl = document.createElement("span");
    numEl.className = "week-day-number";
    numEl.textContent = date.getDate();

    cell.appendChild(labelEl);
    cell.appendChild(numEl);

    if (count > 0) {
      const countEl = document.createElement("span");
      countEl.className = "week-day-count";
      countEl.textContent = count;
      cell.appendChild(countEl);
    }

    cell.addEventListener("click", () => {
      selectedDate = new Date(date);
      render();
    });

    weekDatesContainer.appendChild(cell);
  });
}

// ===== 주 이동 =====
function moveToPrevWeek() {
  selectedDate.setDate(selectedDate.getDate() - 7);
  render();
}

function moveToNextWeek() {
  selectedDate.setDate(selectedDate.getDate() + 7);
  render();
}

// ===== 통합 렌더링 =====
// selectedDate가 변경될 때 항상 이 함수를 호출해 세 영역을 동기화한다
function render() {
  renderMonth();
  renderWeekNav();
  renderTodos();
}

// ===== Todo 목록 렌더링 =====
// 날짜 필터 → 상태 필터 → DOM 출력
function renderTodos() {
  const selectedDateKey = formatDateKey(selectedDate);

  const filteredTodos = todos
    .filter((todo) => todo.date === selectedDateKey)
    .filter((todo) => {
      if (currentFilter === "active") return !todo.completed;
      if (currentFilter === "completed") return todo.completed;
      return true; // "all"
    });

  todoList.innerHTML = "";

  if (filteredTodos.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = getEmptyMessage();
    todoList.appendChild(emptyItem);
    return;
  }

  filteredTodos.forEach((todo) => {
    todoList.appendChild(createTodoElement(todo));
  });
}

// 현재 필터 상태에 맞는 빈 상태 안내 문구를 반환한다
function getEmptyMessage() {
  if (currentFilter === "active") return "진행 중인 할 일이 없습니다.";
  if (currentFilter === "completed") return "완료된 할 일이 없습니다.";
  return "이 날짜의 할 일이 없습니다.";
}

// ===== Todo 항목 DOM 생성 =====
function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");
  li.dataset.id = todo.id;

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.textContent = todo.text;

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const doneButton = document.createElement("button");
  doneButton.className = todo.completed ? "btn btn-undo" : "btn btn-done";
  doneButton.textContent = todo.completed ? "취소" : "완료";
  doneButton.addEventListener("click", () => toggleDone(todo.id));

  const editButton = document.createElement("button");
  editButton.className = "btn btn-edit";
  editButton.textContent = "수정";
  editButton.addEventListener("click", () =>
    startEdit(todo.id, li, textSpan, editButton, doneButton, deleteButton)
  );

  const deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-delete";
  deleteButton.textContent = "삭제";
  deleteButton.addEventListener("click", () => deleteTodo(todo.id));

  actions.appendChild(doneButton);
  actions.appendChild(editButton);
  actions.appendChild(deleteButton);
  li.appendChild(textSpan);
  li.appendChild(actions);

  return li;
}

// ===== Todo 추가 =====
function addTodo() {
  const inputText = todoInput.value.trim();

  if (inputText === "") {
    validationMessage.classList.remove("hidden");
    todoInput.focus();
    return;
  }

  validationMessage.classList.add("hidden");

  todos.push({
    id: nextId,
    text: inputText,
    completed: false,
    date: formatDateKey(selectedDate),
  });
  nextId++;

  saveTodos();
  todoInput.value = "";
  todoInput.focus();
  render();
}

// ===== 완료 토글 =====
function toggleDone(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  saveTodos();
  render();
}

// ===== 수정 모드 시작 =====
function startEdit(id, li, textSpan, editButton, doneButton, deleteButton) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = textSpan.textContent;

  li.insertBefore(editInput, textSpan);
  textSpan.classList.add("hidden");

  doneButton.classList.add("hidden");
  editButton.classList.add("hidden");
  deleteButton.classList.add("hidden");

  const saveButton = document.createElement("button");
  saveButton.className = "btn btn-save";
  saveButton.textContent = "저장";
  saveButton.addEventListener("click", () => saveEdit(id, editInput));

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveEdit(id, editInput);
  });

  li.querySelector(".todo-actions").appendChild(saveButton);
  editInput.focus();
  editInput.select();
}

// ===== 수정 저장 =====
function saveEdit(id, editInput) {
  const newText = editInput.value.trim();
  if (newText === "") {
    editInput.focus();
    return;
  }

  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.text = newText;
  saveTodos();
  render();
}

// ===== Todo 삭제 =====
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

// ===== 필터 변경 =====
// 필터는 날짜를 변경하지 않으므로 월·주간 네비는 갱신하지 않는다
function setFilter(filter) {
  currentFilter = filter;
  filterTabButtons.forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.filter === filter);
  });
  renderTodos();
}

// ===== 이벤트 연결 =====

addButton.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

todoInput.addEventListener("input", () => {
  if (todoInput.value.trim() !== "") {
    validationMessage.classList.add("hidden");
  }
});

filterTabButtons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

prevMonthButton.addEventListener("click", () => changeMonth(-1));
nextMonthButton.addEventListener("click", () => changeMonth(1));

prevWeekButton.addEventListener("click", moveToPrevWeek);
nextWeekButton.addEventListener("click", moveToNextWeek);

// ===== 초기화 =====
todos = loadTodos();
nextId = todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1;
render(); // 월 표시 + 주간 네비 + Todo 목록 초기 렌더링
