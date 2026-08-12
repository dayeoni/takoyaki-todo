(() => {
  "use strict";

  const STORAGE_KEY = "takoyaki-todo-v1";

  /** @typedef {{ id: string, text: string, done: boolean, createdAt: string }} Todo */
  /** @typedef {{ settings: { animation: "none" | "rolling" | "jumping" }, todos: Record<string, Todo[]> }} StoreData */

  /** @returns {StoreData} */
  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { settings: { animation: "none" }, todos: {} };
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        settings: { animation: "none", ...parsed.settings },
        todos: parsed.todos || {},
      };
    } catch {
      return { settings: { animation: "none" }, todos: {} };
    }
  }

  /** @param {StoreData} data */
  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function formatDateLabel(date) {
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekday})`;
  }

  function createId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  // ---- 상태 ----
  let data = loadData();
  let currentDate = new Date();
  let calendarViewDate = new Date();

  // ---- DOM ----
  const widgetWrap = document.querySelector(".widget-wrap");
  const dateLabelText = document.getElementById("dateLabelText");
  const dateLabelBtn = document.getElementById("dateLabelBtn");
  const calendarPopover = document.getElementById("calendarPopover");
  const calMonthLabel = document.getElementById("calMonthLabel");
  const calGrid = document.getElementById("calGrid");
  const calPrevMonth = document.getElementById("calPrevMonth");
  const calNextMonth = document.getElementById("calNextMonth");
  const prevDayBtn = document.getElementById("prevDayBtn");
  const nextDayBtn = document.getElementById("nextDayBtn");
  const todoList = document.getElementById("todoList");
  const emptyState = document.getElementById("emptyState");
  const addForm = document.getElementById("addForm");
  const addInput = document.getElementById("addInput");
  const animCycleBtn = document.getElementById("animCycleBtn");
  const completeBanner = document.getElementById("completeBanner");
  const ANIM_ORDER = ["none", "rolling", "jumping"];

  function renderCalendar() {
    calMonthLabel.textContent = `${calendarViewDate.getFullYear()}년 ${calendarViewDate.getMonth() + 1}월`;
    calGrid.innerHTML = "";

    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const startOffset = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const todayKey = formatDateKey(new Date());
    const selectedKey = formatDateKey(currentDate);

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - startOffset + 1;
      let cellDate;
      let muted = false;
      if (dayNum < 1) {
        cellDate = new Date(year, month - 1, daysInPrevMonth + dayNum);
        muted = true;
      } else if (dayNum > daysInMonth) {
        cellDate = new Date(year, month + 1, dayNum - daysInMonth);
        muted = true;
      } else {
        cellDate = new Date(year, month, dayNum);
      }

      const key = formatDateKey(cellDate);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar-day";
      if (muted) btn.classList.add("is-muted");
      if (key === todayKey) btn.classList.add("is-today");
      if (key === selectedKey) btn.classList.add("is-selected");
      btn.textContent = cellDate.getDate();
      btn.addEventListener("click", () => {
        currentDate = cellDate;
        calendarPopover.hidden = true;
        render();
      });
      calGrid.appendChild(btn);
    }
  }

  function getTodosForCurrentDate() {
    const key = formatDateKey(currentDate);
    if (!data.todos[key]) data.todos[key] = [];
    return data.todos[key];
  }

  function render() {
    dateLabelText.textContent = formatDateLabel(currentDate);

    const todos = getTodosForCurrentDate();
    todoList.innerHTML = "";
    emptyState.hidden = todos.length > 0;
    completeBanner.hidden = !(todos.length > 0 && todos.every((t) => t.done));

    todos.forEach((todo) => {
      todoList.appendChild(renderTodoItem(todo));
    });

    widgetWrap.dataset.animation = data.settings.animation;
    animCycleBtn.dataset.animation = data.settings.animation;
  }

  function renderTodoItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");
    li.dataset.id = todo.id;

    const check = document.createElement("button");
    check.type = "button";
    check.className = "check-takoyaki";
    check.setAttribute("aria-label", todo.done ? "완료 취소" : "완료 처리");
    check.addEventListener("click", () => toggleDone(todo.id));

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    text.title = "클릭해서 수정";
    text.addEventListener("click", () => startEdit(li, todo));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "todo-delete-btn";
    del.setAttribute("aria-label", "삭제");
    del.textContent = "✕";
    del.addEventListener("click", () => deleteTodo(todo.id));

    li.append(check, text, del);
    return li;
  }

  function startEdit(li, todo) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "todo-edit-input";
    input.value = todo.text;
    input.maxLength = 200;

    const textEl = li.querySelector(".todo-text");
    li.replaceChild(input, textEl);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    const commit = () => {
      const value = input.value.trim();
      if (value) editTodo(todo.id, value);
      render();
    };

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) input.blur();
      if (e.key === "Escape") {
        input.removeEventListener("blur", commit);
        render();
      }
    });
  }

  function addTodo(text) {
    const todos = getTodosForCurrentDate();
    todos.push({ id: createId(), text, done: false, createdAt: new Date().toISOString() });
    saveData(data);
    render();
  }

  function editTodo(id, newText) {
    const todos = getTodosForCurrentDate();
    const todo = todos.find((t) => t.id === id);
    if (todo) todo.text = newText;
    saveData(data);
  }

  function deleteTodo(id) {
    const key = formatDateKey(currentDate);
    data.todos[key] = (data.todos[key] || []).filter((t) => t.id !== id);
    saveData(data);
    render();
  }

  function toggleDone(id) {
    const todos = getTodosForCurrentDate();
    const todo = todos.find((t) => t.id === id);
    if (todo) todo.done = !todo.done;
    saveData(data);
    render();
  }

  function setAnimation(mode) {
    data.settings.animation = mode;
    saveData(data);
    render();
  }

  // ---- 이벤트 바인딩 ----
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = addInput.value.trim();
    if (!value) return;
    addTodo(value);
    addInput.value = "";
    addInput.focus();
  });

  addInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) {
      e.preventDefault();
      addForm.requestSubmit();
    }
  });

  prevDayBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() - 1);
    render();
  });

  nextDayBtn.addEventListener("click", () => {
    currentDate.setDate(currentDate.getDate() + 1);
    render();
  });

  dateLabelBtn.addEventListener("click", () => {
    const opening = calendarPopover.hidden;
    calendarPopover.hidden = !opening;
    if (opening) {
      calendarViewDate = new Date(currentDate);
      renderCalendar();
    }
  });

  calPrevMonth.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
  });

  calNextMonth.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
  });

  document.addEventListener("click", (e) => {
    if (
      !calendarPopover.hidden &&
      !calendarPopover.contains(e.target) &&
      e.target !== dateLabelBtn &&
      !dateLabelBtn.contains(e.target)
    ) {
      calendarPopover.hidden = true;
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !calendarPopover.hidden) {
      calendarPopover.hidden = true;
    }
  });

  animCycleBtn.addEventListener("click", () => {
    const next = ANIM_ORDER[(ANIM_ORDER.indexOf(data.settings.animation) + 1) % ANIM_ORDER.length];
    setAnimation(next);
  });

  render();
})();
