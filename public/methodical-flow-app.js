const STORAGE_KEY = "methodical-flow-app-v3";
const LEGACY_STORAGE_KEYS = [
  "methodical-flow-app-v2",
  "methodical-flow-app-v1"
];

const state = loadState();
let pendingWorkDates = [];
let workCalendarCursor = monthKey(new Date());
let editingTaskId = "";
let editingGoalId = "";
let notificationTimer = null;

const elements = {
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  todayTaskCount: document.getElementById("todayTaskCount"),
  completedTaskCount: document.getElementById("completedTaskCount"),
  goalCount: document.getElementById("goalCount"),
  averageProgress: document.getElementById("averageProgress"),
  focusGoalTitle: document.getElementById("focusGoalTitle"),
  focusGoalProgress: document.getElementById("focusGoalProgress"),
  focusGoalDescription: document.getElementById("focusGoalDescription"),
  focusGoalMilestone: document.getElementById("focusGoalMilestone"),
  focusGoalDeadline: document.getElementById("focusGoalDeadline"),
  focusProgressInput: document.getElementById("focusProgressInput"),
  focusRing: document.getElementById("focusRing"),
  taskList: document.getElementById("taskList"),
  goalList: document.getElementById("goalList"),
  taskForm: document.getElementById("taskForm"),
  taskTitleInput: document.getElementById("taskTitleInput"),
  taskDateInput: document.getElementById("taskDateInput"),
  taskTimeInput: document.getElementById("taskTimeInput"),
  taskPriorityInput: document.getElementById("taskPriorityInput"),
  taskTagInput: document.getElementById("taskTagInput"),
  taskEditingId: document.getElementById("taskEditingId"),
  taskFormStatus: document.getElementById("taskFormStatus"),
  taskSubmitButton: document.getElementById("taskSubmitButton"),
  cancelTaskEditButton: document.getElementById("cancelTaskEditButton"),
  goalForm: document.getElementById("goalForm"),
  goalTitleInput: document.getElementById("goalTitleInput"),
  goalDescriptionInput: document.getElementById("goalDescriptionInput"),
  goalProgressInput: document.getElementById("goalProgressInput"),
  goalDeadlineInput: document.getElementById("goalDeadlineInput"),
  goalMilestoneInput: document.getElementById("goalMilestoneInput"),
  goalEditingId: document.getElementById("goalEditingId"),
  goalSubmitButton: document.getElementById("goalSubmitButton"),
  cancelGoalEditButton: document.getElementById("cancelGoalEditButton"),
  goalProgressForm: document.getElementById("goalProgressForm"),
  settingsForm: document.getElementById("settingsForm"),
  profileNameInput: document.getElementById("profileNameInput"),
  dailyMessageInput: document.getElementById("dailyMessageInput"),
  notificationTimeInput: document.getElementById("notificationTimeInput"),
  notificationMessageInput: document.getElementById("notificationMessageInput"),
  notificationStatus: document.getElementById("notificationStatus"),
  enableNotificationButton: document.getElementById("enableNotificationButton"),
  testNotificationButton: document.getElementById("testNotificationButton"),
  workDateInput: document.getElementById("workDateInput"),
  addWorkDateButton: document.getElementById("addWorkDateButton"),
  workCalendarTitle: document.getElementById("workCalendarTitle"),
  workCalendarGrid: document.getElementById("workCalendarGrid"),
  workCalendarStatus: document.getElementById("workCalendarStatus"),
  workCalendarPrevButton: document.getElementById("workCalendarPrevButton"),
  workCalendarNextButton: document.getElementById("workCalendarNextButton"),
  addBulkWorkDatesButton: document.getElementById("addBulkWorkDatesButton"),
  workDateList: document.getElementById("workDateList"),
  showAllTasksButton: document.getElementById("showAllTasksButton"),
  resetButton: document.getElementById("resetButton")
};

bootstrap();

function bootstrap() {
  elements.taskDateInput.value = todayKey();
  hydrateForms();
  attachEvents();
  render();
  startNotificationLoop();
  document.addEventListener("visibilitychange", checkNotifications);
}

