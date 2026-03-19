const STORAGE_KEY = "training-accountability-app-v3";
const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
const FIREBASE_FIRESTORE_URL = "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const defaults = {
  clientId: "client-" + Math.random().toString(36).slice(2, 10),
  programTitle: "32週間 トレーニング習慣化プラン",
  startDate: todayLocal(),
  totalWeeks: 32,
  sessionsPerWeek: 4,
  currentWeek: 6,
  expandedWeek: 6,
  ifTrigger: "",
  thenAction: "",
  partnerName: "",
  partnerRule: "",
  penalty: "",
  notificationTime: "20:00",
  notificationMessage: "今日のトレーニング報告を忘れずに",
  notificationEnabled: false,
  lastNotifiedDate: "",
  share: {
    roomId: "",
    firebaseConfig: "",
    connected: false,
    lastSyncedAt: "",
    lastWriter: ""
  },
  weeks: {}
};

const state = loadState();
const syncState = {
  firebaseSdk: null,
  app: null,
  db: null,
  unsubscribe: null,
  isApplyingRemote: false,
  installPromptEvent: null,
  notificationTimer: null,
  serviceWorkerReady: false
};

const elements = {
  summaryRow: document.getElementById("summaryRow"),
  programTitle: document.getElementById("programTitle"),
  startDate: document.getElementById("startDate"),
  totalWeeks: document.getElementById("totalWeeks"),
  sessionsPerWeek: document.getElementById("sessionsPerWeek"),
  currentWeek: document.getElementById("currentWeek"),
  ifTrigger: document.getElementById("ifTrigger"),
  thenAction: document.getElementById("thenAction"),
  partnerName: document.getElementById("partnerName"),
  partnerRule: document.getElementById("partnerRule"),
  penalty: document.getElementById("penalty"),
  notificationTime: document.getElementById("notificationTime"),
  notificationMessage: document.getElementById("notificationMessage"),
  shareRoomId: document.getElementById("shareRoomId"),
  firebaseConfig: document.getElementById("firebaseConfig"),
  shareStatus: document.getElementById("shareStatus"),
  notificationStatus: document.getElementById("notificationStatus"),
  pwaStatus: document.getElementById("pwaStatus"),
  planPreview: document.getElementById("planPreview"),
  weeklyBoard: document.getElementById("weeklyBoard"),
  shareSummary: document.getElementById("shareSummary"),
  saveSettingsButton: document.getElementById("saveSettingsButton"),
  resetDataButton: document.getElementById("resetDataButton"),
  connectShareButton: document.getElementById("connectShareButton"),
  disconnectShareButton: document.getElementById("disconnectShareButton"),
  enableNotificationButton: document.getElementById("enableNotificationButton"),
  testNotificationButton: document.getElementById("testNotificationButton"),
  installAppButton: document.getElementById("installAppButton"),
  saveHabitButton: document.getElementById("saveHabitButton"),
  saveAccountabilityButton: document.getElementById("saveAccountabilityButton"),
  copySummaryButton: document.getElementById("copySummaryButton"),
  jumpCurrentWeekButton: document.getElementById("jumpCurrentWeekButton")
};

normalizeState();
hydrateForm();
render();
attachStaticEvents();
setupInstallPrompt();
setupNotifications();
registerServiceWorker();
autoReconnectShare();

