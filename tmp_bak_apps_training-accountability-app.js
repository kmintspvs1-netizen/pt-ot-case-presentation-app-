const STORAGE_KEY = "training-accountability-app-v4";
const FIREBASE_APP_URL = "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
const FIREBASE_FIRESTORE_URL = "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
const FIREBASE_AUTH_URL = "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
const FIREBASE_MESSAGING_URL = "https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging.js";
const WEB_PUSH_VAPID_KEY = "BJkEqwAGjBrzrsV8K_mzPqSKEJGVKErj5jNswT-3qwZUTSoTodRREaRTXnjuzd0sZyOzEBs9RdB0ysOQi62wb68";
const SERVICE_WORKER_VERSION = "2026-03-26-1";

const TEAM_PLAN_DOC_ID = "shared-plan";
const DEFAULT_FIREBASE_CONFIG = JSON.stringify({
  apiKey: "AIzaSyDwbQON3l5pMfA0QIuRoSkTpn2S-ZomH3A",
  authDomain: "training-accountability-app.firebaseapp.com",
  projectId: "training-accountability-app",
  storageBucket: "training-accountability-app.firebasestorage.app",
  messagingSenderId: "110778483282",
  appId: "1:110778483282:web:6334de85ff392f4b3f958b"
}, null, 2);

const defaults = {
  clientId: "client-" + Math.random().toString(36).slice(2, 10),
  firebaseConfig: DEFAULT_FIREBASE_CONFIG,
  programTitle: "32週間 トレーニング習慣化プラン",
  startDate: todayLocal(),
  totalWeeks: 32,
  sessionsPerWeek: 4,
  currentWeek: 6,
  expandedWeek: 6,
  calendarMonth: monthKey(todayLocal()),
  ifTrigger: "",
  thenAction: "",
  partnerName: "",
  partnerRule: "",
  penalty: "",
  notificationTime: "20:00",
  notificationMessage: "今日のトレーニング報告を忘れずに",
  notificationEnabled: false,
  lastNotifiedDate: "",
  auth: {
    uid: "",
    email: "",
    displayName: "",
    ready: false
  },
  team: {
    currentTeamId: "",
    currentTeamName: "",
    knownTeams: []
  },
  dateHearts: {},
  weeks: {}
};

const state = loadState();
const syncState = {
  firebaseSdk: null,
  app: null,
  db: null,
  auth: null,
  authUnsubscribe: null,
  teamUnsubscribe: null,
  isApplyingRemote: false,
  installPromptEvent: null,
  notificationTimer: null,
  serviceWorkerReady: false,
  serviceWorkerRegistration: null,
  messaging: null,
  messagingSupported: false,
  pushToken: "",
  pendingInviteTeamId: "",
  celebrationTimer: null,
  activeView: getDefaultActiveView(),
  authMode: "signin",
  teamMode: "join"
};

const elements = {
  layout: document.querySelector(".layout"),
  accountSection: document.getElementById("accountSection"),
  authGateSection: document.getElementById("authGateSection"),
  authGateTitle: document.getElementById("authGateTitle"),
  authGateMessage: document.getElementById("authGateMessage"),
  heroSection: document.getElementById("homeSection"),
  quickReportSection: document.getElementById("quickReportSection"),
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
  firebaseConfig: document.getElementById("firebaseConfig"),
  authDisplayName: document.getElementById("authDisplayName"),
  authEmail: document.getElementById("authEmail"),
  authPassword: document.getElementById("authPassword"),
  teamName: document.getElementById("teamName"),
  teamIdInput: document.getElementById("teamIdInput"),
  currentTeamDisplay: document.getElementById("currentTeamDisplay"),
  teamModeJoinButton: document.getElementById("teamModeJoinButton"),
  teamModeCreateButton: document.getElementById("teamModeCreateButton"),
  teamJoinPanel: document.getElementById("teamJoinPanel"),
  teamCreatePanel: document.getElementById("teamCreatePanel"),
  authStatus: document.getElementById("authStatus"),
  teamStatus: document.getElementById("teamStatus"),
  teamList: document.getElementById("teamList"),
  notificationStatus: document.getElementById("notificationStatus"),
  calendarTitle: document.getElementById("calendarTitle"),
  calendarGrid: document.getElementById("calendarGrid"),
  calendarNote: document.getElementById("calendarNote"),
  celebrationToast: document.getElementById("celebrationToast"),
  quickCurrentWeekChip: document.getElementById("quickCurrentWeekChip"),
  quickTeamChip: document.getElementById("quickTeamChip"),
  homeTeamSelect: document.getElementById("homeTeamSelect"),
  quickDate: document.getElementById("quickDate"),
  quickAerobic: document.getElementById("quickAerobic"),
  quickAnaerobic: document.getElementById("quickAnaerobic"),
  quickAddButton: document.getElementById("quickAddButton"),
  quickStatus: document.getElementById("quickStatus"),
  planPreview: document.getElementById("planPreview"),
  weeklyBoard: document.getElementById("weeklyBoard"),
  shareSummary: document.getElementById("shareSummary"),
  viewPanels: Array.from(document.querySelectorAll(".view-panel")),
  saveSettingsButton: document.getElementById("saveSettingsButton"),
  resetDataButton: document.getElementById("resetDataButton"),
  signUpButton: document.getElementById("signUpButton"),
  signInButton: document.getElementById("signInButton"),
  authModeTitle: document.getElementById("authModeTitle"),
  authModeDescription: document.getElementById("authModeDescription"),
  authPrimaryButton: document.getElementById("authPrimaryButton"),
  authSecondaryLink: document.getElementById("authSecondaryLink"),
  saveDisplayNameButton: document.getElementById("saveDisplayNameButton"),
  signOutButton: document.getElementById("signOutButton"),
  createTeamButton: document.getElementById("createTeamButton"),
  joinTeamButton: document.getElementById("joinTeamButton"),
  copyTeamIdButton: document.getElementById("copyTeamIdButton"),
  copyInviteLinkButton: document.getElementById("copyInviteLinkButton"),
  enableNotificationButton: document.getElementById("enableNotificationButton"),
  testNotificationButton: document.getElementById("testNotificationButton"),
  prevMonthButton: document.getElementById("prevMonthButton"),
  nextMonthButton: document.getElementById("nextMonthButton"),
  saveHabitButton: document.getElementById("saveHabitButton"),
  saveAccountabilityButton: document.getElementById("saveAccountabilityButton"),
  copySummaryButton: document.getElementById("copySummaryButton"),
  jumpCurrentWeekButton: document.getElementById("jumpCurrentWeekButton"),
  allTabs: Array.from(document.querySelectorAll(".tab-button"))
};

ensureDisplayNameControls();
normalizeState();
bootstrapInviteLink();
hydrateForm();
render();
attachStaticEvents();
registerServiceWorker();
autoBootstrapFirebase();