function attachEvents() {
  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = sanitizeText(elements.taskTitleInput.value);
    if (!title) {
      elements.taskFormStatus.textContent = "タスク名を入れてください。";
      return;
    }

    const payload = {
      title,
      date: elements.taskDateInput.value || todayKey(),
      time: elements.taskTimeInput.value || "",
      priority: elements.taskPriorityInput.value,
      tag: sanitizeText(elements.taskTagInput.value)
    };
    const isTodayTask = payload.date === todayKey();
    const submittedEditingId = editingTaskId;
    let didUpdateExistingTask = false;

    if (submittedEditingId) {
      const task = state.tasks.find((item) => item.id === editingTaskId);
      if (task) {
        Object.assign(task, payload);
        didUpdateExistingTask = true;
      }
    }

    if (!didUpdateExistingTask) {
      state.tasks.unshift({
        id: crypto.randomUUID(),
        ...payload,
        completed: false,
        createdAt: Date.now()
      });
    }

    state.showAllTasks = true;

    saveState();
    if (submittedEditingId && didUpdateExistingTask) {
      resetTaskForm("タスクを更新しました。一覧を表示しています。");
    } else if (isTodayTask) {
      resetTaskForm("タスクを追加しました。一覧に表示しています。");
    } else {
      resetTaskForm("今日以外の日付のタスクを追加しました。一覧全体を表示しています。");
    }
    render();
  });

  elements.goalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = sanitizeText(elements.goalTitleInput.value);
    if (!title) {
      return;
    }

    const payload = {
      title,
      description: sanitizeText(elements.goalDescriptionInput.value),
      progress: clampProgress(elements.goalProgressInput.value),
      deadline: elements.goalDeadlineInput.value || "",
      milestone: sanitizeText(elements.goalMilestoneInput.value),
      priority: guessGoalPriority(elements.goalProgressInput.value)
    };

    if (editingGoalId) {
      const goal = state.goals.find((item) => item.id === editingGoalId);
      if (goal) {
        Object.assign(goal, payload);
      }
    } else {
      state.goals.unshift({
        id: crypto.randomUUID(),
        ...payload
      });
    }

    saveState();
    resetGoalForm();
    render();
  });

  elements.goalProgressForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.goals.length) {
      return;
    }
    state.goals[0].progress = clampProgress(elements.focusProgressInput.value);
    saveState();
    render();
  });

  elements.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.profileName = sanitizeText(elements.profileNameInput.value) || "こうへいさん";
    state.dailyMessage = sanitizeText(elements.dailyMessageInput.value) || createDefaultState().dailyMessage;
    state.notificationTime = elements.notificationTimeInput.value || "20:00";
    state.notificationMessage = sanitizeText(elements.notificationMessageInput.value) || createDefaultState().notificationMessage;
    saveState();
    startNotificationLoop();
    render();
  });

  elements.cancelTaskEditButton.addEventListener("click", () => {
    resetTaskForm("タスク編集をキャンセルしました。");
    render();
  });

  elements.cancelGoalEditButton.addEventListener("click", () => {
    resetGoalForm();
    render();
  });

  elements.addWorkDateButton.addEventListener("click", () => {
    const value = elements.workDateInput.value;
    if (!value) {
      return;
    }
    addWorkDates([value]);
    elements.workDateInput.value = "";
  });

  elements.addBulkWorkDatesButton.addEventListener("click", () => {
    addWorkDates(pendingWorkDates);
    pendingWorkDates = [];
    render();
  });

  elements.workCalendarPrevButton.addEventListener("click", () => {
    workCalendarCursor = shiftMonthKey(workCalendarCursor, -1);
    render();
  });

  elements.workCalendarNextButton.addEventListener("click", () => {
    workCalendarCursor = shiftMonthKey(workCalendarCursor, 1);
    render();
  });

  elements.showAllTasksButton.addEventListener("click", () => {
    state.showAllTasks = !state.showAllTasks;
    saveState();
    render();
  });

  elements.enableNotificationButton.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      elements.notificationStatus.textContent = "このブラウザは通知に対応していません。";
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      state.notificationsEnabled = true;
      saveState();
      startNotificationLoop();
      render();
      return;
    }
    state.notificationsEnabled = false;
    saveState();
    render();
  });

  elements.testNotificationButton.addEventListener("click", async () => {
    const ok = await ensureNotificationReady();
    if (!ok) {
      render();
      return;
    }
    sendNotification("Methodical Flow", state.notificationMessage || "通知テストです。");
    elements.notificationStatus.textContent = "テスト通知を送りました。";
  });

  elements.resetButton.addEventListener("click", () => {
    if (!window.confirm("入力した内容をサンプル状態に戻しますか？")) {
      return;
    }
    Object.assign(state, createDefaultState());
    saveState();
    hydrateForms();
    render();
  });

  elements.taskList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const taskId = button.dataset.taskId;
    if (!taskId) {
      return;
    }

    if (button.dataset.action === "toggle-task") {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }
      task.completed = !task.completed;
    }

    if (button.dataset.action === "delete-task") {
      state.tasks = state.tasks.filter((item) => item.id !== taskId);
    }

    if (button.dataset.action === "edit-task") {
      const task = state.tasks.find((item) => item.id === taskId);
      if (!task) {
        return;
      }
      editingTaskId = task.id;
      elements.taskEditingId.value = task.id;
      elements.taskTitleInput.value = task.title;
      elements.taskDateInput.value = task.date;
      elements.taskTimeInput.value = task.time;
      elements.taskPriorityInput.value = task.priority;
      elements.taskTagInput.value = task.tag;
      elements.taskFormStatus.textContent = "タスクを編集中です。";
      render();
      elements.taskTitleInput.focus();
      return;
    }

    saveState();
    render();
  });

  elements.goalList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const goalId = button.dataset.goalId;
    if (!goalId) {
      return;
    }

    if (button.dataset.action === "set-focus-goal") {
      const index = state.goals.findIndex((item) => item.id === goalId);
      if (index > 0) {
        const [goal] = state.goals.splice(index, 1);
        state.goals.unshift(goal);
      }
    }

    if (button.dataset.action === "delete-goal") {
      state.goals = state.goals.filter((item) => item.id !== goalId);
    }

    if (button.dataset.action === "edit-goal") {
      const goal = state.goals.find((item) => item.id === goalId);
      if (!goal) {
        return;
      }
      editingGoalId = goal.id;
      elements.goalEditingId.value = goal.id;
      elements.goalTitleInput.value = goal.title;
      elements.goalDescriptionInput.value = goal.description;
      elements.goalProgressInput.value = String(goal.progress);
      elements.goalDeadlineInput.value = goal.deadline;
      elements.goalMilestoneInput.value = goal.milestone;
      render();
      elements.goalTitleInput.focus();
      return;
    }

    saveState();
    render();
  });

  elements.workDateList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-work-date]");
    if (!button) {
      return;
    }
    const workDate = button.dataset.workDate;
    state.workDates = state.workDates.filter((value) => value !== workDate);
    saveState();
    render();
  });

  elements.workCalendarGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-date]");
    if (!button) {
      return;
    }
    const value = button.dataset.date;
    if (!value) {
      return;
    }
    if (pendingWorkDates.includes(value)) {
      pendingWorkDates = pendingWorkDates.filter((item) => item !== value);
    } else {
      pendingWorkDates = [...pendingWorkDates, value].sort();
    }
    renderWorkCalendar();
  });
}

