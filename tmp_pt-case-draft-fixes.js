

/* ===== UI FIXES (2026-04-05) =====
   Fix 1: ログイン誘導の改善
   Fix 2: 管理者UI分離  
   Fix 3: ラベルアクセシビリティ修正 */
(function applyUiFixes() {
  const signedOutView = document.getElementById("signed-out-view");
  if (signedOutView) {
    const descParas = signedOutView.querySelectorAll("p.small");
    if (descParas[0]) {
      descParas[0].textContent = "症例発表・Evidence Review の生成にはログインが必要です。メールアドレスとパスワードで新規登録できます。";
    }
    const authBox = signedOutView.querySelector(".auth-box");
    if (authBox && !authBox.querySelector(".login-required-notice")) {
      const notice = document.createElement("p");
      notice.className = "login-required-notice small";
      notice.style.cssText = "background:rgba(164,73,49,0.10);border-left:3px solid #a44931;border-radius:8px;padding:10px 14px;margin:0 0 12px;color:#6f2f22;font-weight:600;";
      notice.textContent = "生成・履歴保存にはログインまたは会員登録が必要です。";
      authBox.insertBefore(notice, authBox.firstChild);
    }
  }
  const adminPanel = document.getElementById("admin-panel");
  if (adminPanel) {
    const adminSection = document.createElement("div");
    adminSection.id = "admin-section";
    adminSection.className = "content-stack";
    adminSection.style.cssText = "margin-top:0;";
    const adminCard = document.createElement("section");
    adminCard.className = "card panel";
    adminCard.style.cssText = "padding:20px 24px;";
    adminCard.appendChild(adminPanel);
    adminSection.appendChild(adminCard);
    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.appendChild(adminSection);
  }
  const labelFixes = [
    { labelText: "職種",  buttonId: "profession-pt", ariaLabelId: "aria-label-profession" },
    { labelText: "モード", buttonId: "feature-case",  ariaLabelId: "aria-label-mode" },
  ];
  labelFixes.forEach(({ labelText, buttonId, ariaLabelId }) => {
    const label = Array.from(document.querySelectorAll("label")).find(l => l.textContent.trim() === labelText);
    const btn = document.getElementById(buttonId);
    if (!label || !btn) return;
    label.id = ariaLabelId;
    const group = btn.parentElement;
    if (group && group.tagName === "DIV") {
      group.setAttribute("role", "group");
      group.setAttribute("aria-labelledby", ariaLabelId);
    }
  });
  const caseModeBtn = document.getElementById("mode-initial");
  if (caseModeBtn) {
    const g = caseModeBtn.parentElement;
    if (g && g.tagName === "DIV") {
      g.setAttribute("role", "group");
      g.setAttribute("aria-label", "評価フェーズ選択");
    }
  }
})();