function attachStaticEvents() {
  elements.saveSettingsButton.addEventListener("click", () => {
    state.programTitle = sanitizeText(elements.programTitle.value, defaults.programTitle);
    state.startDate = elements.startDate.value || todayLocal();
    state.totalWeeks = clampNumber(elements.totalWeeks.value, 1, 104, defaults.totalWeeks);
    state.sessionsPerWeek = clampNumber(elements.sessionsPerWeek.value, 1, 14, defaults.sessionsPerWeek);
    state.currentWeek = clampNumber(elements.currentWeek.value, 1, state.totalWeeks, 1);
    state.expandedWeek = clampNumber(state.expandedWeek, 0, state.totalWeeks, state.currentWeek);
    trimWeeksToProgram();
    persistAndRender();
  });

  elements.resetDataButton.addEventListener("click", async () => {
    if (!window.confirm("設定と週次記録を初期化しますか？")) {
      return;
    }
    const preservedShare = { ...state.share };
    const preservedNotifications = {
      notificationTime: state.notificationTime,
      notificationMessage: state.notificationMessage,
      notificationEnabled: state.notificationEnabled,
      lastNotifiedDate: state.lastNotifiedDate
    };
    Object.assign(state, cloneDefaults());
    state.share = preservedShare;
    Object.assign(state, preservedNotifications);
    persistAndRender();
    if (state.share.connected) {
      await pushStateToRemote();
    }
  });

  elements.connectShareButton.addEventListener("click", async () => {
    state.share.roomId = elements.shareRoomId.value.trim();
    state.share.firebaseConfig = elements.firebaseConfig.value.trim();
    persistAndRender(false);
    await connectShare();
  });

  elements.disconnectShareButton.addEventListener("click", async () => {
    await disconnectShare();
    renderStatus();
  });

  elements.enableNotificationButton.addEventListener("click", async () => {
    state.notificationTime = elements.notificationTime.value || defaults.notificationTime;
    state.notificationMessage = sanitizeText(elements.notificationMessage.value, defaults.notificationMessage);
    const permission = await Notification.requestPermission();
    state.notificationEnabled = permission === "granted";
    persistAndRender(false);
    updateNotificationStatus(permission === "granted"
      ? "通知を有効化しました。アプリ起動中は毎日この時刻を見て通知します。"
      : "通知は許可されませんでした。ブラウザの設定で許可すると使えます。");
    if (permission === "granted") {
      maybeSendReminder(true);
    }
  });

  elements.testNotificationButton.addEventListener("click", async () => {
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        updateNotificationStatus("テスト通知を送るには通知の許可が必要です。");
        return;
      }
    }
    showNotification("テスト通知", "このアプリからの通知は正常です。");
    updateNotificationStatus("テスト通知を送信しました。");
  });

  elements.installAppButton.addEventListener("click", async () => {
    if (!syncState.installPromptEvent) {
      updatePwaStatus("このブラウザでは今すぐのインストールプロンプトが出せないため、共有メニューやブラウザメニューからホーム画面に追加してください。");
      return;
    }
    syncState.installPromptEvent.prompt();
    await syncState.installPromptEvent.userChoice;
    syncState.installPromptEvent = null;
    updatePwaStatus("インストールの案内を表示しました。");
  });

  elements.saveHabitButton.addEventListener("click", () => {
    state.ifTrigger = elements.ifTrigger.value.trim();
    state.thenAction = elements.thenAction.value.trim();
    persistAndRender();
  });

  elements.saveAccountabilityButton.addEventListener("click", () => {
    state.partnerName = elements.partnerName.value.trim();
    state.partnerRule = elements.partnerRule.value.trim();
    state.penalty = elements.penalty.value.trim();
    persistAndRender();
  });

  elements.copySummaryButton.addEventListener("click", async () => {
    const summary = buildShareSummary();
    elements.shareSummary.textContent = summary;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(summary);
        elements.shareSummary.textContent = "共有用テキストをコピーしました: " + summary;
        return;
      } catch (_error) {
      }
    }
    elements.shareSummary.textContent = "共有用テキスト: " + summary;
  });

  elements.jumpCurrentWeekButton.addEventListener("click", () => {
    state.expandedWeek = getCurrentWeekIndex();
    persistAndRender(false);
    const card = document.getElementById("week-card-" + state.expandedWeek);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      maybeSendReminder(false);
    }
  });
}

function render() {
  renderSummary();
  renderPlanPreview();
  renderWeeklyBoard();
  renderShareSummary();
  renderStatus();
  hydrateForm();
}