function render() {
  const focusGoal = state.goals[0] || null;
  const todayTasks = orderedTasks().filter((task) => task.date === todayKey());
  const visibleTasks = state.showAllTasks ? orderedTasks() : todayTasks;
  const completedCount = state.tasks.filter((task) => task.completed).length;
  const average = state.goals.length
    ? Math.round(state.goals.reduce((sum, goal) => sum + goal.progress, 0) / state.goals.length)
    : 0;

  elements.heroTitle.textContent = `${getGreetingMessage(state.profileName, todayTasks, completedCount)}`;
  elements.heroSubtitle.textContent = `${state.dailyMessage} 今日の優先タスクは ${todayTasks.length} 件です。`;
  elements.todayTaskCount.textContent = `${todayTasks.length}件`;
  elements.completedTaskCount.textContent = `${completedCount}件`;
  elements.goalCount.textContent = `${state.goals.length}件`;
  elements.averageProgress.textContent = `${average}%`;
  elements.showAllTasksButton.textContent = state.showAllTasks ? "今日の分だけ表示" : "すべて表示";
  elements.taskSubmitButton.textContent = editingTaskId ? "更新する" : "追加";
  elements.cancelTaskEditButton.hidden = !editingTaskId;
  elements.goalSubmitButton.textContent = editingGoalId ? "目標を更新" : "目標を保存";
  elements.cancelGoalEditButton.hidden = !editingGoalId;
  elements.notificationStatus.textContent = getNotificationStatusText();

  renderFocusGoal(focusGoal);
  renderTasks(visibleTasks);
  renderGoals();
  renderWorkDates();
  renderWorkCalendar();
  hydrateForms();
}