function ensureDisplayNameControls() {
  if (elements.authDisplayName && elements.saveDisplayNameButton) {
    return;
  }
  if (!elements.accountSection) {
    return;
  }
  const fieldGrid = elements.accountSection.querySelector(".field-grid");
  if (fieldGrid && !elements.authDisplayName) {
    const displayLabel = document.createElement("label");
    displayLabel.textContent = "表示名";
    const displayInput = document.createElement("input");
    displayInput.id = "authDisplayName";
    displayInput.type = "text";
    displayInput.placeholder = "例: こばやん";
    displayLabel.appendChild(displayInput);
    fieldGrid.insertBefore(displayLabel, fieldGrid.querySelector("label") || null);
    elements.authDisplayName = displayInput;
  }
  const buttonRow = elements.accountSection.querySelector(".button-row");
  if (buttonRow && !elements.saveDisplayNameButton) {
    const saveButton = document.createElement("button");
    saveButton.id = "saveDisplayNameButton";
    saveButton.type = "button";
    saveButton.className = "secondary";
    saveButton.textContent = "表示名を保存";
    const signOutButton = elements.signOutButton;
    if (signOutButton) {
      buttonRow.insertBefore(saveButton, signOutButton);
    } else {
      buttonRow.appendChild(saveButton);
    }
    elements.saveDisplayNameButton = saveButton;
  }
}

function attachStaticEvents() {
  elements.saveSettingsButton.addEventListener("click", () => {
    state.programTitle = sanitizeText(elements.programTitle.value, defaults.programTitle);
    state.startDate = elements.startDate.value || todayLocal();
    state.totalWeeks = clampNumber(elements.totalWeeks.value, 1, 104, defaults.totalWeeks);
    state.sessionsPerWeek = clampNumber(elements.sessionsPerWeek.value, 1, 14, defaults.sessionsPerWeek);
    state.currentWeek = computeCurrentWeekFromStartDate(state.startDate, state.totalWeeks);
    state.expandedWeek = clampNumber(state.expandedWeek, 0, state.totalWeeks, state.currentWeek);
    trimWeeksToProgram();
    persistAndRender();
  });

  elements.startDate.addEventListener("change", () => {
    const startDate = elements.startDate.value || todayLocal();
    const totalWeeks = clampNumber(elements.totalWeeks.value, 1, 104, defaults.totalWeeks);
    elements.currentWeek.value = computeCurrentWeekFromStartDate(startDate, totalWeeks);
  });

  elements.totalWeeks.addEventListener("change", () => {
    const startDate = elements.startDate.value || todayLocal();
    const totalWeeks = clampNumber(elements.totalWeeks.value, 1, 104, defaults.totalWeeks);
    elements.currentWeek.value = computeCurrentWeekFromStartDate(startDate, totalWeeks);
  });

  elements.resetDataButton.addEventListener("click", async () => {
    if (!window.confirm("設定と週次記録を初期化しますか？")) {
      return;
    }
    const preserved = {
      firebaseConfig: state.firebaseConfig,
      auth: { ...state.auth },
      team: { ...state.team },
      notificationTime: state.notificationTime,
      notificationMessage: state.notificationMessage,
      notificationEnabled: state.notificationEnabled,
      lastNotifiedDate: state.lastNotifiedDate
    };
    Object.assign(state, cloneDefaults());
    Object.assign(state, preserved);
    persistAndRender();
    await pushStateToRemote();
  });

  elements.signUpButton.addEventListener("click", async () => {
    await ensureFirebaseReady();
    const email = elements.authEmail.value.trim();
    const password = elements.authPassword.value;
    const displayName = sanitizeText(elements.authDisplayName?.value || "", "");
    if (!email || !password) {
      updateAuthStatus("メールアドレスとパスワードを入力してください。", true);
      return;
    }
    try {
      const sdk = await loadFirebaseSdk();
      await sdk.createUserWithEmailAndPassword(syncState.auth, email, password);
      if (displayName) {
        await saveDisplayName(displayName);
      }
      updateAuthStatus("アカウントを作成しました。");
    } catch (error) {
      updateAuthStatus("新規登録に失敗しました: " + error.message, true);
    }
  });

  elements.signInButton.addEventListener("click", async () => {
    await ensureFirebaseReady();
    const email = elements.authEmail.value.trim();
    const password = elements.authPassword.value;
    if (!email || !password) {
      updateAuthStatus("メールアドレスとパスワードを入力してください。", true);
      return;
    }
    try {
      const sdk = await loadFirebaseSdk();
      await sdk.signInWithEmailAndPassword(syncState.auth, email, password);
      updateAuthStatus("ログインしました。");
    } catch (error) {
      updateAuthStatus("ログインに失敗しました: " + error.message, true);
    }
  });

  if (elements.saveDisplayNameButton) {
    elements.saveDisplayNameButton.addEventListener("click", async () => {
      const displayName = sanitizeText(elements.authDisplayName?.value || "", "");
      if (!displayName) {
        updateAuthStatus("表示名を入力してください。", true);
        return;
      }
      if (!state.auth.uid) {
        state.auth.displayName = displayName;
        persistAndRender(false);
        updateAuthStatus("表示名を一時保存しました。ログイン後にもう一度「表示名を保存」を押すと共有されます。");
        return;
      }
      try {
        await saveDisplayName(displayName);
        updateAuthStatus("表示名を保存しました。");
      } catch (error) {
        updateAuthStatus("表示名の保存に失敗しました: " + error.message, true);
      }
    });
  }

  if (elements.authSecondaryLink) {
    elements.authSecondaryLink.addEventListener("click", () => {
      if (state.auth.uid) {
        return;
      }
      syncState.authMode = syncState.authMode === "signin" ? "signup" : "signin";
      render();
    });
  }

  if (elements.authPrimaryButton) {
    elements.authPrimaryButton.addEventListener("click", async () => {
      if (state.auth.uid) {
        return;
      }
      if (syncState.authMode === "signup") {
        elements.signUpButton.click();
        return;
      }
      elements.signInButton.click();
    });
  }

  if (elements.teamModeJoinButton) {
    elements.teamModeJoinButton.addEventListener("click", () => {
      syncState.teamMode = "join";
      renderTeamMode();
    });
  }

  if (elements.teamModeCreateButton) {
    elements.teamModeCreateButton.addEventListener("click", () => {
      syncState.teamMode = "create";
      renderTeamMode();
    });
  }

  elements.signOutButton.addEventListener("click", async () => {
    if (!syncState.auth) {
      return;
    }
    const sdk = await loadFirebaseSdk();
    await sdk.signOut(syncState.auth);
    updateAuthStatus("ログアウトしました。");
  });

  elements.createTeamButton.addEventListener("click", async () => {
    if (!state.auth.uid) {
      updateTeamStatus("先にログインしてください。", true);
      return;
    }
    await ensureFirebaseReady();
    const teamName = sanitizeText(elements.teamName.value, "");
    if (!teamName) {
      updateTeamStatus("チーム名を入力してください。", true);
      return;
    }
    try {
      const sdk = await loadFirebaseSdk();
      const teamId = buildTeamId(teamName);
      const teamRef = sdk.doc(syncState.db, "teams", teamId);
      await sdk.setDoc(teamRef, {
        name: teamName,
        ownerUid: state.auth.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }, { merge: true });
      await sdk.setDoc(sdk.doc(syncState.db, "teams", teamId, "members", state.auth.uid), {
        uid: state.auth.uid,
        email: state.auth.email,
        role: "owner",
        joinedAt: Date.now()
      }, { merge: true });
      addKnownTeam(teamId, teamName);
      await switchTeam(teamId, teamName);
      elements.teamIdInput.value = teamId;
      updateTeamStatus("チームを作成しました。チームIDを相手に共有してください。");
    } catch (error) {
      updateTeamStatus("チーム作成に失敗しました: " + error.message, true);
    }
  });

  elements.joinTeamButton.addEventListener("click", async () => {
    if (!state.auth.uid) {
      updateTeamStatus("先にログインしてください。", true);
      return;
    }
    await ensureFirebaseReady();
    const teamId = elements.teamIdInput.value.trim();
    if (!teamId) {
      updateTeamStatus("参加したいチームIDを入力してください。", true);
      return;
    }
    try {
      const sdk = await loadFirebaseSdk();
      const teamRef = sdk.doc(syncState.db, "teams", teamId);
      const teamSnap = await sdk.getDoc(teamRef);
      if (!teamSnap.exists()) {
        updateTeamStatus("そのチームIDは見つかりませんでした。", true);
        return;
      }
      const teamData = teamSnap.data();
      await sdk.setDoc(sdk.doc(syncState.db, "teams", teamId, "members", state.auth.uid), {
        uid: state.auth.uid,
        email: state.auth.email,
        role: "member",
        joinedAt: Date.now()
      }, { merge: true });
      addKnownTeam(teamId, teamData.name || teamId);
      await switchTeam(teamId, teamData.name || teamId);
      updateTeamStatus("チームに参加しました。");
    } catch (error) {
      updateTeamStatus("チーム参加に失敗しました: " + error.message, true);
    }
  });

  elements.copyTeamIdButton.addEventListener("click", async () => {
    if (!state.team.currentTeamId) {
      updateTeamStatus("コピーするチームIDがありません。", true);
      return;
    }
    const text = state.team.currentTeamId;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    }
    updateTeamStatus("チームIDをコピーしました: " + text);
  });

  elements.copyInviteLinkButton.addEventListener("click", async () => {
    if (!state.team.currentTeamId) {
      updateTeamStatus("招待リンクを作るには、先にチームを作成または選択してください。", true);
      return;
    }
    const link = buildInviteLink(state.team.currentTeamId);
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(link);
    }
    updateTeamStatus("招待リンクをコピーしました。相手にこのURLを送ってください。");
  });

  elements.prevMonthButton.addEventListener("click", () => {
    state.calendarMonth = shiftMonth(state.calendarMonth, -1);
    persistAndRender(false);
  });

  elements.nextMonthButton.addEventListener("click", () => {
    state.calendarMonth = shiftMonth(state.calendarMonth, 1);
    persistAndRender(false);
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
    if (!ensureViewAccess("report")) {
      return;
    }
    setActiveView("report");
    state.expandedWeek = getCurrentWeekIndex();
    persistAndRender(false);
    const card = document.getElementById("week-card-" + state.expandedWeek);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  elements.quickAddButton.addEventListener("click", () => {
    if (!ensureTeamReady("quick")) {
      return;
    }
    const result = addEntryToWeek(getCurrentWeekIndex(), {
      date: elements.quickDate.value || todayLocal(),
      aerobic: elements.quickAerobic.checked,
      anaerobic: elements.quickAnaerobic.checked
    });
    if (!result.ok) {
      elements.quickStatus.textContent = result.message;
      elements.quickStatus.className = "status-banner warn";
      return;
    }
    elements.quickAerobic.checked = false;
    elements.quickAnaerobic.checked = false;
    elements.quickStatus.textContent = "ホームから報告しました。";
    elements.quickStatus.className = "status-banner";
  });

  if (elements.homeTeamSelect) {
    elements.homeTeamSelect.addEventListener("change", async () => {
      const teamId = elements.homeTeamSelect.value;
      if (!teamId) {
        return;
      }
      const team = state.team.knownTeams.find((item) => item.id === teamId);
      await switchTeam(teamId, team?.name || teamId);
      updateTeamStatus("ホームからチームを切り替えました。");
    });
  }

  elements.allTabs.forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view || "home";
      if (!ensureViewAccess(view)) {
        return;
      }
      setActiveView(view);
      const target = document.getElementById(button.dataset.target);
      if (!target) {
        return;
      }
      requestAnimationFrame(() => {
        const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 16);
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  });

}