function renderSummary() {
  const weeks = getWeeksArray();
  const completedWeeks = weeks.filter((week) => week.sessions >= state.sessionsPerWeek).length;
  const totalSessions = weeks.reduce((sum, week) => sum + week.sessions, 0);
  const confirmedWeeks = weeks.filter((week) => week.confirmed).length;
  const aerobicSessions = weeks.reduce((sum, week) => sum + week.entries.filter((entry) => entry.aerobic && !entry.anaerobic).length, 0);
  const anaerobicSessions = weeks.reduce((sum, week) => sum + week.entries.filter((entry) => entry.anaerobic && !entry.aerobic).length, 0);
  const bothSessions = weeks.reduce((sum, week) => sum + week.entries.filter((entry) => entry.aerobic && entry.anaerobic).length, 0);

  elements.summaryRow.innerHTML = [
    statCard("プラン", state.programTitle),
    statCard("現在位置", "Week " + state.currentWeek),
    statCard("達成週", completedWeeks + " / " + state.totalWeeks),
    statCard("総報告回数", String(totalSessions)),
    statCard("有酸素", String(aerobicSessions)),
    statCard("無酸素", String(anaerobicSessions)),
    statCard("両方", String(bothSessions)),
    statCard("確認済み週", String(confirmedWeeks))
  ].join("");
}

function renderPlanPreview() {
  elements.planPreview.textContent = state.ifTrigger && state.thenAction
    ? "もし「" + state.ifTrigger + "」なら、その時「" + state.thenAction + "」をする。"
    : "まだ if-then プランが未設定です。";
}

function renderWeeklyBoard() {
  const weeks = getWeeksArray();
  elements.weeklyBoard.innerHTML = weeks.length
    ? weeks.map((week) => renderWeekCard(week)).join("")
    : '<div class="helper">週次データがまだありません。</div>';

  weeks.forEach((week) => {
    const toggleButton = document.getElementById("toggle-week-" + week.index);
    const addButton = document.getElementById("add-entry-" + week.index);
    const confirmButton = document.getElementById("save-confirm-" + week.index);
    const confirmInput = document.getElementById("confirm-" + week.index);
    const dateInput = document.getElementById("date-" + week.index);
    const aerobicInput = document.getElementById("aerobic-" + week.index);
    const anaerobicInput = document.getElementById("anaerobic-" + week.index);

    toggleButton.addEventListener("click", () => {
      state.expandedWeek = state.expandedWeek === week.index ? 0 : week.index;
      persistAndRender(false);
    });

    addButton.addEventListener("click", () => {
      if (!aerobicInput.checked && !anaerobicInput.checked) {
        window.alert("有酸素・無酸素のどちらかをチェックしてください。");
        return;
      }
      const savedWeek = ensureWeekRecord(week.index);
      savedWeek.entries.unshift({
        id: createEntryId(week.index, dateInput.value || todayLocal(), savedWeek.entries.length),
        date: dateInput.value || todayLocal(),
        aerobic: aerobicInput.checked,
        anaerobic: anaerobicInput.checked
      });
      state.expandedWeek = week.index;
      persistAndRender();
    });

    confirmButton.addEventListener("click", () => {
      const savedWeek = ensureWeekRecord(week.index);
      savedWeek.confirmed = confirmInput.checked;
      persistAndRender();
    });

    week.entries.forEach((entry) => {
      const deleteButton = document.getElementById("delete-entry-" + week.index + "-" + entry.id);
      if (!deleteButton) {
        return;
      }
      deleteButton.addEventListener("click", () => {
        const savedWeek = ensureWeekRecord(week.index);
        savedWeek.entries = savedWeek.entries.filter((item) => item.id !== entry.id);
        persistAndRender();
      });
    });
  });
}