function renderFocusGoal(goal) {
  if (!goal) {
    elements.focusGoalTitle.textContent = "目標を追加してみましょう";
    elements.focusGoalProgress.textContent = "0%";
    elements.focusGoalDescription.textContent = "下のフォームから目標を追加すると、ここに最優先の目標が表示されます。";
    elements.focusGoalMilestone.textContent = "次回のマイルストーン: 未設定";
    elements.focusGoalDeadline.textContent = "期限未設定";
    elements.focusProgressInput.value = "0";
    updateRing(0);
    return;
  }

  elements.focusGoalTitle.textContent = goal.title;
  elements.focusGoalProgress.textContent = `${goal.progress}%`;
  elements.focusGoalDescription.textContent = goal.description || "説明はまだありません。";
  elements.focusGoalMilestone.textContent = `次回のマイルストーン: ${goal.milestone || "未設定"}`;
    elements.focusGoalDeadline.textContent = goal.deadline ? formatDeadline(goal.deadline) : "期限未設定";
  elements.focusProgressInput.value = String(goal.progress);
  updateRing(goal.progress);
}

function renderTasks(tasks) {
  if (!tasks.length) {
    elements.taskList.innerHTML = `<div class="empty-state">まだタスクがありません。上の入力欄から追加すると、ここに一覧表示されます。</div>`;
    return;
  }

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  elements.taskList.innerHTML = [
    renderTaskGroup("未完了", incompleteTasks, "まだ未完了タスクはありません。"),
    renderTaskGroup("完了済み", completedTasks, "まだ完了したタスクはありません。")
  ].join("");
}

function renderTaskGroup(title, tasks, emptyText) {
  if (!tasks.length) {
    return `
      <section class="task-group">
        <h4 class="task-group-title">${title}</h4>
        <div class="empty-state">${emptyText}</div>
      </section>
    `;
  }
  return `
    <section class="task-group">
      <h4 class="task-group-title">${title}</h4>
      ${tasks.map((task) => {
    const priorityLabel = priorityLabels[task.priority] || "中";
    const metaDate = task.date === todayKey() ? "今日" : formatDate(task.date);
    const titleClass = task.completed ? "done-text" : "";
    return `
      <article class="task-item priority-${task.priority}">
        <div class="task-accent"></div>
        <button class="task-toggle ${task.completed ? "done" : ""}" data-action="toggle-task" data-task-id="${task.id}" type="button" aria-label="タスク完了切り替え"></button>
        <div class="task-main">
          <div class="section-head">
            <h3 class="${titleClass}">${escapeHtml(task.title)}</h3>
            <span class="priority-pill ${task.priority}">${priorityLabel}</span>
          </div>
          <div class="task-meta">
            <span>${metaDate}</span>
            <span>${task.time || "時間未設定"}</span>
            <span>${escapeHtml(task.tag || "メモなし")}</span>
          </div>
        </div>
        <div class="item-actions">
          <button class="mini-button" data-action="edit-task" data-task-id="${task.id}" type="button" aria-label="タスク編集">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="mini-button" data-action="delete-task" data-task-id="${task.id}" type="button" aria-label="タスク削除">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </article>
    `;
  }).join("")}
    </section>
  `;
}