function render() {
  renderAuthForm();
  renderTeamMode();
  renderAppStage();
  syncActiveViewWithAccess();
  renderActiveView();
  renderSummary();
  renderQuickHome();
  renderPlanPreview();
  renderCalendar();
  renderWeeklyBoard();
  renderShareSummary();
  renderTeamList();
  renderStatus();
  hydrateForm();
}

function renderAuthForm() {
  const isSignedIn = Boolean(state.auth.uid);
  const isSignup = syncState.authMode === "signup";
  if (elements.authDisplayName) {
    const displayLabel = elements.authDisplayName.closest("label");
    if (displayLabel) {
      displayLabel.style.display = !isSignedIn && isSignup ? "grid" : "none";
    }
  }
  if (elements.authModeTitle) {
    elements.authModeTitle.textContent = isSignedIn ? "ログイン済み" : isSignup ? "新規登録" : "ログイン";
  }
  if (elements.authModeDescription) {
    elements.authModeDescription.textContent = isSignedIn
      ? "このアカウントでログインしています。必要ならログアウトできます。"
      : isSignup
        ? "最初にアカウントを作成します。登録後、そのままチーム選択へ進めます。"
        : "メールアドレスとパスワードを入力してログインします。";
  }
  if (elements.authPrimaryButton) {
    elements.authPrimaryButton.textContent = isSignedIn ? "ログイン済み" : isSignup ? "アカウントを作成" : "ログイン";
    elements.authPrimaryButton.disabled = isSignedIn;
  }
  if (elements.authSecondaryLink) {
    elements.authSecondaryLink.textContent = isSignedIn
      ? ""
      : isSignup
        ? "ログインはこちら"
        : "初めての方はこちら";
    elements.authSecondaryLink.style.display = isSignedIn ? "none" : "inline-flex";
  }
  if (elements.signUpButton) {
    elements.signUpButton.style.display = "none";
  }
  if (elements.signInButton) {
    elements.signInButton.style.display = "none";
  }
  if (elements.saveDisplayNameButton) {
    elements.saveDisplayNameButton.style.display = isSignedIn ? "none" : "none";
  }
  if (elements.signOutButton) {
    elements.signOutButton.style.display = isSignedIn ? "inline-flex" : "none";
  }
}