function renderWeekCard(week) {
  const currentWeek = getCurrentWeekIndex();
  const reached = week.sessions >= state.sessionsPerWeek;
  const missed = !reached && week.index < currentWeek;
  const opened = state.expandedWeek === week.index;
  const status = reached ? "達成" : missed ? "未達" : week.index === currentWeek ? "進行中" : "これから";
  const classes = ["week-card"];
  if (reached) {
    classes.push("done");
  } else if (missed) {
    classes.push("missed");
  }

  const entryHtml = week.entries.length
    ? week.entries.map((entry) => `
        <div class="entry-item">
          <div class="entry-copy">
            <span class="entry-date">${escapeHtml(formatDate(entry.date))}</span>
            <span class="entry-type">${escapeHtml(getEntryTypeLabel(entry))}</span>
          </div>
          <button class="ghost mini" id="delete-entry-${week.index}-${entry.id}" type="button">削除</button>
        </div>
      `).join("")
    : '<div class="empty">まだこの週の報告はありません。</div>';

  return `
    <section class="${classes.join(" ")}" id="week-card-${week.index}">
      <button class="week-toggle" id="toggle-week-${week.index}" type="button" aria-expanded="${opened ? "true" : "false"}">
        <div class="week-left">
          <h3 class="week-title">Week ${week.index}</h3>
          <span class="week-caption">${escapeHtml(dateRangeForWeek(week.index))}</span>
        </div>
        <div class="week-right">
          <span class="week-status">${status}</span>
          <span class="week-count">${week.sessions} / ${state.sessionsPerWeek} 回</span>
        </div>
      </button>
      <div class="week-body" ${opened ? "" : "hidden"}>
        <div class="week-meta">
          <span class="meta-chip ${week.index === currentWeek ? "current" : ""}">${week.index === currentWeek ? "今いる週" : "記録対象週"}</span>
          <span class="meta-chip">開始: ${escapeHtml(formatDate(week.startDate))}</span>
          <span class="meta-chip">報告数: ${week.sessions}</span>
          <span class="meta-chip">状態: ${status}</span>
        </div>

        <div class="report-box">
          <div class="report-grid">
            <label>報告日<input id="date-${week.index}" type="date" value="${escapeHtml(todayLocal())}"></label>
            <div class="field-grid">
              <span style="font-weight:700;">運動の種類</span>
              <div class="check-row">
                <label class="check-card"><input id="aerobic-${week.index}" type="checkbox">有酸素</label>
                <label class="check-card"><input id="anaerobic-${week.index}" type="checkbox">無酸素</label>
              </div>
            </div>
          </div>
          <div class="button-row">
            <button class="primary" id="add-entry-${week.index}" type="button">この報告を追加</button>
          </div>
        </div>

        <div class="entry-list">
          <div class="entries">${entryHtml}</div>
        </div>

        <div class="confirm-row">
          <label class="inline-check">
            <input id="confirm-${week.index}" type="checkbox" ${week.confirmed ? "checked" : ""}>
            確認相手に報告して確認済みにする
          </label>
          <button class="secondary mini" id="save-confirm-${week.index}" type="button">確認状態を保存</button>
        </div>

        ${state.partnerName ? `<div class="partner-box"><strong>確認相手:</strong> ${escapeHtml(state.partnerName)}${state.partnerRule ? " / " + escapeHtml(state.partnerRule) : ""}</div>` : ""}
        ${missed && state.penalty ? `<div class="penalty-box"><strong>罰ゲーム:</strong> ${escapeHtml(state.penalty)}</div>` : ""}
      </div>
    </section>
  `;
}

function renderShareSummary() {
  elements.shareSummary.textContent = buildShareSummary();
}

function renderStatus() {
  const shareMessage = state.share.connected
    ? "Firebase 共有に接続中です。ルーム: `" + state.share.roomId + "` / 最終同期: " + (state.share.lastSyncedAt || "未同期")
    : "Firebase は未接続です。ローカル保存モードで動作しています。";
  updateShareStatus(shareMessage, !state.share.connected);

  const notificationMessage = state.notificationEnabled
    ? "通知は有効です。毎日 " + state.notificationTime + " に確認します。"
    : "通知はまだ有効化されていません。";
  updateNotificationStatus(notificationMessage);

  const pwaMessage = syncState.serviceWorkerReady
    ? "PWA 用 service worker を登録しました。ブラウザによってはホーム画面に追加できます。"
    : "PWA の登録待ちです。";
  updatePwaStatus(pwaMessage);
}

async function loadFirebaseSdk() {
  if (syncState.firebaseSdk) {
    return syncState.firebaseSdk;
  }
  const [appModule, firestoreModule] = await Promise.all([
    import(FIREBASE_APP_URL),
    import(FIREBASE_FIRESTORE_URL)
  ]);
  syncState.firebaseSdk = {
    initializeApp: appModule.initializeApp,
    deleteApp: appModule.deleteApp,
    getFirestore: firestoreModule.getFirestore,
    doc: firestoreModule.doc,
    setDoc: firestoreModule.setDoc,
    getDoc: firestoreModule.getDoc,
    onSnapshot: firestoreModule.onSnapshot
  };
  return syncState.firebaseSdk;
}