function renderGoals() {
  if (!state.goals.length) {
    elements.goalList.innerHTML = `<div class="empty-state">目標がまだありません。左のフォームから追加するとここに表示されます。</div>`;
    return;
  }

  elements.goalList.innerHTML = state.goals.map((goal, index) => `
    <article class="goal-item priority-${goal.priority}">
      <div class="goal-accent"></div>
      <div class="goal-main">
        <div class="section-head">
          <h3>${escapeHtml(goal.title)}</h3>
          <span class="priority-pill ${goal.priority}">${goal.progress}%</span>
        </div>
        <div class="goal-meta">
          <span>${escapeHtml(goal.milestone || "マイルストーン未設定")}</span>
          <span>${goal.deadline ? formatDate(goal.deadline) : "期限未設定"}</span>
          <span>${escapeHtml(goal.description || "説明なし")}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="mini-button" data-action="edit-goal" data-goal-id="${goal.id}" type="button" aria-label="目標編集">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="mini-button" data-action="set-focus-goal" data-goal-id="${goal.id}" type="button" aria-label="この目標を最優先にする" title="${index === 0 ? "今の最優先目標です" : "この目標を最優先にする"}">
          <span class="material-symbols-outlined">vertical_align_top</span>
        </button>
        <button class="mini-button" data-action="delete-goal" data-goal-id="${goal.id}" type="button" aria-label="目標削除">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </article>
  `).join("");
}

function hydrateForms() {
  elements.profileNameInput.value = state.profileName;
  elements.dailyMessageInput.value = state.dailyMessage;
  elements.notificationTimeInput.value = state.notificationTime;
  elements.notificationMessageInput.value = state.notificationMessage;
  if (!elements.workDateInput.value) {
    elements.workDateInput.value = "";
  }
}

function loadState() {
  try {
    const raw = loadStoredStateValue();
    if (!raw) {
      return createDefaultState();
    }
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultState(),
      ...parsed,
      workDates: Array.isArray(parsed.workDates)
        ? parsed.workDates.filter((value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)).sort()
        : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : createDefaultState().goals,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : createDefaultState().tasks
    };
  } catch (error) {
    console.warn("Failed to load app state:", error);
    return createDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadStoredStateValue() {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) {
    return current;
  }

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacy = localStorage.getItem(legacyKey);
    if (!legacy) {
      continue;
    }
    localStorage.setItem(STORAGE_KEY, legacy);
    return legacy;
  }

  return "";
}