function renderTeamMode() {
  const isJoin = syncState.teamMode !== "create";
  if (elements.teamModeJoinButton) {
    elements.teamModeJoinButton.classList.toggle("active", isJoin);
  }
  if (elements.teamModeCreateButton) {
    elements.teamModeCreateButton.classList.toggle("active", !isJoin);
  }
  if (elements.teamJoinPanel) {
    elements.teamJoinPanel.hidden = !isJoin;
  }
  if (elements.teamCreatePanel) {
    elements.teamCreatePanel.hidden = isJoin;
  }
}

function renderActiveView() {
  document.body.dataset.activeView = syncState.activeView;
  elements.allTabs.forEach((button) => {
    const view = button.dataset.view || "home";
    const blocked = isViewBlocked(view);
    button.disabled = blocked;
    button.setAttribute("aria-disabled", blocked ? "true" : "false");
    button.classList.toggle("active", button.dataset.view === syncState.activeView);
  });
  elements.viewPanels.forEach((panel) => {
    const views = String(panel.dataset.views || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const visible = !views.length || views.includes(syncState.activeView);
    panel.classList.toggle("is-hidden", !visible);
  });
  const focusedView = syncState.activeView !== "home";
  if (elements.layout) {
    elements.layout.classList.toggle("focused", focusedView);
  }
  if (elements.heroSection) {
    elements.heroSection.classList.toggle("compact-view", focusedView);
  }
  if (elements.quickReportSection) {
    elements.quickReportSection.classList.toggle("compact-view", focusedView);
  }
}

function setActiveView(view) {
  if (isViewBlocked(view)) {
    syncActiveViewWithAccess();
    renderActiveView();
    return;
  }
  syncState.activeView = view;
  renderActiveView();
}

function renderAppStage() {
  const stage = getAppStage();
  document.body.dataset.appStage = stage;
  if (stage !== "app") {
    syncState.activeView = "team";
  }
  if (!elements.authGateTitle || !elements.authGateMessage) {
    return;
  }
  if (stage === "login") {
    elements.authGateTitle.textContent = "ログイン";
    elements.authGateMessage.textContent = "メールアドレスとパスワードでログインすると、共有カレンダーやトレーニング報告を使えるようになります。";
    return;
  }
  if (stage === "team") {
    elements.authGateTitle.textContent = "チームを選択";
    elements.authGateMessage.textContent = "ログインできました。次に、このアカウントで使うチームを選ぶか、新しく作成してください。チームが決まるとホーム画面へ進みます。";
    return;
  }
  elements.authGateTitle.textContent = "";
  elements.authGateMessage.textContent = "";
}

function renderQuickHome() {
  const currentWeek = getCurrentWeekIndex();
  elements.quickCurrentWeekChip.textContent = "Week " + currentWeek;
  elements.quickTeamChip.textContent = state.team.currentTeamName || (state.auth.uid ? "チーム未選択" : "ログインしてください");
  elements.quickDate.value = elements.quickDate.value || todayLocal();
  if (elements.homeTeamSelect) {
    const teamOptions = ['<option value="">参加チームを選択</option>']
      .concat(state.team.knownTeams.map((team) => `
        <option value="${escapeHtml(team.id)}" ${team.id === state.team.currentTeamId ? "selected" : ""}>
          ${escapeHtml(team.name || team.id)}
        </option>
      `));
    elements.homeTeamSelect.innerHTML = teamOptions.join("");
    elements.homeTeamSelect.disabled = !state.auth.uid || !state.team.knownTeams.length;
  }
  const blockedMessage = getTeamAccessMessage("quick");
  elements.quickAddButton.disabled = Boolean(blockedMessage);
  if (blockedMessage) {
    elements.quickStatus.textContent = blockedMessage;
    elements.quickStatus.className = "status-banner warn";
  } else if (elements.quickStatus.classList.contains("warn")) {
    elements.quickStatus.textContent = "";
    elements.quickStatus.className = "status-banner";
  }
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
    statCard("現在のチーム", state.team.currentTeamName || "未参加")
  ].join("");
}

function renderPlanPreview() {
  elements.planPreview.textContent = state.ifTrigger && state.thenAction
    ? "もし「" + state.ifTrigger + "」なら、その時「" + state.thenAction + "」をする。"
    : "まだ if-then プランが未設定です。";
}