function hydrateForm() {
  elements.programTitle.value = state.programTitle;
  elements.startDate.value = state.startDate;
  elements.totalWeeks.value = state.totalWeeks;
  elements.sessionsPerWeek.value = state.sessionsPerWeek;
  elements.currentWeek.value = state.currentWeek;
  elements.ifTrigger.value = state.ifTrigger;
  elements.thenAction.value = state.thenAction;
  elements.partnerName.value = state.partnerName;
  elements.partnerRule.value = state.partnerRule;
  elements.penalty.value = state.penalty;
  elements.notificationTime.value = state.notificationTime;
  elements.notificationMessage.value = state.notificationMessage;
  elements.shareRoomId.value = state.share.roomId;
  elements.firebaseConfig.value = state.share.firebaseConfig;
}

async function connectShare() {
  const roomId = elements.shareRoomId.value.trim();
  const configText = elements.firebaseConfig.value.trim();
  if (!roomId || !configText) {
    updateShareStatus("共有するには Firebase 設定(JSON) と共有ルーム ID の両方が必要です。", true);
    return;
  }

  let config;
  try {
    config = JSON.parse(configText);
  } catch (_error) {
    updateShareStatus("Firebase 設定 JSON を正しい形式で貼り付けてください。", true);
    return;
  }

  await disconnectShare(false);

  try {
    const sdk = await loadFirebaseSdk();
    syncState.app = sdk.initializeApp(config, "training-accountability-" + Date.now());
    syncState.db = sdk.getFirestore(syncState.app);
    state.share.roomId = roomId;
    state.share.firebaseConfig = configText;
    state.share.connected = true;

    const reference = sdk.doc(syncState.db, "trainingPlans", roomId);
    const snapshot = await sdk.getDoc(reference);
    if (snapshot.exists()) {
      applyRemoteState(snapshot.data());
    } else {
      await pushStateToRemote();
    }

    syncState.unsubscribe = sdk.onSnapshot(reference, (snap) => {
      if (!snap.exists() || syncState.isApplyingRemote) {
        return;
      }
      applyRemoteState(snap.data());
    });

    persistAndRender(false);
    updateShareStatus("Firebase 共有に接続しました。ルーム `" + roomId + "` を同期します。");
  } catch (error) {
    state.share.connected = false;
    updateShareStatus("Firebase 接続に失敗しました: " + error.message, true);
  }
}

async function disconnectShare(renderAfter = true) {
  if (syncState.unsubscribe) {
    syncState.unsubscribe();
    syncState.unsubscribe = null;
  }
  if (syncState.app) {
    try {
      const sdk = await loadFirebaseSdk();
      await sdk.deleteApp(syncState.app);
    } catch (_error) {
    }
  }
  syncState.app = null;
  syncState.db = null;
  state.share.connected = false;
  if (renderAfter) {
    persistAndRender(false);
  }
}

async function pushStateToRemote() {
  if (!state.share.connected || !syncState.db || syncState.isApplyingRemote) {
    return;
  }
  const sdk = await loadFirebaseSdk();
  const payload = buildRemotePayload();
  const reference = sdk.doc(syncState.db, "trainingPlans", state.share.roomId);
  await sdk.setDoc(reference, payload, { merge: true });
  state.share.lastSyncedAt = formatDateTime(payload.updatedAt);
  state.share.lastWriter = payload.clientId;
  persistAndRender(false);
}

function applyRemoteState(remote) {
  if (!remote || !remote.state || remote.clientId === state.clientId) {
    return;
  }
  syncState.isApplyingRemote = true;
  const merged = {
    ...cloneDefaults(),
    ...remote.state,
    clientId: state.clientId,
    share: {
      ...state.share,
      connected: true,
      firebaseConfig: state.share.firebaseConfig,
      roomId: state.share.roomId,
      lastSyncedAt: formatDateTime(remote.updatedAt || Date.now()),
      lastWriter: remote.clientId || ""
    }
  };
  Object.assign(state, merged);
  normalizeState();
  persistAndRender(false);
  syncState.isApplyingRemote = false;
}

