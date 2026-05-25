import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js";

const storageKey = "flow-expenses-v1";
const categoryStorageKey = "flow-categories-v1";
const profileStorageKey = "flow-profile-v1";
const installNoteStorageKey = "flow-install-note-dismissed-v1";
const defaultProfileName = "Rein";
const defaultCategories = ["Food", "Gas", "Coffee", "Shopping", "Bills", "Transport"];
const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const supabase = supabaseConfigured ? await createSupabaseClient() : null;
const initialSession = supabase ? await getSupabaseSession() : null;
const promptExamples = ["120 coffee", "199 lunch", "850 gas", "45 water", "250 dinner"];
const keywordMap = {
  coffee: "Coffee",
  latte: "Coffee",
  starbucks: "Coffee",
  lunch: "Food",
  dinner: "Food",
  breakfast: "Food",
  food: "Food",
  meal: "Food",
  gas: "Gas",
  fuel: "Gas",
  petrol: "Gas",
  fare: "Transport",
  grab: "Transport",
  taxi: "Transport",
  bus: "Transport",
  jeep: "Transport",
  bill: "Bills",
  bills: "Bills",
  rent: "Bills",
  water: "Bills",
  electric: "Bills",
  electricity: "Bills",
  shopping: "Shopping",
  shoes: "Shopping",
  shirt: "Shopping",
};
const iconPaths = {
  food: '<path d="M6 3v8M10 3v8M8 3v18" /><path d="M15 3v18" /><path d="M15 3c3 2 4 5 4 8h-4" />',
  gas: '<path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" /><path d="M4 21h13" /><path d="M8 7h5" /><path d="m16 8 3 3v6a2 2 0 0 0 2 2" />',
  coffee: '<path d="M5 8h11v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" /><path d="M16 10h1a3 3 0 0 1 0 6h-1" /><path d="M7 3v2M11 3v2M15 3v2" /><path d="M4 21h14" />',
  shopping: '<path d="M6 8h12l-1 13H7L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" />',
  bills: '<path d="M7 3h10l2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5l2-2Z" /><path d="M9 8h6M9 12h6M9 16h4" />',
  transport: '<path d="M6 17h12l1-6-3-5H8l-3 5 1 6Z" /><path d="M8 17v2M16 17v2M7 12h10" />',
  house: '<path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10" /><path d="M9 21v-6h6v6" />',
  membership: '<path d="M6 4h12v16H6Z" /><path d="M9 8h6" /><path d="M9 12h6" /><path d="M9 16h3" /><path d="M16 16l1 1 2-3" />',
  other: '<path d="M4 7h16" /><path d="M7 7l1-3h8l1 3" /><path d="M6 7l1 14h10l1-14" /><path d="M10 11v6M14 11v6" />',
};
const iconLabels = {
  other: "Other",
  food: "Food",
  gas: "Gas",
  coffee: "Coffee",
  shopping: "Shopping",
  bills: "Bills",
  transport: "Transport",
  house: "House",
  membership: "Membership",
};
const iconKeywords = {
  bill: iconPaths.bills,
  bus: iconPaths.transport,
  dinner: iconPaths.food,
  fare: iconPaths.transport,
  fuel: iconPaths.gas,
  grab: iconPaths.transport,
  grocery: iconPaths.food,
  home: iconPaths.house,
  house: iconPaths.house,
  improvement: iconPaths.house,
  lunch: iconPaths.food,
  market: iconPaths.shopping,
  meal: iconPaths.food,
  member: iconPaths.membership,
  membership: iconPaths.membership,
  petrol: iconPaths.gas,
  rent: iconPaths.bills,
  shop: iconPaths.shopping,
  taxi: iconPaths.transport,
  utility: iconPaths.bills,
};
const categoryData = loadCategoryData();
const profileData = loadProfile();

const state = {
  expenses: loadExpenses(),
  categories: categoryData.categories,
  categoryIcons: categoryData.icons,
  profileName: profileData.name,
  auth: { email: initialSession?.user?.email || "" },
  authenticated: Boolean(initialSession),
  user: initialSession?.user || null,
  categoryPage: 0,
  categoryEditMode: false,
  categoryEditTarget: "",
  dragCategory: "",
  touchDragCategory: "",
  touchDragLastTarget: "",
  newCategoryIcon: "other",
  iconManuallyPicked: false,
  settingsReturnFocus: null,
  insightDetailCloseTimer: 0,
  selectedCategory: "Food",
  editingId: "",
  openMenuId: "",
  collapsedDays: new Set(),
  deferredInstallPrompt: null,
};