function renderCalendar() {
  const currentMonth = parseMonthKey(state.calendarMonth || monthKey(todayLocal()));
  const titleDate = new Date(currentMonth.year, currentMonth.month - 1, 1);
  elements.calendarTitle.textContent = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long"
  }).format(titleDate);

  const weekHeads = ["日", "月", "火", "水", "木", "金", "土"]
    .map((day) => `<div class="calendar-head">${day}</div>`)
    .join("");
  const entriesByDate = getEntriesByDate();
  const firstDay = new Date(currentMonth.year, currentMonth.month - 1, 1);
  const startOffset = firstDay.getDay();
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - startOffset);
  const today = todayLocal();
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    const day = new Date(calendarStart);
    day.setDate(calendarStart.getDate() + i);
    const iso = isoDate(day);
    const inMonth = day.getMonth() === firstDay.getMonth();
    const dayEntries = entriesByDate.get(iso) || [];
    const heartInfo = getHeartInfo(iso);
    const liked = heartInfo.users.includes(getReactionActorId());
    const reporterLabels = getReporterLabelsForEntries(dayEntries);
    const stamps = dayEntries.map((entry) => {
      const label = entry.aerobic && entry.anaerobic ? "両" : entry.aerobic ? "有" : entry.anaerobic ? "無" : "記";
      const cls = entry.aerobic && entry.anaerobic ? "stamp both" : "stamp";
      return `<span class="${cls}">${label}</span>`;
    }).join("");
    const mobileStampLabel = dayEntries.length
      ? dayEntries.some((entry) => entry.aerobic && entry.anaerobic)
        ? "両"
        : dayEntries.some((entry) => entry.aerobic)
          ? dayEntries.some((entry) => entry.anaerobic) ? "混" : "有"
          : "無"
      : "";
    const reporterChips = reporterLabels.slice(0, 2).map((label) =>
      `<span class="reporter-chip">${escapeHtml(label)}</span>`
    ).join("");
    const reporterOverflow = reporterLabels.length > 2
      ? `<span class="reporter-chip more">+${reporterLabels.length - 2}</span>`
      : "";
    const classes = ["calendar-day"];
    if (!inMonth) {
      classes.push("outside");
    }
    if (iso === today) {
      classes.push("today");
    }
    if (dayEntries.length) {
      classes.push("has-entry");
    }
    cells.push(`
      <div class="${classes.join(" ")}">
        <span class="calendar-date">${day.getDate()}</span>
        <div class="stamp-row">${stamps}</div>
        ${reporterLabels.length ? `<div class="reporter-row">${reporterChips}${reporterOverflow}</div>` : ""}
        ${dayEntries.length ? `<div class="reporter-mobile-summary">
          <span class="mobile-mini-stamp">${escapeHtml(mobileStampLabel)}</span>
          <span>${escapeHtml(reporterLabels.length || dayEntries.length)}人</span>
        </div>` : ""}
        ${dayEntries.length ? `
          <button class="heart-button ${liked ? "active" : ""}" data-heart-date="${iso}" type="button">
            <span>${liked ? "♥" : "♡"}</span>
            <span>${heartInfo.users.length}</span>
          </button>
        ` : ""}
      </div>
    `);
  }

  elements.calendarGrid.innerHTML = weekHeads + cells.join("");
  elements.calendarGrid.querySelectorAll("[data-heart-date]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleHeartForDate(button.dataset.heartDate);
    });
  });
  const monthEntries = Array.from(entriesByDate.keys()).filter((date) => date.startsWith(state.calendarMonth)).length;
  elements.calendarNote.textContent = monthEntries
    ? `${monthEntries}日分の報告があります。 有=有酸素 / 無=無酸素 / 両=両方です。日付のハートで応援もできます。`
    : "まだこの月の報告はありません。報告するとスタンプがつきます。";
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
      const result = addEntryToWeek(week.index, {
        date: dateInput.value || todayLocal(),
        aerobic: aerobicInput.checked,
        anaerobic: anaerobicInput.checked
      });
      if (!result.ok) {
        window.alert(result.message);
      }
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

  state.team.knownTeams.forEach((team) => {
    const button = document.getElementById("switch-team-" + escapeId(team.id));
    if (!button) {
      return;
    }
    button.addEventListener("click", async () => {
      await switchTeam(team.id, team.name);
      updateTeamStatus("チームを切り替えました。");
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
            <div class="entry-meta">
              <span>報告者: ${escapeHtml(getEntryReporterLabel(entry))}</span>
            </div>
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

function renderTeamList() {
  if (!state.team.knownTeams.length) {
    elements.teamList.textContent = "まだチームはありません。ログイン後にチームを作成するか、相手から共有されたチームIDで参加してください。";
    return;
  }
  elements.teamList.innerHTML = state.team.knownTeams.map((team) => `
    <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;">
      <div style="display:grid; gap:4px; text-align:left;">
        <strong>${escapeHtml(team.name || team.id)}</strong>
        <span style="font-size:0.9rem; color:#5f6761;">ID: ${escapeHtml(team.id)}</span>
      </div>
      <button class="secondary mini" id="switch-team-${escapeId(team.id)}" type="button">このチームを開く</button>
    </div>
  `).join("");
}

function renderStatus() {
  const authMessage = state.auth.uid
    ? "ログイン中: " + (state.auth.email || state.auth.uid)
    : "未ログインです。ログインして利用を開始してください。";
  updateAuthStatus(authMessage, !state.auth.uid);

  const teamMessage = state.team.currentTeamId
    ? "現在のチーム: `" + state.team.currentTeamId + "` / " + (state.team.currentTeamName || "名前未設定")
    : syncState.pendingInviteTeamId
      ? "招待リンクから `" + syncState.pendingInviteTeamId + "` が入りました。ログイン後に「チームに参加」を押してください。"
      : "チーム未選択です。ログイン後にチームを作成するか参加してください。";
  updateTeamStatus(teamMessage, !state.team.currentTeamId);

}

async function loadFirebaseSdk() {
  if (syncState.firebaseSdk) {
    return syncState.firebaseSdk;
  }
  const [appModule, firestoreModule, authModule, messagingModule] = await Promise.all([
    import(FIREBASE_APP_URL),
    import(FIREBASE_FIRESTORE_URL),
    import(FIREBASE_AUTH_URL),
    import(FIREBASE_MESSAGING_URL)
  ]);
  syncState.firebaseSdk = {
    initializeApp: appModule.initializeApp,
    deleteApp: appModule.deleteApp,
    getFirestore: firestoreModule.getFirestore,
    doc: firestoreModule.doc,
    setDoc: firestoreModule.setDoc,
    getDoc: firestoreModule.getDoc,
    onSnapshot: firestoreModule.onSnapshot,
    collection: firestoreModule.collection,
    getDocs: firestoreModule.getDocs,
    query: firestoreModule.query,
    orderBy: firestoreModule.orderBy,
    initializeAuth: authModule.initializeAuth,
    getAuth: authModule.getAuth,
    browserLocalPersistence: authModule.browserLocalPersistence,
    browserSessionPersistence: authModule.browserSessionPersistence,
    indexedDBLocalPersistence: authModule.indexedDBLocalPersistence,
    onAuthStateChanged: authModule.onAuthStateChanged,
    createUserWithEmailAndPassword: authModule.createUserWithEmailAndPassword,
    signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
    signOut: authModule.signOut,
    getMessaging: messagingModule.getMessaging,
    getToken: messagingModule.getToken,
    onMessage: messagingModule.onMessage,
    isSupported: messagingModule.isSupported
  };
  return syncState.firebaseSdk;
}

async function ensureFirebaseReady() {
  const configText = elements.firebaseConfig.value.trim() || state.firebaseConfig;
  if (!configText) {
    updateAuthStatus("Firebase の初期設定が見つかりませんでした。", true);
    throw new Error("Missing Firebase config");
  }
  state.firebaseConfig = configText;
  if (syncState.app && syncState.auth && syncState.db) {
    return;
  }

  const sdk = await loadFirebaseSdk();
  const config = JSON.parse(configText);
  syncState.app = sdk.initializeApp(config, "training-accountability-" + Date.now());
  syncState.db = sdk.getFirestore(syncState.app);
  syncState.auth = sdk.initializeAuth(syncState.app, {
    persistence: [
      sdk.indexedDBLocalPersistence,
      sdk.browserLocalPersistence,
      sdk.browserSessionPersistence
    ]
  });

  if (syncState.authUnsubscribe) {
    syncState.authUnsubscribe();
  }
  syncState.authUnsubscribe = sdk.onAuthStateChanged(syncState.auth, async (user) => {
    state.auth.uid = user?.uid || "";
    state.auth.email = user?.email || "";
    state.auth.ready = true;
    persistAndRender(false);
    if (user) {
      await loadUserProfile();
      await loadMemberships();
      syncState.activeView = getDefaultActiveView();
      if (state.team.currentTeamId) {
        await subscribeToCurrentTeam();
      }
      persistAndRender(false);
    } else {
      await clearTeamSubscription();
      state.team.currentTeamId = "";
      state.team.currentTeamName = "";
      state.team.knownTeams = [];
      syncState.activeView = "team";
      persistAndRender(false);
    }
  });
}

async function autoBootstrapFirebase() {
  if (!state.firebaseConfig) {
    return;
  }
  try {
    await ensureFirebaseReady();
  } catch (_error) {
  }
}

async function loadUserProfile() {
  if (!state.auth.uid || !syncState.db) {
    return;
  }
  const sdk = await loadFirebaseSdk();
  const profileRef = sdk.doc(syncState.db, "users", state.auth.uid);
  const profileSnap = await sdk.getDoc(profileRef);
  if (profileSnap.exists()) {
    const data = profileSnap.data();
    state.auth.displayName = sanitizeText(data.displayName, state.auth.displayName || "");
  }
  persistAndRender(false);
}

async function loadMemberships() {
  if (!state.auth.uid || !syncState.db) {
    return;
  }
  const sdk = await loadFirebaseSdk();
  const memberships = await sdk.getDocs(sdk.collection(syncState.db, "users", state.auth.uid, "memberships"));
  const teams = memberships.docs.map((docSnap) => ({
    id: docSnap.id,
    name: docSnap.data().name || docSnap.id
  }));
  state.team.knownTeams = teams;
  if (!state.team.currentTeamId && teams.length) {
    state.team.currentTeamId = teams[0].id;
    state.team.currentTeamName = teams[0].name;
  } else if (state.team.currentTeamId) {
    const current = teams.find((team) => team.id === state.team.currentTeamId);
    if (current) {
      state.team.currentTeamName = current.name;
    } else if (teams.length) {
      state.team.currentTeamId = teams[0].id;
      state.team.currentTeamName = teams[0].name;
    }
  }
  persistAndRender(false);
}

async function switchTeam(teamId, teamName) {
  state.team.currentTeamId = teamId;
  state.team.currentTeamName = teamName || teamId;
  if (state.auth.uid) {
    syncState.activeView = "home";
  }
  persistAndRender(false);
  await subscribeToCurrentTeam();
}

async function subscribeToCurrentTeam() {
  await clearTeamSubscription();
  if (!state.team.currentTeamId || !syncState.db) {
    return;
  }
  const sdk = await loadFirebaseSdk();
  const reference = sdk.doc(syncState.db, "teams", state.team.currentTeamId, "plans", TEAM_PLAN_DOC_ID);
  const snapshot = await sdk.getDoc(reference);
  if (snapshot.exists()) {
    applyRemoteState(snapshot.data());
  } else {
    await pushStateToRemote();
  }
  syncState.teamUnsubscribe = sdk.onSnapshot(reference, (snap) => {
    if (!snap.exists() || syncState.isApplyingRemote) {
      return;
    }
    applyRemoteState(snap.data());
  });
}

async function clearTeamSubscription() {
  if (syncState.teamUnsubscribe) {
    syncState.teamUnsubscribe();
    syncState.teamUnsubscribe = null;
  }
}

async function pushStateToRemote() {
  if (!state.auth.uid || !state.team.currentTeamId || !syncState.db || syncState.isApplyingRemote) {
    return;
  }
  const sdk = await loadFirebaseSdk();
  const payload = buildRemotePayload();
  const reference = sdk.doc(syncState.db, "teams", state.team.currentTeamId, "plans", TEAM_PLAN_DOC_ID);
  await sdk.setDoc(reference, payload, { merge: true });
  await sdk.setDoc(sdk.doc(syncState.db, "users", state.auth.uid, "memberships", state.team.currentTeamId), {
    name: state.team.currentTeamName || state.team.currentTeamId,
    updatedAt: Date.now()
  }, { merge: true });
  state.team.lastSyncedAt = formatDateTime(payload.updatedAt);
  persistAndRender(false);
}

async function saveDisplayName(displayName) {
  await ensureFirebaseReady();
  if (!state.auth.uid || !syncState.db) {
    throw new Error("ログインが必要です。");
  }
  const sdk = await loadFirebaseSdk();
  const safeName = sanitizeText(displayName, "");
  if (!safeName) {
    throw new Error("表示名が空です。");
  }
  state.auth.displayName = safeName;
  rewriteReporterLabels(safeName);
  await sdk.setDoc(sdk.doc(syncState.db, "users", state.auth.uid), {
    email: state.auth.email || "",
    displayName: safeName,
    updatedAt: Date.now()
  }, { merge: true });
  if (state.team.currentTeamId) {
    await sdk.setDoc(sdk.doc(syncState.db, "teams", state.team.currentTeamId, "members", state.auth.uid), {
      uid: state.auth.uid,
      email: state.auth.email || "",
      displayName: safeName,
      updatedAt: Date.now()
    }, { merge: true });
    await sdk.setDoc(sdk.doc(syncState.db, "users", state.auth.uid, "memberships", state.team.currentTeamId), {
      name: state.team.currentTeamName || state.team.currentTeamId,
      displayName: safeName,
      updatedAt: Date.now()
    }, { merge: true });
  }
  persistAndRender(false);
}

function rewriteReporterLabels(displayName) {
  const safeName = sanitizeText(displayName, "");
  if (!safeName) {
    return;
  }
  Object.keys(state.weeks || {}).forEach((key) => {
    const savedWeek = ensureWeekRecord(Number(key));
    savedWeek.entries = savedWeek.entries.map((entry) => {
      const isMineByUid = state.auth.uid && entry.actorUid === state.auth.uid;
      const isMineByEmail = state.auth.email && entry.actorEmail === state.auth.email;
      if (!isMineByUid && !isMineByEmail) {
        return entry;
      }
      return {
        ...entry,
        actorLabel: safeName
      };
    });
  });
}

function applyRemoteState(remote) {
  if (!remote || !remote.state || remote.clientId === state.clientId) {
    return;
  }
  const previousCount = getTotalEntryCount();
  const incomingCount = countEntries(remote.state.weeks, remote.state.totalWeeks || state.totalWeeks);
  syncState.isApplyingRemote = true;
  const mergedWeeks = mergeWeeksState(
    remote.state.weeks,
    state.weeks,
    Math.max(remote.state.totalWeeks || 0, state.totalWeeks || 0)
  );
  const mergedHearts = mergeDateHearts(remote.state.dateHearts, state.dateHearts);
  const merged = {
    ...cloneDefaults(),
    ...remote.state,
    clientId: state.clientId,
    firebaseConfig: state.firebaseConfig,
    calendarMonth: state.calendarMonth,
    weeks: mergedWeeks,
    dateHearts: mergedHearts,
    auth: { ...state.auth },
    team: {
      ...state.team,
      currentTeamId: state.team.currentTeamId,
      currentTeamName: state.team.currentTeamName,
      knownTeams: state.team.knownTeams
    }
  };
  Object.assign(state, merged);
  normalizeState();
  persistAndRender(false);
  syncState.isApplyingRemote = false;
  if (countEntries(mergedWeeks, state.totalWeeks) > incomingCount) {
    pushStateToRemote().catch((error) => {
      updateTeamStatus("チーム同期に失敗しました: " + error.message, true);
    });
  }
  if (incomingCount > previousCount) {
    notifyEntryAdded(null, "remote");
  }
}

function buildRemotePayload() {
  return {
    updatedAt: Date.now(),
    clientId: state.clientId,
    actorUid: state.auth.uid || "",
    actorEmail: state.auth.email || "",
    entryCount: getTotalEntryCount(),
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
      dateHearts: state.dateHearts,
      weeks: state.weeks
    }
  };
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  try {
    syncState.serviceWorkerRegistration = await navigator.serviceWorker.register(`./training-app-sw.js?v=${SERVICE_WORKER_VERSION}`, {
      updateViaCache: "none"
    });
    syncState.serviceWorkerReady = true;
    renderStatus();
  } catch (_error) {
  }
}

async function registerPushNotifications() {
  return;
}

function persistAndRender(pushRemote = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  render();
  if (pushRemote) {
    pushStateToRemote().catch((error) => {
      updateTeamStatus("チーム同期に失敗しました: " + error.message, true);
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
  state.calendarMonth = state.calendarMonth || monthKey(todayLocal());
  state.firebaseConfig = state.firebaseConfig || defaults.firebaseConfig;
  state.auth = { ...defaults.auth, ...(state.auth || {}) };
  state.team = { ...defaults.team, ...(state.team || {}) };
  if (syncState.authMode !== "signin" && syncState.authMode !== "signup") {
    syncState.authMode = "signin";
  }
  if (syncState.teamMode !== "join" && syncState.teamMode !== "create") {
    syncState.teamMode = "join";
  }
  if (!state.dateHearts || typeof state.dateHearts !== "object") {
    state.dateHearts = {};
  }
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
      anaerobic: Boolean(entry.anaerobic),
      actorUid: entry.actorUid || "",
      actorEmail: entry.actorEmail || "",
      actorLabel: entry.actorLabel || ""
    }));
  } else if (Number.isFinite(saved.sessions) && saved.sessions > 0) {
    for (let i = 0; i < saved.sessions; i += 1) {
      entries.push({
        id: createEntryId(index, todayLocal(), i),
        date: todayLocal(),
        aerobic: false,
        anaerobic: false,
        actorUid: "",
        actorEmail: "",
        actorLabel: ""
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

function addEntryToWeek(weekIndex, values) {
  const accessMessage = getTeamAccessMessage("report");
  if (accessMessage) {
    return { ok: false, message: accessMessage };
  }
  if (!values.aerobic && !values.anaerobic) {
    return { ok: false, message: "有酸素・無酸素のどちらかをチェックしてください。" };
  }
  const savedWeek = ensureWeekRecord(weekIndex);
  const entry = {
    id: createEntryId(weekIndex, values.date || todayLocal(), savedWeek.entries.length),
    date: values.date || todayLocal(),
    aerobic: Boolean(values.aerobic),
    anaerobic: Boolean(values.anaerobic),
    actorUid: state.auth.uid || "",
    actorEmail: state.auth.email || "",
    actorLabel: getCurrentReporterLabel()
  };
  savedWeek.entries.unshift(entry);
  state.expandedWeek = weekIndex;
  state.calendarMonth = monthKey(entry.date);
  persistAndRender();
  notifyEntryAdded(entry, "local");
  return { ok: true, entry };
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

function computeCurrentWeekFromStartDate(startDate, totalWeeks) {
  const start = parseLocalDate(startDate || todayLocal());
  const today = parseLocalDate(todayLocal());
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedWeeks = diffDays < 0 ? 0 : Math.floor(diffDays / 7);
  return clampNumber(elapsedWeeks + 1, 1, totalWeeks || defaults.totalWeeks, 1);
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
    state.team.currentTeamName ? "チーム: " + state.team.currentTeamName : "チーム未設定",
    state.penalty ? "未達時: " + state.penalty : "罰ゲームは未設定"
  ].join(" | ");
}

function getEntriesByDate() {
  const map = new Map();
  getWeeksArray().forEach((week) => {
    week.entries.forEach((entry) => {
      if (!map.has(entry.date)) {
        map.set(entry.date, []);
      }
      map.get(entry.date).push(entry);
    });
  });
  return map;
}

function getReactionActorId() {
  return state.auth.uid || state.clientId;
}

function getHeartInfo(date) {
  const bucket = state.dateHearts?.[date];
  if (!bucket || typeof bucket !== "object") {
    return { users: [] };
  }
  return {
    users: Array.isArray(bucket.users) ? bucket.users : []
  };
}

function toggleHeartForDate(date) {
  const accessMessage = getTeamAccessMessage("calendar");
  if (accessMessage) {
    updateTeamStatus(accessMessage, true);
    if (!state.auth.uid || !state.team.currentTeamId) {
      setActiveView("team");
    }
    return;
  }
  const actorId = getReactionActorId();
  const current = getHeartInfo(date);
  const users = current.users.includes(actorId)
    ? current.users.filter((id) => id !== actorId)
    : [...current.users, actorId];
  if (!users.length) {
    delete state.dateHearts[date];
  } else {
    state.dateHearts[date] = {
      users,
      updatedAt: Date.now()
    };
  }
  persistAndRender();
}

function getTotalEntryCount() {
  return countEntries(state.weeks, state.totalWeeks);
}

function countEntries(weeks, totalWeeks) {
  if (!weeks || typeof weeks !== "object") {
    return 0;
  }
  let sum = 0;
  for (let index = 1; index <= (totalWeeks || 0); index += 1) {
    sum += normalizeWeek(index, weeks[index]).entries.length;
  }
  return sum;
}

function mergeWeeksState(primaryWeeks, secondaryWeeks, totalWeeks) {
  const merged = {};
  for (let index = 1; index <= (totalWeeks || 0); index += 1) {
    const primary = normalizeWeek(index, primaryWeeks?.[index]);
    const secondary = normalizeWeek(index, secondaryWeeks?.[index]);
    const byId = new Map();
    [...primary.entries, ...secondary.entries].forEach((entry, entryIndex) => {
      const safeEntry = {
        id: entry.id || createEntryId(index, entry.date || todayLocal(), entryIndex),
        date: entry.date || todayLocal(),
        aerobic: Boolean(entry.aerobic),
        anaerobic: Boolean(entry.anaerobic),
        actorUid: entry.actorUid || "",
        actorEmail: entry.actorEmail || "",
        actorLabel: entry.actorLabel || ""
      };
      byId.set(safeEntry.id, safeEntry);
    });
    const entries = Array.from(byId.values()).sort((a, b) => {
      if (a.date === b.date) {
        return String(b.id).localeCompare(String(a.id));
      }
      return String(b.date).localeCompare(String(a.date));
    });
    if (entries.length || primary.confirmed || secondary.confirmed) {
      merged[index] = {
        entries,
        confirmed: Boolean(primary.confirmed || secondary.confirmed)
      };
    }
  }
  return merged;
}

function mergeDateHearts(primaryHearts, secondaryHearts) {
  const merged = {};
  const dates = new Set([
    ...Object.keys(primaryHearts || {}),
    ...Object.keys(secondaryHearts || {})
  ]);
  dates.forEach((date) => {
    const primaryUsers = getHeartUsers(primaryHearts?.[date]);
    const secondaryUsers = getHeartUsers(secondaryHearts?.[date]);
    const users = Array.from(new Set([...primaryUsers, ...secondaryUsers]));
    if (!users.length) {
      return;
    }
    merged[date] = {
      users,
      updatedAt: Math.max(
        Number(primaryHearts?.[date]?.updatedAt || 0),
        Number(secondaryHearts?.[date]?.updatedAt || 0)
      )
    };
  });
  return merged;
}

function getHeartUsers(bucket) {
  if (!bucket || typeof bucket !== "object" || !Array.isArray(bucket.users)) {
    return [];
  }
  return bucket.users.filter(Boolean);
}

function getEntryStampShortLabel(entry) {
  if (!entry) {
    return "報";
  }
  if (entry.aerobic && entry.anaerobic) {
    return "両";
  }
  if (entry.aerobic) {
    return "有";
  }
  if (entry.anaerobic) {
    return "無";
  }
  return "報";
}

function celebrateEntry(entry, source = "local") {
  if (!elements.celebrationToast) {
    return;
  }
  const shortLabel = getEntryStampShortLabel(entry);
  const title = source === "local" ? "頑張ったね！" : "新しい報告が届きました";
  const body = source === "local"
    ? `${getEntryTypeLabel(entry)} の報告を記録しました。今日の積み上げがカレンダーにも反映されています。`
    : "チームで新しいトレーニング報告が追加されました。";
  elements.celebrationToast.innerHTML = `
    <div class="celebration-top">
      <span class="celebration-mark">${escapeHtml(shortLabel)}</span>
      <p class="celebration-title">${escapeHtml(title)}</p>
    </div>
    <p class="celebration-copy">${escapeHtml(body)}</p>
  `;
  elements.celebrationToast.classList.add("visible");
  if (syncState.celebrationTimer) {
    window.clearTimeout(syncState.celebrationTimer);
  }
  syncState.celebrationTimer = window.setTimeout(() => {
    elements.celebrationToast.classList.remove("visible");
  }, 2400);
}

function notifyEntryAdded(entry, source = "local") {
  if (source === "local") {
    celebrateEntry(entry, "local");
  } else {
    celebrateEntry(entry, "remote");
  }
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

function getCurrentReporterLabel() {
  if (state.auth.displayName) {
    return state.auth.displayName;
  }
  if (state.auth.email) {
    return simplifyReporterLabel(state.auth.email);
  }
  return "あなた";
}

function getEntryReporterLabel(entry) {
  if (entry?.actorLabel) {
    return entry.actorLabel;
  }
  if (entry?.actorEmail) {
    return simplifyReporterLabel(entry.actorEmail);
  }
  return "記録者不明";
}

function getReporterLabelsForEntries(entries) {
  return Array.from(new Set((entries || []).map((entry) => getEntryReporterLabel(entry))));
}

function simplifyReporterLabel(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "記録者不明";
  }
  const atIndex = text.indexOf("@");
  return atIndex > 0 ? text.slice(0, atIndex) : text;
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
  elements.firebaseConfig.value = state.firebaseConfig;
  if (elements.authDisplayName) {
    elements.authDisplayName.value = state.auth.displayName || "";
  }
  elements.authEmail.value = state.auth.email || elements.authEmail.value;
  elements.teamIdInput.value = syncState.pendingInviteTeamId || state.team.currentTeamId || elements.teamIdInput.value;
  elements.currentTeamDisplay.value = state.team.currentTeamId
    ? state.team.currentTeamName + " (" + state.team.currentTeamId + ")"
    : "";
}

function bootstrapInviteLink() {
  try {
    const url = new URL(window.location.href);
    const teamId = url.searchParams.get("teamId");
    if (!teamId) {
      return;
    }
    syncState.pendingInviteTeamId = teamId.trim();
  } catch (_error) {
  }
}

function addKnownTeam(teamId, teamName) {
  const exists = state.team.knownTeams.find((team) => team.id === teamId);
  if (exists) {
    exists.name = teamName;
    return;
  }
  state.team.knownTeams.push({ id: teamId, name: teamName });
}

function buildTeamId(teamName) {
  const slug = teamName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20) || "team";
  return slug + "-" + Math.random().toString(36).slice(2, 6);
}

function buildInviteLink(teamId) {
  const url = new URL(window.location.href);
  url.searchParams.set("teamId", teamId);
  return url.toString();
}

function escapeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function updateAuthStatus(message, warn = false) {
  elements.authStatus.textContent = message;
  elements.authStatus.className = "status-banner" + (warn ? " warn" : "");
}

function updateTeamStatus(message, warn = false) {
  elements.teamStatus.textContent = message;
  elements.teamStatus.className = "status-banner" + (warn ? " warn" : "");
}

function updateNotificationStatus(message, warn = false) {
  if (!elements.notificationStatus) {
    return;
  }
  elements.notificationStatus.textContent = message;
  elements.notificationStatus.className = "status-banner" + (warn ? " warn" : "");
}

function getDefaultActiveView() {
  return state.auth?.uid && state.team?.currentTeamId ? "home" : "team";
}

function getAppStage() {
  if (!state.auth?.uid) {
    return "login";
  }
  if (!state.team?.currentTeamId) {
    return "team";
  }
  return "app";
}

function isViewBlocked(view) {
  if (view !== "report" && view !== "calendar") {
    return false;
  }
  return Boolean(getTeamAccessMessage(view));
}

function syncActiveViewWithAccess() {
  if (!isViewBlocked(syncState.activeView)) {
    return;
  }
  syncState.activeView = "team";
}

function ensureViewAccess(view) {
  const blockedMessage = getTeamAccessMessage(view);
  if (!blockedMessage) {
    return true;
  }
  if (!state.auth.uid) {
    updateAuthStatus(blockedMessage, true);
  } else {
    updateTeamStatus(blockedMessage, true);
  }
  syncState.activeView = "team";
  renderActiveView();
  return false;
}

function ensureTeamReady(context) {
  const blockedMessage = getTeamAccessMessage(context);
  if (!blockedMessage) {
    return true;
  }
  if (!state.auth.uid) {
    updateAuthStatus(blockedMessage, true);
  } else {
    updateTeamStatus(blockedMessage, true);
  }
  setActiveView("team");
  return false;
}

function getTeamAccessMessage(context) {
  if (context !== "report" && context !== "calendar" && context !== "quick") {
    return "";
  }
  if (!state.auth.uid) {
    return "ログイン後に利用できます。先にチーム画面からログインしてください。";
  }
  if (!state.team.currentTeamId) {
    return "先に参加チームを選択してください。";
  }
  return "";
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

function monthKey(value) {
  return String(value).slice(0, 7);
}

function parseMonthKey(value) {
  const [year, month] = String(value).split("-").map(Number);
  return { year, month };
}

function shiftMonth(key, delta) {
  const { year, month } = parseMonthKey(key);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