function orderedTasks() {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...state.tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    const left = `${a.date} ${a.time}`;
    const right = `${b.date} ${b.time}`;
    const timeCompare = left.localeCompare(right);
    if (timeCompare !== 0) {
      return timeCompare;
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
}

function updateRing(progress) {
  const circumference = 552.92;
  const offset = circumference - (circumference * progress) / 100;
  elements.focusRing.style.strokeDashoffset = String(offset);
}

function todayKey() {
  return localDateKey(new Date());
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function clampProgress(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(date);
}

function formatDeadline(value) {
  const today = new Date();
  const date = new Date(`${value}T00:00:00`);
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff > 0) {
    return `残り ${diff} 日`;
  }
  if (diff === 0) {
    return "今日が期限";
  }
  return `${Math.abs(diff)} 日超過`;
}

function guessGoalPriority(progress) {
  const numeric = clampProgress(progress);
  if (numeric < 34) {
    return "high";
  }
  if (numeric < 67) {
    return "medium";
  }
  return "low";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const priorityLabels = {
  high: "高",
  medium: "中",
  low: "低"
};

function createDefaultState() {
  return {
    profileName: "こうへいさん",
    dailyMessage: "今日は一番大事なことから始めましょう。",
    showAllTasks: false,
    workDates: [],
    notificationTime: "20:00",
    notificationMessage: "今日のタスクと目標を振り返りましょう。",
    notificationsEnabled: false,
    lastNotificationDate: "",
    goals: [],
    tasks: []
  };
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getGreetingByHour() {
  const hour = new Date().getHours();
  if (hour < 11) {
    return "おはようございます";
  }
  if (hour < 18) {
    return "こんにちは";
  }
  return "こんばんは";
}

function getGreetingMessage(profileName, todayTasks, completedCount) {
  const name = profileName || "こうへいさん";
  const now = new Date();
  const hour = now.getHours();
  const today = todayKey();
  const isWorkday = state.workDates.includes(today);

  if (hour < 5) {
    return `${name}、まだ起きてるんですね。無理しすぎないでくださいね。`;
  }

  if (hour < 11) {
    const morningMessages = isWorkday
      ? [
          `おはようございます、${name}。仕事の日ですね。無理なく始めましょう。`,
          `${name}、お仕事モードですね。ひとつずつで大丈夫です。`,
          `${name}、今日のお仕事もいい流れで進みますように。`
        ]
      : [
          `おはようございます、${name}。`,
          `${name}、気持ちよく始めていきましょう。`,
          `${name}、今日もいい流れを作っていきましょう。`
        ];
    return pickMessage(morningMessages, todayTasks.length + completedCount);
  }

  if (hour < 15) {
    const noonMessages = isWorkday
      ? [
          `こんにちは、${name}。お仕事の合間に少し整えていきましょう。`,
          `${name}、午後の仕事も一つずつ進めていきましょう。`,
          `${name}、ここからでも十分取り戻せます。`
        ]
      : [
          `こんにちは、${name}。`,
          `${name}、ここから一つずつ進めていきましょう。`,
          `${name}、午後もいいペースでいけそうです。`
        ];
    return pickMessage(noonMessages, todayTasks.length + completedCount);
  }

  if (hour < 19) {
    const afternoonMessages = isWorkday
      ? [
          `こんにちは、${name}。仕事の後半戦も落ち着いていきましょう。`,
          `${name}、ここまで来たらあと少しです。`,
          `${name}、今日の仕事もちゃんと積み上がっています。`
        ]
      : [
          `こんにちは、${name}。`,
          `${name}、後半戦も落ち着いていきましょう。`,
          `${name}、ここまででも十分いい流れです。`
        ];
    return pickMessage(afternoonMessages, todayTasks.length + completedCount);
  }

  if (isWorkday && completedCount > 0) {
    const workdayEveningMessages = [
      `こんばんは、${name}。仕事の日、おつかれさまでした。今日もよく頑張りましたね。`,
      `${name}、お仕事おつかれさまです。ちゃんと積み上がっています。`,
      `${name}、今日はもう自分を褒めていい日です。よく頑張りました。`
    ];
    return pickMessage(workdayEveningMessages, completedCount);
  }

  if (completedCount > 0) {
    const eveningPraiseMessages = [
      `こんばんは、${name}。今日もよく頑張りましたね。`,
      `${name}、今日もちゃんと積み上がっています。えらいです。`,
      `${name}、ここまで進められていていい感じです。`
    ];
    return pickMessage(eveningPraiseMessages, completedCount);
  }

  const eveningMessages = [
    `こんばんは、${name}。`,
    `${name}、今日はここからゆるく整えていきましょう。`,
    `${name}、おつかれさまです。あと少しだけ進めますか。`
  ];
  return pickMessage(eveningMessages, todayTasks.length);
}

function pickMessage(messages, seed) {
  if (!messages.length) {
    return "";
  }
  return messages[Math.abs(seed) % messages.length];
}

function renderWorkDates() {
  if (!state.workDates.length) {
    elements.workDateList.innerHTML = `<div class="workdate-empty">まだ勤務日は登録されていません。シフトが決まった日付を追加してください。</div>`;
    return;
  }

  elements.workDateList.innerHTML = state.workDates.map((value) => `
    <div class="workdate-chip">
      <span>${formatFullDate(value)}</span>
      <button type="button" data-work-date="${value}" aria-label="${value} を削除">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
  `).join("");
}

function renderWorkCalendar() {
  const firstDay = new Date(`${workCalendarCursor}-01T00:00:00`);
  const title = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long"
  }).format(firstDay);
  elements.workCalendarTitle.textContent = title;

  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(firstDay.getFullYear(), firstDay.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(`<div></div>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(firstDay.getFullYear(), firstDay.getMonth(), day);
    const key = localDateKey(date);
    const classNames = ["calendar-day"];
    if (pendingWorkDates.includes(key)) {
      classNames.push("selected");
    } else if (state.workDates.includes(key)) {
      classNames.push("saved");
    }
    cells.push(`
      <button class="${classNames.join(" ")}" type="button" data-date="${key}">
        ${day}
      </button>
    `);
  }

  elements.workCalendarGrid.innerHTML = cells.join("");

  if (pendingWorkDates.length) {
    elements.workCalendarStatus.textContent = `${pendingWorkDates.length}日を選択中です。「選択日を追加」で登録できます。`;
  } else {
    elements.workCalendarStatus.textContent = "選んだ日付をまとめて勤務日に追加できます。";
  }
}

function formatFullDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function addWorkDates(values) {
  const validDates = values.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value));
  if (!validDates.length) {
    return;
  }
  state.workDates = Array.from(new Set([...state.workDates, ...validDates])).sort();
  saveState();
  render();
}

function resetTaskForm(statusText = "タスクを追加すると自動で保存されます。") {
  editingTaskId = "";
  elements.taskEditingId.value = "";
  elements.taskForm.reset();
  elements.taskDateInput.value = todayKey();
  elements.taskTimeInput.value = "09:00";
  elements.taskPriorityInput.value = "medium";
  elements.taskFormStatus.textContent = statusText;
  elements.cancelTaskEditButton.hidden = true;
  elements.taskSubmitButton.textContent = "追加";
}

function resetGoalForm() {
  editingGoalId = "";
  elements.goalEditingId.value = "";
  elements.goalForm.reset();
  elements.cancelGoalEditButton.hidden = true;
  elements.goalSubmitButton.textContent = "目標を保存";
}

async function ensureNotificationReady() {
  if (!("Notification" in window)) {
    elements.notificationStatus.textContent = "このブラウザは通知に対応していません。";
    return false;
  }
  if (Notification.permission === "granted") {
    state.notificationsEnabled = true;
    saveState();
    return true;
  }
  const permission = await Notification.requestPermission();
  state.notificationsEnabled = permission === "granted";
  saveState();
  return permission === "granted";
}

function startNotificationLoop() {
  if (notificationTimer) {
    window.clearInterval(notificationTimer);
  }
  notificationTimer = window.setInterval(checkNotifications, 30000);
  checkNotifications();
}

async function checkNotifications() {
  if (!state.notificationsEnabled) {
    return;
  }
  const ok = await ensureNotificationReady();
  if (!ok) {
    return;
  }
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const today = todayKey();
  if (currentTime === state.notificationTime && state.lastNotificationDate !== today) {
    sendNotification("Methodical Flow", state.notificationMessage);
    state.lastNotificationDate = today;
    saveState();
    render();
  }
}

function sendNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  new Notification(title, { body });
}

function getNotificationStatusText() {
  if (!("Notification" in window)) {
    return "このブラウザは通知に対応していません。";
  }
  if (!state.notificationsEnabled || Notification.permission !== "granted") {
    return "通知はオフです。";
  }
  return `毎日 ${state.notificationTime} に通知します。`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonthKey(value, offset) {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return monthKey(date);
}