const elements = {
  installNote: document.querySelector("#install-note"),
  installNoteCopy: document.querySelector("#install-note-copy"),
  installNoteAction: document.querySelector("#install-note-action"),
  dismissInstallNote: document.querySelector("#dismiss-install-note"),
  authScreen: document.querySelector("#auth-screen"),
  appShell: document.querySelector("#app-shell"),
  authActions: document.querySelector("#auth-actions"),
  authGetStarted: document.querySelector("#auth-get-started"),
  authSignIn: document.querySelector("#auth-sign-in"),
  signupForm: document.querySelector("#signup-form"),
  signupName: document.querySelector("#signup-name"),
  signupEmail: document.querySelector("#signup-email"),
  signupPassword: document.querySelector("#signup-password"),
  signinForm: document.querySelector("#signin-form"),
  signinEmail: document.querySelector("#signin-email"),
  signinPassword: document.querySelector("#signin-password"),
  authMessage: document.querySelector("#auth-message"),
  greeting: document.querySelector("#greeting"),
  quickEntry: document.querySelector("#quick-entry"),
  noteEntry: document.querySelector("#note-entry"),
  expenseForm: document.querySelector("#expense-form"),
  parsePreview: document.querySelector("#parse-preview"),
  categoryGrid: document.querySelector("#category-grid"),
  categoryPagination: document.querySelector("#category-pagination"),
  categoryEditBar: document.querySelector("#category-edit-bar"),
  renameCategoryButton: document.querySelector("#rename-category-button"),
  deleteCategoryButton: document.querySelector("#delete-category-button"),
  doneCategoryButton: document.querySelector("#done-category-button"),
  categoryComposer: document.querySelector("#category-composer"),
  customCategoryEntry: document.querySelector("#custom-category-entry"),
  customCategoryIconPicker: document.querySelector("#custom-category-icon-picker"),
  saveCategoryButton: document.querySelector("#save-category-button"),
  cancelCategoryButton: document.querySelector("#cancel-category-button"),
  saveButton: document.querySelector("#save-button"),
  cancelEditButton: document.querySelector("#cancel-edit-button"),
  historyList: document.querySelector("#history-list"),
  insightWeek: document.querySelector("#insight-week"),
  insightMonth: document.querySelector("#insight-month"),
  insightAverage: document.querySelector("#insight-average"),
  insightTop: document.querySelector("#insight-top"),
  weekDetailButton: document.querySelector("#week-detail-button"),
  monthDetailButton: document.querySelector("#month-detail-button"),
  insightDetailSheet: document.querySelector("#insight-detail-sheet"),
  insightDetailKicker: document.querySelector("#insight-detail-kicker"),
  insightDetailTitle: document.querySelector("#insight-detail-title"),
  insightDetailTotal: document.querySelector("#insight-detail-total"),
  insightDetailContent: document.querySelector("#insight-detail-content"),
  closeInsightDetailButton: document.querySelector("#close-insight-detail-button"),
  breakdownList: document.querySelector("#breakdown-list"),
  toast: document.querySelector("#toast"),
  successBurst: document.querySelector("#success-burst"),
  successTitle: document.querySelector("#success-title"),
  successDetail: document.querySelector("#success-detail"),
  profileButton: document.querySelector("#profile-button"),
  profileAvatar: document.querySelector("#profile-avatar"),
  profileNameDisplay: document.querySelector("#profile-name-display"),
  profileNameInput: document.querySelector("#profile-name-input"),
  accountEmail: document.querySelector("#account-email"),
  settingsSheet: document.querySelector("#settings-sheet"),
  closeSettingsButton: document.querySelector("#close-settings-button"),
  logoutButton: document.querySelector("#logout-button"),
  installButton: document.querySelector("#install-button"),
  addExpenseButton: document.querySelector("#add-expense-button"),
  clearButton: document.querySelector("#clear-button"),
  tabs: document.querySelectorAll(".tab"),
  screens: document.querySelectorAll(".screen"),
};

renderCategories();
renderIconPicker();
renderProfile();
renderAll();
renderEmptyPrompt();
renderInstallNote();
if (state.authenticated) {
  await loadRemoteData();
  showApp();
} else {
  showAuth("welcome");
  if (!supabaseConfigured) {
    showAuthMessage("Add Supabase URL and anon key to supabase-config.js.");
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.deferredInstallPrompt = event;
  renderInstallNote();
});

if ("serviceWorker" in navigator) {
  registerServiceWorker();
}

if (supabase) {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.authenticated = Boolean(session);
    state.user = session?.user || null;
    state.auth = { email: session?.user?.email || "" };
    if (session) {
      await loadRemoteData();
      showApp();
    }
  });
}

elements.authGetStarted.addEventListener("click", () => {
  showAuth("signup");
});

elements.authSignIn.addEventListener("click", () => {
  showAuth("signin");
});

elements.installNoteAction.addEventListener("click", async () => {
  if (state.deferredInstallPrompt) {
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    dismissInstallNote();
    return;
  }

  showToast(isIOS() ? "Tap Share, then Add to Home Screen" : "Open browser menu, then Add to Home Screen");
});

elements.dismissInstallNote.addEventListener("click", () => {
  dismissInstallNote();
});

document.querySelectorAll("[data-auth-mode]").forEach((button) => {
  button.addEventListener("click", () => showAuth(button.dataset.authMode));
});

elements.signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createAccount();
});

elements.signinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  signIn();
});

elements.quickEntry.addEventListener("input", () => {
  const parsed = parseEntry(elements.quickEntry.value);
  if (parsed.category) {
    selectCategory(parsed.category);
  }
  renderPreview(parsed);
});

elements.categoryGrid.addEventListener("scroll", () => {
  window.requestAnimationFrame(syncCategoryPage);
});

elements.categoryGrid.addEventListener("dragstart", (event) => {
  const item = event.target.closest("[data-category]");
  if (!state.categoryEditMode || !item || event.target.closest("[data-category-move]")) {
    event.preventDefault();
    return;
  }

  state.dragCategory = item.dataset.category;
  event.dataTransfer.effectAllowed = "move";
});

elements.categoryGrid.addEventListener("dragover", (event) => {
  if (!state.dragCategory) {
    return;
  }

  event.preventDefault();
});

elements.categoryGrid.addEventListener("drop", (event) => {
  const item = event.target.closest("[data-category]");
  if (!state.dragCategory || !item || item.dataset.category === state.dragCategory) {
    return;
  }

  event.preventDefault();
  moveCategoryBefore(state.dragCategory, item.dataset.category);
  state.dragCategory = "";
});

elements.categoryGrid.addEventListener(
  "touchmove",
  (event) => {
    if (!state.categoryEditMode || !state.touchDragCategory) {
      return;
    }

    const touch = event.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("[data-category]");
    const targetCategory = target?.dataset.category;

    if (!targetCategory || targetCategory === state.touchDragCategory || targetCategory === state.touchDragLastTarget) {
      return;
    }

    event.preventDefault();
    state.touchDragLastTarget = targetCategory;
    moveCategoryBefore(state.touchDragCategory, targetCategory);
  },
  { passive: false },
);

elements.categoryGrid.addEventListener("touchend", () => {
  state.touchDragCategory = "";
  state.touchDragLastTarget = "";
});

elements.categoryGrid.addEventListener("touchcancel", () => {
  state.touchDragCategory = "";
  state.touchDragLastTarget = "";
});