function buildRemotePayload() {
  return {
    updatedAt: Date.now(),
    clientId: state.clientId,
    state: {
      programTitle: state.programTitle,
      startDate: state.startDate,
      totalWeeks: state.totalWeeks,
      sessionsPerWeek: state.sessionsPerWeek,
      currentWeek: state.currentWeek,
      expandedWeek: state.expandedWeek,
      ifTrigger: state.ifTrigger,
      thenAction: state.thenAction,
      partnerName: state.partnerName,
      partnerRule: state.partnerRule,
      penalty: state.penalty,
      notificationTime: state.notificationTime,
      notificationMessage: state.notificationMessage,
      notificationEnabled: state.notificationEnabled,
      lastNotifiedDate: state.lastNotifiedDate,
      weeks: state.weeks
    }
  };
}

function setupNotifications() {
  if (syncState.notificationTimer) {
    window.clearInterval(syncState.notificationTimer);
  }
  syncState.notificationTimer = window.setInterval(() => maybeSendReminder(false), 30 * 1000);
  maybeSendReminder(false);
}

function maybeSendReminder(force) {
  if (!state.notificationEnabled || Notification.permission !== "granted") {
    return;
  }
  const now = new Date();
  const today = todayLocal();
  const [hour, minute] = (state.notificationTime || defaults.notificationTime).split(":").map(Number);
  const afterTime = now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute);
  if (!force && (!afterTime || state.lastNotifiedDate === today)) {
    return;
  }
  const currentWeek = getWeeksArray().find((week) => week.index === getCurrentWeekIndex()) || emptyWeek(getCurrentWeekIndex());
  const body = state.notificationMessage + " / 今週 " + currentWeek.sessions + " / " + state.sessionsPerWeek + " 回";
  showNotification("トレーニング習慣化アプリ", body);
  state.lastNotifiedDate = today;
  persistAndRender(false);
}

function showNotification(title, body) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.showNotification(title, {
          body,
          icon: "./training-app-icon.svg",
          badge: "./training-app-icon.svg"
        });
      } else {
        new Notification(title, { body });
      }
    });
    return;
  }
  new Notification(title, { body });
}

function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    syncState.installPromptEvent = event;
    updatePwaStatus("この端末ではホーム画面追加の準備ができています。");
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    updatePwaStatus("このブラウザは service worker に対応していません。");
    return;
  }
  try {
    await navigator.serviceWorker.register("./training-app-sw.js");
    syncState.serviceWorkerReady = true;
    renderStatus();
  } catch (error) {
    updatePwaStatus("service worker の登録に失敗しました: " + error.message);
  }
}

async function autoReconnectShare() {
  if (state.share.firebaseConfig && state.share.roomId) {
    await connectShare();
  }
}

function persistAndRender(pushRemote = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
  if (pushRemote) {
    pushStateToRemote().catch((error) => {
      updateShareStatus("Firebase 同期に失敗しました: " + error.message, true);
    });
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneDefaults();
    }
    return {
      ...cloneDefaults(),
      ...JSON.parse(raw)
    };
  } catch (_error) {
    return cloneDefaults();
  }
}

function normalizeState() {
  state.totalWeeks = clampNumber(state.totalWeeks, 1, 104, defaults.totalWeeks);
  state.sessionsPerWeek = clampNumber(state.sessionsPerWeek, 1, 14, defaults.sessionsPerWeek);
  state.currentWeek = clampNumber(state.currentWeek, 1, state.totalWeeks, defaults.currentWeek);
  state.expandedWeek = clampNumber(state.expandedWeek, 0, state.totalWeeks, state.currentWeek);
  state.share = {
    ...defaults.share,
    ...(state.share || {})
  };
  if (!state.startDate) {
    state.startDate = todayLocal();
  }
  if (!state.weeks || typeof state.weeks !== "object") {
    state.weeks = {};
  }
}

function getWeeksArray() {
  const result = [];
  for (let index = 1; index <= state.totalWeeks; index += 1) {
    result.push(normalizeWeek(index, state.weeks[index]));
  }
  return result;
}