elements.categoryPagination.addEventListener("click", (event) => {
  const dot = event.target.closest("button[data-page]");
  if (!dot) {
    return;
  }

  scrollCategoryPage(Number(dot.dataset.page));
});

elements.saveCategoryButton.addEventListener("click", () => {
  addCustomCategory(elements.customCategoryEntry.value);
});

elements.renameCategoryButton.addEventListener("click", () => {
  renameCategory();
});

elements.deleteCategoryButton.addEventListener("click", () => {
  deleteCategory();
});

elements.doneCategoryButton.addEventListener("click", () => {
  closeCategoryEditMode();
});

elements.cancelCategoryButton.addEventListener("click", () => {
  hideCategoryComposer();
});

elements.customCategoryEntry.addEventListener("input", () => {
  if (!state.iconManuallyPicked) {
    state.newCategoryIcon = inferCategoryIcon(elements.customCategoryEntry.value);
    renderIconPicker();
  }
});

elements.customCategoryEntry.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addCustomCategory(elements.customCategoryEntry.value);
  }
});

elements.customCategoryIconPicker.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-icon]");
  if (!button) {
    return;
  }

  state.newCategoryIcon = button.dataset.icon;
  state.iconManuallyPicked = true;
  renderIconPicker();
});

elements.profileButton.addEventListener("click", () => {
  openSettings();
});

elements.weekDetailButton.addEventListener("click", () => {
  openInsightDetail("week");
});

elements.monthDetailButton.addEventListener("click", () => {
  openInsightDetail("month");
});

elements.closeInsightDetailButton.addEventListener("click", () => {
  closeInsightDetail();
});

elements.insightDetailSheet.addEventListener("click", (event) => {
  if (event.target === elements.insightDetailSheet) {
    closeInsightDetail();
  }
});

elements.insightDetailSheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeInsightDetail();
  }
});

elements.profileNameInput.addEventListener("input", () => {
  state.profileName = elements.profileNameInput.value.trim() || defaultProfileName;
  renderProfile({ syncInput: false });
  setGreeting();
});

elements.profileNameInput.addEventListener("blur", () => {
  state.profileName = cleanProfileName(elements.profileNameInput.value);
  saveProfile();
  renderProfile();
  setGreeting();
});

elements.profileNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    elements.profileNameInput.blur();
  }
});

elements.closeSettingsButton.addEventListener("click", () => {
  closeSettings();
});

elements.settingsSheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSettings();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  trapSettingsFocus(event);
});

elements.settingsSheet.addEventListener("click", (event) => {
  if (event.target === elements.settingsSheet) {
    closeSettings();
  }
});

elements.logoutButton.addEventListener("click", () => {
  signOut();
});

elements.expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const parsed = parseEntry(elements.quickEntry.value);

  if (!parsed.amount) {
    elements.quickEntry.focus();
    pulse(elements.quickEntry);
    return;
  }

  const expense = buildExpense(parsed);

  const wasEditing = Boolean(state.editingId);

  if (wasEditing) {
    const existing = state.expenses.find((item) => item.id === state.editingId);
    if (existing) {
      Object.assign(existing, expense, { id: existing.id, createdAt: existing.createdAt });
    }
  } else {
    state.expenses.unshift({
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
  }

  saveExpenses();
  resetCapture();
  renderAll();
  focusCapture();
  notifySaved(wasEditing ? "Updated" : "Saved", expense);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".expense-menu")) {
    closeMenu();
  }
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

if (elements.installButton) {
  elements.installButton.addEventListener("click", async () => {
    if (!state.deferredInstallPrompt) {
      showToast("Use Add to Home Screen");
      return;
    }

    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
  });
}

elements.clearButton.addEventListener("click", () => {
  if (!state.expenses.length) {
    return;
  }

  state.expenses = [];
  saveExpenses();
  clearRemoteExpenses().catch(() => {});
  renderAll();
  showToast("Cleared");
});

elements.addExpenseButton.addEventListener("click", () => {
  resetCapture();
  showTab("capture");
});

elements.cancelEditButton.addEventListener("click", () => {
  resetCapture();
  renderPreview(parseEntry(""));
  focusCapture();
});

elements.historyList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  if (button.dataset.action === "day-toggle") {
    toggleDay(button.dataset.day);
    return;
  }

  const expense = state.expenses.find((item) => item.id === button.dataset.id);
  if (!expense) {
    return;
  }

  if (button.dataset.action === "menu") {
    event.stopPropagation();
    toggleMenu(expense.id);
    return;
  }

  closeMenu();

  if (button.dataset.action === "edit") {
    startEdit(expense);
    return;
  }

  if (button.dataset.action === "delete") {
    deleteExpense(expense.id);
  }
});

function renderCategories() {
  elements.categoryGrid.classList.toggle("category-grid-editing", state.categoryEditMode);
  elements.categoryGrid.innerHTML = [
    ...state.categories.map(
      (category) => `
        <div class="category-wrap ${state.categoryEditTarget === category ? "editing" : ""}" draggable="${state.categoryEditMode}" data-category="${escapeHtml(category)}">
          <button class="category-pill" type="button" data-category="${escapeHtml(category)}">
            ${categoryIcon(category)}
            <span>${escapeHtml(category)}</span>
          </button>
          ${state.categoryEditMode ? `
            <div class="category-move-controls" aria-label="Move ${escapeHtml(category)}">
              <button type="button" data-category-move="up" data-category="${escapeHtml(category)}" aria-label="Move ${escapeHtml(category)} left">‹</button>
              <button type="button" data-category-move="down" data-category="${escapeHtml(category)}" aria-label="Move ${escapeHtml(category)} right">›</button>
            </div>
          ` : ""}
        </div>
      `,
    ),
    `
      <div class="category-wrap">
        <button class="category-pill add-category-pill" type="button" data-action="add-category">
          <span aria-hidden="true">+</span>
          <span>New</span>
        </button>
      </div>
    `,
  ].join("");

  elements.categoryGrid.querySelectorAll("button[data-category]").forEach((button) => {
    let holdTimer = 0;
    let longPressed = false;

    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      longPressed = false;
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        longPressed = true;
        openCategoryEditMode(button.dataset.category);
      }, 750);
    });

    ["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
      button.addEventListener(eventName, () => {
        window.clearTimeout(holdTimer);
      });
    });

    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });

    button.addEventListener("click", (event) => {
      if (longPressed) {
        event.preventDefault();
        longPressed = false;
        return;
      }

      if (state.categoryEditMode) {
        state.categoryEditTarget = button.dataset.category;
        renderCategories();
        return;
      }
      selectCategory(button.dataset.category);
      renderPreview(parseEntry(elements.quickEntry.value));
      focusCapture();
    });

    button.addEventListener("touchstart", () => {
      if (!state.categoryEditMode) {
        return;
      }

      state.touchDragCategory = button.dataset.category;
      state.touchDragLastTarget = button.dataset.category;
    });
  });

  elements.categoryGrid.querySelectorAll("button[data-category-move]").forEach((button) => {
    button.addEventListener("click", () => {
      moveCategory(button.dataset.category, button.dataset.categoryMove === "up" ? -1 : 1);
    });
  });

  elements.categoryGrid.querySelector("button[data-action='add-category']").addEventListener("click", () => {
    showCategoryComposer();
  });

  if (!state.categories.includes(state.selectedCategory)) {
    state.selectedCategory = state.categories[0] || "Other";
  }

  selectCategory(state.selectedCategory);
  renderCategoryPagination();
  renderCategoryEditBar();
}

function categoryIcon(category) {
  const key = category.toLowerCase();
  const customIcon = state.categoryIcons[category];
  const paths =
    iconPaths[customIcon] ||
    iconPaths[key] ||
    Object.entries(iconKeywords).find(([keyword]) => key.includes(keyword))?.[1] ||
    iconPaths.other;

  return `<svg class="category-icon" aria-hidden="true" viewBox="0 0 24 24">${paths}</svg>`;
}

function inferCategoryIcon(category) {
  const key = category.toLowerCase();
  const matchedIcon = Object.keys(iconLabels).find((icon) => key.includes(icon));
  if (matchedIcon) {
    return matchedIcon;
  }

  const matchedKeyword = Object.entries(iconKeywords).find(([keyword]) => key.includes(keyword));
  if (!matchedKeyword) {
    return "other";
  }

  return Object.entries(iconPaths).find(([, paths]) => paths === matchedKeyword[1])?.[0] || "other";
}

function addCustomCategory(rawCategory) {
  const category = titleCase(rawCategory.trim());

  if (!category) {
    elements.customCategoryEntry.focus();
    pulse(elements.customCategoryEntry);
    return;
  }

  const exists = state.categories.some((item) => item.toLowerCase() === category.toLowerCase());
  if (!exists) {
    state.categories.push(category);
  }
  state.categoryIcons[category] = state.iconManuallyPicked ? state.newCategoryIcon : inferCategoryIcon(category);
  saveCategories();

  hideCategoryComposer();
  renderCategories();
  selectCategory(category);
  renderPreview(parseEntry(elements.quickEntry.value));
  focusCapture();
}

function showCategoryComposer() {
  elements.categoryComposer.hidden = false;
  elements.customCategoryEntry.value = "";
  state.newCategoryIcon = "other";
  state.iconManuallyPicked = false;
  renderIconPicker();
  window.setTimeout(() => elements.customCategoryEntry.focus(), 60);
}

function hideCategoryComposer() {
  elements.categoryComposer.hidden = true;
  elements.customCategoryEntry.value = "";
}

function pickerIcon(icon) {
  return `<svg class="category-icon" aria-hidden="true" viewBox="0 0 24 24">${iconPaths[icon]}</svg>`;
}

function renderIconPicker() {
  elements.customCategoryIconPicker.innerHTML = Object.entries(iconLabels)
    .map(
      ([icon, label]) => `
        <button class="${state.newCategoryIcon === icon ? "active" : ""}" type="button" data-icon="${icon}" aria-label="${label}">
          ${pickerIcon(icon)}
        </button>
      `,
    )
    .join("");
}

function categoryPageCount() {
  return Math.max(1, Math.ceil((state.categories.length + 1) / 6));
}

function renderCategoryPagination() {
  const pages = categoryPageCount();
  elements.categoryPagination.hidden = pages <= 1;
  elements.categoryPagination.innerHTML = Array.from({ length: pages }, (_, index) => {
    return `<button class="${index === state.categoryPage ? "active" : ""}" type="button" data-page="${index}" aria-label="Label page ${index + 1}"></button>`;
  }).join("");
}

function syncCategoryPage() {
  const pages = categoryPageCount();
  const maxScroll = elements.categoryGrid.scrollWidth - elements.categoryGrid.clientWidth;
  const nextPage = maxScroll > 0 ? Math.round((elements.categoryGrid.scrollLeft / maxScroll) * (pages - 1)) : 0;

  if (nextPage === state.categoryPage) {
    return;
  }

  state.categoryPage = nextPage;
  renderCategoryPagination();
}

function scrollCategoryPage(page) {
  const pages = categoryPageCount();
  const maxScroll = elements.categoryGrid.scrollWidth - elements.categoryGrid.clientWidth;
  const nextPage = Math.min(Math.max(page, 0), pages - 1);

  state.categoryPage = nextPage;
  elements.categoryGrid.scrollTo({
    left: pages > 1 ? (maxScroll / (pages - 1)) * nextPage : 0,
    behavior: "smooth",
  });
  renderCategoryPagination();
}

function openCategoryEditMode(category) {
  if ("vibrate" in navigator) {
    navigator.vibrate(15);
  }
  state.categoryEditMode = true;
  state.categoryEditTarget = category;
  renderCategories();
}

function closeCategoryEditMode() {
  state.categoryEditMode = false;
  state.categoryEditTarget = "";
  state.dragCategory = "";
  state.touchDragCategory = "";
  state.touchDragLastTarget = "";
  renderCategories();
}