function normalizeWeek(index, saved) {
  const base = emptyWeek(index);
  if (!saved || typeof saved !== "object") {
    return base;
  }
  let entries = [];
  if (Array.isArray(saved.entries)) {
    entries = saved.entries.map((entry, entryIndex) => ({
      id: entry.id || createEntryId(index, entry.date || todayLocal(), entryIndex),
      date: entry.date || todayLocal(),
      aerobic: Boolean(entry.aerobic),
      anaerobic: Boolean(entry.anaerobic)
    }));
  } else if (Number.isFinite(saved.sessions) && saved.sessions > 0) {
    for (let i = 0; i < saved.sessions; i += 1) {
      entries.push({
        id: createEntryId(index, todayLocal(), i),
        date: todayLocal(),
        aerobic: false,
        anaerobic: false
      });
    }
  }
  return {
    ...base,
    entries,
    sessions: entries.length,
    confirmed: Boolean(saved.confirmed)
  };
}

function emptyWeek(index) {
  return {
    index,
    startDate: weekStartFor(index),
    entries: [],
    sessions: 0,
    confirmed: false
  };
}

function ensureWeekRecord(index) {
  const normalized = normalizeWeek(index, state.weeks[index]);
  state.weeks[index] = {
    entries: normalized.entries,
    confirmed: normalized.confirmed
  };
  return state.weeks[index];
}

function trimWeeksToProgram() {
  Object.keys(state.weeks).forEach((key) => {
    if (Number(key) > state.totalWeeks) {
      delete state.weeks[key];
    }
  });
}

function getCurrentWeekIndex() {
  return clampNumber(state.currentWeek, 1, state.totalWeeks, 1);
}

function weekStartFor(index) {
  const start = parseLocalDate(state.startDate);
  const weekStart = new Date(start);
  weekStart.setDate(start.getDate() + (index - 1) * 7);
  return isoDate(weekStart);
}

function dateRangeForWeek(index) {
  const weekStart = parseLocalDate(weekStartFor(index));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return formatDate(weekStart) + " - " + formatDate(weekEnd);
}

function buildShareSummary() {
  const currentWeek = getCurrentWeekIndex();
  const week = getWeeksArray().find((item) => item.index === currentWeek) || emptyWeek(currentWeek);
  const latest = week.entries[0] ? getEntryTypeLabel(week.entries[0]) + " / " + formatDate(week.entries[0].date) : "まだ報告なし";
  return [
    state.programTitle,
    "現在は Week " + currentWeek,
    "今週 " + week.sessions + " / " + state.sessionsPerWeek + " 回",
    "最新報告: " + latest,
    state.partnerName ? "確認相手: " + state.partnerName : "確認相手は未設定",
    state.penalty ? "未達時: " + state.penalty : "罰ゲームは未設定"
  ].join(" | ");
}

function getEntryTypeLabel(entry) {
  if (entry.aerobic && entry.anaerobic) {
    return "有酸素 + 無酸素";
  }
  if (entry.aerobic) {
    return "有酸素";
  }
  if (entry.anaerobic) {
    return "無酸素";
  }
  return "種別未設定";
}

function updateShareStatus(message, warn = false) {
  elements.shareStatus.textContent = message;
  elements.shareStatus.className = "status-banner" + (warn ? " warn" : "");
}

function updateNotificationStatus(message, warn = false) {
  elements.notificationStatus.textContent = message;
  elements.notificationStatus.className = "status-banner" + (warn ? " warn" : "");
}

function updatePwaStatus(message, warn = false) {
  elements.pwaStatus.textContent = message;
  elements.pwaStatus.className = "status-banner" + (warn ? " warn" : "");
}

function statCard(label, value) {
  return '<div class="stat"><div class="stat-label">' + escapeHtml(label) + '</div><div class="stat-value">' + escapeHtml(value) + "</div></div>";
}

function createEntryId(weekIndex, date, seed) {
  return "w" + weekIndex + "-" + String(date).replaceAll("-", "") + "-" + seed + "-" + Math.random().toString(36).slice(2, 8);
}

function sanitizeText(value, fallback) {
  const trimmed = String(value || "").trim();
  return trimmed || fallback;
}

function cloneDefaults() {
  if (typeof structuredClone === "function") {
    return structuredClone(defaults);
  }
  return JSON.parse(JSON.stringify(defaults));
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function todayLocal() {
  return isoDate(new Date());
}

function isoDate(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function parseLocalDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(value) {
  const date = typeof value === "string" ? parseLocalDate(value) : value;
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function formatDateTime(timestamp) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