function renderCategoryEditBar() {
  elements.categoryEditBar.hidden = !state.categoryEditMode;
}

function renameCategory() {
  const current = state.categoryEditTarget;
  if (!current) {
    return;
  }

  const next = titleCase(window.prompt("Rename label", current)?.trim() || "");
  if (!next || next === current) {
    return;
  }

  const exists = state.categories.some((category) => category.toLowerCase() === next.toLowerCase());
  if (exists) {
    showToast("Label already exists");
    return;
  }

  state.categories = state.categories.map((category) => (category === current ? next : category));
  state.categoryIcons[next] = state.categoryIcons[current] || inferCategoryIcon(next);
  delete state.categoryIcons[current];
  state.expenses.forEach((expense) => {
    if (expense.category === current) {
      expense.category = next;
    }
  });
  state.selectedCategory = state.selectedCategory === current ? next : state.selectedCategory;
  state.categoryEditTarget = next;
  saveCategories();
  saveExpenses();
  renderCategories();
  renderAll();
}

function deleteCategory() {
  const current = state.categoryEditTarget;
  if (!current || state.categories.length <= 1) {
    return;
  }

  if (!window.confirm(`Delete ${current}? Existing expenses stay in history.`)) {
    return;
  }

  state.categories = state.categories.filter((category) => category !== current);
  delete state.categoryIcons[current];
  state.selectedCategory = state.categories[0] || "Other";
  state.categoryEditTarget = state.selectedCategory;
  saveCategories();
  renderCategories();
}

function moveCategory(category, direction) {
  const index = state.categories.indexOf(category);
  const nextIndex = index + direction;

  if (index < 0 || nextIndex < 0 || nextIndex >= state.categories.length) {
    return;
  }

  const [item] = state.categories.splice(index, 1);
  state.categories.splice(nextIndex, 0, item);
  state.categoryEditTarget = item;
  saveCategories();
  renderCategories();
}

function moveCategoryBefore(source, target) {
  const sourceIndex = state.categories.indexOf(source);
  const targetIndex = state.categories.indexOf(target);
  if (sourceIndex < 0 || targetIndex < 0) {
    return;
  }

  const [item] = state.categories.splice(sourceIndex, 1);
  state.categories.splice(state.categories.indexOf(target), 0, item);
  saveCategories();
  renderCategories();
}

function selectCategory(category) {
  state.selectedCategory = category;
  elements.categoryGrid.querySelectorAll("button[data-category]").forEach((button) => {
    const active = button.dataset.category === category;
    button.classList.toggle("active", active);
    if (active && document.activeElement !== button) {
      button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  });
}

function parseEntry(raw) {
  const text = raw.trim();
  const amountMatch = text.match(/(?:₱|php)?\s*(\d+(?:[,.]\d{1,2})?)/i);
  const amount = amountMatch ? Number(amountMatch[1].replace(",", ".")) : 0;
  const words = text
    .replace(amountMatch?.[0] || "", "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const typedLabel = words.join(" ");
  const category =
    words.map((word) => keywordMap[word]).find(Boolean) ||
    state.categories.find((item) => item.toLowerCase() === typedLabel) ||
    state.categories.find((item) => words.includes(item.toLowerCase())) ||
    "";
  const label = words.length ? titleCase(words.join(" ")) : "";

  return { amount, category, label };
}

function renderPreview(parsed) {
  if (!parsed.amount) {
    renderEmptyPrompt();
    return;
  }

  const category = parsed.category || state.selectedCategory;
  const label = parsed.label || category;
  const amount = document.createElement("strong");
  amount.textContent = formatMoney(parsed.amount);
  elements.parsePreview.replaceChildren(amount, document.createTextNode(` · ${category} · ${label}`));
}

function buildExpense(parsed) {
  return {
    amount: parsed.amount,
    category: parsed.category || state.selectedCategory,
    label: parsed.label || parsed.category || state.selectedCategory,
    note: elements.noteEntry.value.trim(),
  };
}

function showAuth(mode = "welcome") {
  elements.appShell.hidden = true;
  elements.authScreen.hidden = false;
  elements.authActions.hidden = mode !== "welcome";
  elements.signupForm.hidden = mode !== "signup";
  elements.signinForm.hidden = mode !== "signin";
  elements.authMessage.textContent = "";

  if (mode === "signup") {
    window.setTimeout(() => elements.signupName.focus(), 60);
  } else if (mode === "signin") {
    elements.signinEmail.value = state.auth.email || "";
    window.setTimeout(() => elements.signinPassword.focus(), 60);
  }
}

function showApp() {
  elements.authScreen.hidden = true;
  elements.appShell.hidden = false;
  showTab("capture");
  renderProfile();
  renderAll();
  focusCapture();
}

async function createAccount() {
  if (!supabase) {
    showAuthMessage("Add Supabase keys before creating accounts.");
    return;
  }

  const name = cleanProfileName(elements.signupName.value);
  const email = elements.signupEmail.value.trim().toLowerCase();
  const password = elements.signupPassword.value;

  if (!email || !password || password.length < 6) {
    showAuthMessage("Use an email and at least 6 characters.");
    return;
  }

  setAuthLoading(true);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  setAuthLoading(false);

  if (error) {
    showAuthMessage(error.message);
    return;
  }

  state.profileName = name;
  state.user = data.user || null;
  state.auth = { email };
  state.authenticated = Boolean(data.session);
  saveProfile();
  elements.signupPassword.value = "";

  if (!data.session) {
    showAuth("signin");
    showAuthMessage("Check your email to confirm, then sign in.");
    return;
  }

  await ensureRemoteProfile();
  await syncAllRemote();
  showApp();
}

async function signIn() {
  if (!supabase) {
    showAuthMessage("Add Supabase keys before signing in.");
    return;
  }

  const email = elements.signinEmail.value.trim().toLowerCase();
  const password = elements.signinPassword.value;

  if (!email || !password) {
    showAuthMessage("Enter your email and password.");
    return;
  }

  setAuthLoading(true);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  setAuthLoading(false);

  if (error) {
    showAuthMessage(error.message);
    return;
  }

  state.user = data.user;
  state.auth = { email: data.user.email || email };
  state.authenticated = true;
  elements.signinPassword.value = "";
  await loadRemoteData();
  showApp();
}

function showAuthMessage(message) {
  elements.authMessage.textContent = message;
}

async function registerServiceWorker() {
  const registration = await navigator.serviceWorker.register("./sw.js");
  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) {
      return;
    }
    refreshing = true;
    window.location.reload();
  });

  const activateWaitingWorker = () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    if (!worker) {
      return;
    }

    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        worker.postMessage({ type: "SKIP_WAITING" });
      }
    });
  });

  activateWaitingWorker();
  window.addEventListener("focus", () => registration.update());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      registration.update();
    }
  });
}

function getAuthRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

function setAuthLoading(loading) {
  elements.signupForm.querySelector("button[type='submit']").disabled = loading;
  elements.signinForm.querySelector("button[type='submit']").disabled = loading;
}

async function signOut() {
  closeSettings();
  resetCapture();
  if (supabase) {
    await supabase.auth.signOut();
  }
  state.authenticated = false;
  state.user = null;
  state.auth = { email: "" };
  showAuth("signin");
  showToast("Logged out");
}

function renderAll() {
  setGreeting();
  renderHistory();
  renderInsights();
}

function renderProfile({ syncInput = true } = {}) {
  const name = state.profileName || defaultProfileName;
  elements.profileNameDisplay.textContent = name;
  if (syncInput) {
    elements.profileNameInput.value = name;
  }
  elements.profileAvatar.textContent = name.charAt(0).toUpperCase();
  elements.profileButton.querySelector("span").textContent = name.charAt(0).toUpperCase();
  elements.accountEmail.textContent = state.auth.email || "Local account";
}

function renderHistory() {
  if (!state.expenses.length) {
    elements.historyList.innerHTML =
      '<div class="empty-state">No expenses yet.<br />Your first log takes five seconds.</div>';
    return;
  }

  const groups = groupByDay(state.expenses);
  elements.historyList.innerHTML = Object.values(groups)
    .map((group) => {
      const collapsed = state.collapsedDays.has(group.key);
      const rows = group.expenses
        .map(
          (expense) => `
            <div class="expense-row">
              <div class="expense-main">
                <div>
                  <strong>${categoryIcon(expense.category)}${escapeHtml(expense.label)}</strong>
                  ${expense.note ? `<span>${escapeHtml(expense.note)}</span>` : ""}
                </div>
                <em>${formatMoney(expense.amount)}</em>
              </div>
              <div class="expense-menu">
                <button class="menu-trigger" type="button" data-action="menu" data-id="${expense.id}" aria-label="More options for ${escapeHtml(expense.label)}">
                  ...
                </button>
                <div class="menu-popover" ${state.openMenuId === expense.id ? "" : "hidden"}>
                  <button type="button" data-action="edit" data-id="${expense.id}">Edit</button>
                  <button type="button" data-action="delete" data-id="${expense.id}">Delete</button>
                </div>
              </div>
            </div>
          `,
        )
        .join("");

      return `
        <section class="day-group">
          <button class="day-toggle" type="button" data-action="day-toggle" data-day="${group.key}" aria-expanded="${!collapsed}">
            <span>${escapeHtml(group.label)}</span>
            <strong>${formatMoney(group.total)}</strong>
            <em aria-hidden="true">${collapsed ? "+" : "-"}</em>
          </button>
          <div class="day-expenses" ${collapsed ? "hidden" : ""}>${rows}</div>
        </section>
      `;
    })
    .join("");
}

function renderInsights() {
  const weekStart = startOfWeek(new Date());
  const monthStart = startOfMonth(new Date());
  const weekExpenses = state.expenses.filter((expense) => new Date(expense.createdAt) >= weekStart);
  const monthExpenses = state.expenses.filter((expense) => new Date(expense.createdAt) >= monthStart);
  const weekTotal = weekExpenses.reduce((total, expense) => total + expense.amount, 0);
  const monthTotal = monthExpenses.reduce((total, expense) => total + expense.amount, 0);
  const activeDays = new Set(weekExpenses.map((expense) => dateKey(new Date(expense.createdAt)))).size || 1;
  const byCategory = totalByCategory(weekExpenses);
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  elements.insightWeek.textContent = formatMoney(weekTotal);
  elements.insightMonth.textContent = formatMoney(monthTotal);
  elements.insightAverage.textContent = formatMoney(weekTotal / activeDays);
  elements.insightTop.textContent = topCategory ? topCategory[0] : "None yet";

  if (!weekExpenses.length) {
    elements.breakdownList.innerHTML = '<div class="empty-state">Capture a few expenses and this gets useful.</div>';
    return;
  }

  elements.breakdownList.innerHTML = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, total]) => {
      const percent = Math.max(5, Math.round((total / weekTotal) * 100));
      return `
        <div class="breakdown-row">
          <strong class="breakdown-label">${categoryIcon(category)}${escapeHtml(category)}</strong>
          <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${percent}%"></div></div>
          <span>${formatMoney(total)}</span>
        </div>
      `;
    })
    .join("");
}

function openInsightDetail(type) {
  window.clearTimeout(state.insightDetailCloseTimer);
  const today = new Date();
  const isWeek = type === "week";
  const entries = isWeek ? buildWeekInsightEntries(today) : buildMonthInsightEntries(today);
  const total = entries.reduce((sum, entry) => sum + entry.total, 0);
  const max = Math.max(...entries.map((entry) => entry.total), 1);

  elements.insightDetailKicker.textContent = isWeek ? "7-day calendar" : "Monthly graph";
  elements.insightDetailTitle.textContent = isWeek ? "This week" : "This month";
  elements.insightDetailTotal.textContent = formatMoney(total);
  elements.insightDetailContent.innerHTML = isWeek
    ? renderWeekInsightEntries(entries, max)
    : renderMonthInsightEntries(entries, max);

  elements.insightDetailSheet.hidden = false;
  window.setTimeout(() => {
    elements.insightDetailSheet.classList.add("show");
    elements.closeInsightDetailButton.focus({ preventScroll: true });
  }, 20);
}

function closeInsightDetail() {
  if (elements.insightDetailSheet.hidden) {
    return;
  }

  elements.insightDetailSheet.classList.remove("show");
  window.clearTimeout(state.insightDetailCloseTimer);
  state.insightDetailCloseTimer = window.setTimeout(() => {
    elements.insightDetailSheet.hidden = true;
    state.insightDetailCloseTimer = 0;
  }, 180);
}

function buildWeekInsightEntries(today) {
  const start = startOfWeek(today);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const total = totalForDate(date);
    return {
      date,
      total,
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      day: date.getDate(),
    };
  });
}

function buildMonthInsightEntries(today) {
  const start = startOfMonth(today);
  const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(index + 1);
    return {
      date,
      total: totalForDate(date),
      label: String(index + 1),
    };
  });
}

function renderWeekInsightEntries(entries, max) {
  return `
    <div class="week-calendar">
      ${entries
        .map((entry) => {
          const percent = Math.round((entry.total / max) * 100);
          return `
            <article class="week-day-card ${dateKey(entry.date) === dateKey(new Date()) ? "today" : ""}">
              <span>${entry.label}</span>
              <strong>${entry.day}</strong>
              <div class="mini-bar-track" aria-hidden="true">
                <div class="mini-bar-fill" style="height:${Math.max(percent, entry.total ? 10 : 0)}%"></div>
              </div>
              <em>${formatMoney(entry.total)}</em>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderMonthInsightEntries(entries, max) {
  return `
    <div class="month-bars" aria-label="Daily spending this month">
      ${entries
        .map((entry) => {
          const percent = Math.round((entry.total / max) * 100);
          return `
            <div class="month-bar-item">
              <div class="month-bar-track" aria-hidden="true">
                <div class="month-bar-fill" style="height:${Math.max(percent, entry.total ? 8 : 0)}%"></div>
              </div>
              <span>${entry.label}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function totalForDate(date) {
  const key = dateKey(date);
  return state.expenses
    .filter((expense) => dateKey(new Date(expense.createdAt)) === key)
    .reduce((sum, expense) => sum + expense.amount, 0);
}

function showTab(name) {
  closeMenu();
  closeSettings();
  closeInsightDetail();
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
  elements.screens.forEach((screen) => screen.classList.toggle("screen-active", screen.id === `${name}-screen`));

  if (name === "capture") {
    focusCapture();
  }
}

function startEdit(expense) {
  state.editingId = expense.id;
  elements.quickEntry.value = `${formatPlainAmount(expense.amount)} ${expense.label}`;
  elements.noteEntry.value = expense.note || "";
  selectCategory(expense.category);
  renderPreview(parseEntry(elements.quickEntry.value));
  elements.saveButton.textContent = "Update Expense";
  elements.cancelEditButton.hidden = false;
  showTab("capture");
  focusCapture();
}

function deleteExpense(id) {
  state.expenses = state.expenses.filter((expense) => expense.id !== id);

  if (state.editingId === id) {
    resetCapture();
  }

  saveExpenses();
  deleteRemoteExpense(id).catch(() => {});
  closeMenu();
  renderAll();
  showToast("Deleted");
}

function resetCapture() {
  state.editingId = "";
  elements.quickEntry.value = "";
  elements.noteEntry.value = "";
  elements.saveButton.textContent = "Save Expense";
  elements.cancelEditButton.hidden = true;
  renderPreview(parseEntry(""));
}

function toggleMenu(id) {
  state.openMenuId = state.openMenuId === id ? "" : id;
  renderHistory();
}

function toggleDay(day) {
  if (state.collapsedDays.has(day)) {
    state.collapsedDays.delete(day);
  } else {
    state.collapsedDays.add(day);
  }

  closeMenu();
  renderHistory();
}

function closeMenu() {
  if (!state.openMenuId) {
    return;
  }

  state.openMenuId = "";
  renderHistory();
}

function openSettings() {
  closeMenu();
  state.settingsReturnFocus = document.activeElement;
  elements.settingsSheet.hidden = false;
  window.setTimeout(() => {
    elements.settingsSheet.classList.add("show");
    elements.closeSettingsButton.focus({ preventScroll: true });
  }, 20);
}

function closeSettings() {
  if (elements.settingsSheet.hidden) {
    return;
  }

  elements.settingsSheet.classList.remove("show");
  window.setTimeout(() => {
    elements.settingsSheet.hidden = true;
    if (state.settingsReturnFocus?.focus) {
      state.settingsReturnFocus.focus({ preventScroll: true });
    }
    state.settingsReturnFocus = null;
  }, 180);
}

function trapSettingsFocus(event) {
  const focusable = getSettingsFocusable();
  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function getSettingsFocusable() {
  return [...elements.settingsSheet.querySelectorAll("button, input")]
    .filter((element) => !element.disabled && element.offsetParent !== null);
}

function renderEmptyPrompt() {
  const example = promptExamples[new Date().getSeconds() % promptExamples.length];
  elements.parsePreview.textContent = `Try ${example}`;
}

function focusCapture() {
  window.setTimeout(() => elements.quickEntry.focus(), 80);
}

function notifySaved(message = "Saved", expense = null) {
  if ("vibrate" in navigator) {
    navigator.vibrate([18, 35, 18]);
  }
  showSuccess(message, expense);
  showToast(message);
}

function showSuccess(message, expense) {
  elements.successTitle.textContent = message === "Updated" ? "Updated in History" : "Added to History";
  elements.successDetail.textContent = expense
    ? `${formatMoney(expense.amount)} ${expense.category}`
    : "Saved";
  elements.successBurst.hidden = false;
  elements.successBurst.classList.remove("show");
  window.requestAnimationFrame(() => elements.successBurst.classList.add("show"));
  window.setTimeout(() => {
    elements.successBurst.classList.remove("show");
    window.setTimeout(() => {
      elements.successBurst.hidden = true;
    }, 220);
  }, 1250);
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.setTimeout(() => elements.toast.classList.remove("show"), 1100);
}

function renderInstallNote() {
  if (isStandalone() || localStorage.getItem(installNoteStorageKey) === "true") {
    elements.installNote.hidden = true;
    return;
  }

  elements.installNoteCopy.textContent = isIOS()
    ? "Tap Share, then Add to Home Screen."
    : "Open your browser menu, then choose Add to Home Screen.";
  elements.installNoteAction.textContent = "Add";
  elements.installNote.hidden = false;
}

function dismissInstallNote() {
  localStorage.setItem(installNoteStorageKey, "true");
  elements.installNote.hidden = true;
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function pulse(element) {
  element.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 180 },
  );
}

function loadExpenses() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function loadCategoryData() {
  try {
    const saved = JSON.parse(localStorage.getItem(categoryStorageKey)) || [];
    const order = Array.isArray(saved) ? [...defaultCategories, ...saved] : saved.order || defaultCategories;
    const categories = order.filter((category, index, all) => {
      return all.findIndex((item) => item.toLowerCase() === category.toLowerCase()) === index;
    });
    return { categories: categories.length ? categories : defaultCategories, icons: saved.icons || {} };
  } catch {
    return { categories: defaultCategories, icons: {} };
  }
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(profileStorageKey)) || {};
    return { name: cleanProfileName(saved.name) };
  } catch {
    return { name: defaultProfileName };
  }
}

function saveExpenses() {
  localStorage.setItem(storageKey, JSON.stringify(state.expenses));
  syncExpenses().catch(() => {});
}

function saveCategories() {
  localStorage.setItem(
    categoryStorageKey,
    JSON.stringify({
      order: state.categories,
      icons: state.categoryIcons,
    }),
  );
  syncCategories().catch(() => {});
}

function saveProfile() {
  localStorage.setItem(profileStorageKey, JSON.stringify({ name: state.profileName }));
  ensureRemoteProfile().catch(() => {});
}

async function createSupabaseClient() {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

async function getSupabaseSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }
  return data.session;
}

async function loadRemoteData() {
  if (!supabase || !state.user) {
    return;
  }

  await ensureRemoteProfile();

  const [{ data: categories }, { data: expenses }] = await Promise.all([
    supabase.from("category_settings").select("categories, icons").eq("user_id", state.user.id).maybeSingle(),
    supabase.from("expenses").select("id, amount, category, label, note, created_at").eq("user_id", state.user.id).order("created_at", { ascending: false }),
  ]);

  if (categories) {
    state.categories = categories.categories?.length ? categories.categories : defaultCategories;
    state.categoryIcons = categories.icons || {};
    localStorage.setItem(categoryStorageKey, JSON.stringify({ order: state.categories, icons: state.categoryIcons }));
  } else {
    await syncCategories();
  }

  if (expenses?.length) {
    state.expenses = expenses.map(fromExpenseRow);
    localStorage.setItem(storageKey, JSON.stringify(state.expenses));
  }

  renderCategories();
  renderAll();
}

async function syncAllRemote() {
  await Promise.all([ensureRemoteProfile(), syncCategories(), syncExpenses()]);
}

async function ensureRemoteProfile() {
  if (!supabase || !state.user) {
    return;
  }

  await supabase.from("profiles").upsert({
    id: state.user.id,
    name: state.profileName || defaultProfileName,
    email: state.user.email || state.auth.email || "",
    updated_at: new Date().toISOString(),
  });
}

async function syncCategories() {
  if (!supabase || !state.user) {
    return;
  }

  await supabase.from("category_settings").upsert({
    user_id: state.user.id,
    categories: state.categories,
    icons: state.categoryIcons,
    updated_at: new Date().toISOString(),
  });
}

async function syncExpenses() {
  if (!supabase || !state.user || !state.expenses.length) {
    return;
  }

  await supabase.from("expenses").upsert(state.expenses.map(toExpenseRow));
}

async function deleteRemoteExpense(id) {
  if (!supabase || !state.user) {
    return;
  }

  await supabase.from("expenses").delete().eq("user_id", state.user.id).eq("id", id);
}

async function clearRemoteExpenses() {
  if (!supabase || !state.user) {
    return;
  }

  await supabase.from("expenses").delete().eq("user_id", state.user.id);
}

function toExpenseRow(expense) {
  return {
    id: expense.id,
    user_id: state.user.id,
    amount: expense.amount,
    category: expense.category,
    label: expense.label,
    note: expense.note || "",
    created_at: expense.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function fromExpenseRow(row) {
  return {
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    label: row.label,
    note: row.note || "",
    createdAt: row.created_at,
  };
}

function setGreeting() {
  const hour = new Date().getHours();
  const dayPart = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  elements.greeting.textContent = `Good ${dayPart}, ${state.profileName || defaultProfileName}`;
}

function groupByDay(expenses) {
  return expenses.reduce((groups, expense) => {
    const date = new Date(expense.createdAt);
    const key = dateKey(date);
    groups[key] ||= { expenses: [], key, label: dayLabel(date), total: 0 };
    groups[key].expenses.push(expense);
    groups[key].total += expense.amount;
    return groups;
  }, {});
}

function totalByCategory(expenses) {
  return expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});
}

function dayLabel(date) {
  const today = dateKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  if (dateKey(date) === today) {
    return "Today";
  }
  if (dateKey(date) === dateKey(yesterdayDate)) {
    return "Yesterday";
  }
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const day = date.getDay();
  const start = startOfDay(date);
  start.setDate(start.getDate() - day);
  return start;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function dateKey(date) {
  return [date.getFullYear(), date.getMonth(), date.getDate()].join("-");
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}

function formatPlainAmount(amount) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function titleCase(text) {
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanProfileName(name) {
  return titleCase(String(name || "").trim()) || defaultProfileName;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[character];
  });
}
