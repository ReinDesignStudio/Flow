import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config.js?v=193";

const storageKey = "flow-expenses-v1";
const categoryStorageKey = "flow-categories-v1";
const circleStorageKey = "flow-circle-v1";
const circleJoinRequestStorageKey = "flow-circle-join-request-v1";
const profileStorageKey = "flow-profile-v1";
const themeStorageKey = "flow-theme-v1";
const installNoteStorageKey = "flow-install-note-dismissed-v1";
const defaultProfileName = "Rein";
const productionAppUrl = "https://dailyflow.pro/";
const weeklyInsightMax = 15000;
const monthlyInsightBaseMax = 15000;
const circleInviteSyncTimeoutMs = 20000;
const circleLookupTimeoutMs = 10000;
const circleJoinTimeoutMs = 20000;
const circleRequestRefreshMs = 7000;
const circleRequestActionTimeoutMs = 4500;
const defaultCategories = ["Date Night", "Groceries", "Prayer", "Home", "Kids", "Dreams"];
const defaultCircleCategories = ["Date Night", "Groceries", "Prayer", "Home", "Kids", "Dreams", "Faith", "Fun", "Others"];
const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const authStartupTimeoutMs = 2500;
const greetingRefreshMs = 60 * 1000;
let supabase = null;
let initialSession = null;
let authStartupError = "";
let authStateListenerAttached = false;
const tabOrder = ["capture", "history", "insights"];
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
  onlineShopping: '<path d="M4 7h16l-2 12H6L4 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /><path d="M8 13h8" />',
  entertainment: '<path d="M4 7h16v10H4Z" /><path d="m10 10 5 2-5 2Z" /><path d="M8 21h8" />',
  subscription: '<path d="M5 5h14v14H5Z" /><path d="M8 9h8M8 13h5" /><path d="m15 15 2 2 3-4" />',
  travel: '<path d="M3 11h18" /><path d="m12 3 4 8-4 8-4-8 4-8Z" /><path d="M5 19h14" />',
  health: '<path d="M12 21s-7-4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 10-7 10Z" /><path d="M12 8v6M9 11h6" />',
  fitness: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12" />',
  education: '<path d="M4 19V5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2Z" /><path d="M8 7h7M8 11h6" />',
  family: '<path d="M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM17 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /><path d="M3 21a6 6 0 0 1 12 0M14 21a5 5 0 0 1 7-4" />',
  kids: '<path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /><path d="M6 21v-3a6 6 0 0 1 12 0v3" /><path d="M9 8h.01M15 8h.01" />',
  pets: '<path d="M12 13c3 0 6 2 6 5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3c0-3 3-5 6-5Z" /><path d="M5 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM15 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />',
  giving: '<path d="M12 21s-7-4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 10-7 10Z" /><path d="M12 5v4M10 7h4" />',
  savings: '<path d="M5 10a7 5 0 0 1 14 0v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3" /><path d="M8 12h.01M16 8h3" /><path d="M10 20v2M15 20v2" />',
  investment: '<path d="M4 19h16" /><path d="m5 15 4-4 3 3 7-8" /><path d="M16 6h3v3" />',
  salary: '<path d="M4 7h16v10H4Z" /><path d="M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" /><path d="M4 10a3 3 0 0 0 3-3M17 17a3 3 0 0 1 3-3" />',
  sideHustle: '<path d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10" /><path d="M8 5V3h8v2M3 17h18v2H3Z" /><path d="m9 12 2 2 4-5" />',
  business: '<path d="M4 21V7h6v14M10 21V3h10v18" /><path d="M7 11h.01M7 15h.01M14 7h2M14 11h2M14 15h2" />',
  repairs: '<path d="m14 7 3-3 3 3-3 3-3-3Z" /><path d="M15 9 7 17l-3 1 1-3 8-8" /><path d="m12 4 8 8" />',
  gifts: '<path d="M4 10h16v11H4Z" /><path d="M4 10h16M12 10v11" /><path d="M7 10a3 3 0 1 1 5 0M17 10a3 3 0 1 0-5 0" />',
  emergency: '<path d="M12 3 2 21h20L12 3Z" /><path d="M12 9v5M12 17h.01" />',
  debt: '<path d="M7 3h10l2 2v16l-3-2-2 2-2-2-2 2-2-2-3 2V5l2-2Z" /><path d="M9 9h6M9 13h6" /><path d="m9 17 6-8" />',
  insurance: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-5" />',
  beauty: '<path d="M7 21h10l-1-9H8l-1 9Z" /><path d="M9 12V7a3 3 0 0 1 6 0v5" /><path d="M10 16h4" />',
  clothing: '<path d="M8 4 4 7l3 4 1-1v11h8V10l1 1 3-4-4-3a4 4 0 0 1-8 0Z" />',
  electronics: '<path d="M5 5h14v10H5Z" /><path d="M8 21h8M12 15v6" />',
  dining: '<path d="M6 3v8M10 3v8M8 3v18" /><path d="M15 3c3 2 4 5 4 8h-4v10" />',
  snacks: '<path d="M7 4h10l-1 17H8L7 4Z" /><path d="M8 8h8" /><path d="M10 12h4" />',
  laundry: '<path d="M6 3h12v18H6Z" /><path d="M9 6h.01M12 6h.01" /><path d="M9 14a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />',
  parking: '<path d="M6 21V3h7a4 4 0 0 1 0 8H9" /><path d="M9 11v10" />',
  toll: '<path d="M4 17h16" /><path d="M6 17V7h12v10" /><path d="M8 10h8M10 13h4" />',
  mobile: '<path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M11 18h2" />',
  internet: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />',
  water: '<path d="M12 3s6 6 6 11a6 6 0 0 1-12 0c0-5 6-11 6-11Z" />',
  electricity: '<path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />',
  creditCard: '<path d="M3 6h18v12H3Z" /><path d="M3 10h18M7 15h4" />',
  taxes: '<path d="M7 3h10l2 2v16H5V5l2-2Z" /><path d="M9 8h6M9 12h6M9 16h3" /><path d="m14 17 3-3" />',
  freelance: '<path d="M4 19h16" /><path d="M7 19V9l5-4 5 4v10" /><path d="M10 19v-5h4v5" />',
  dates: '<path d="M12 21s-7-4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 10-7 10Z" /><path d="M8 4V2M16 4V2" />',
  hobbies: '<path d="M5 19 19 5" /><path d="m14 5 5 5" /><path d="M4 20l4-1 11-11-3-3L5 16l-1 4Z" />',
  sports: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M12 3c2 2 3 5 3 9s-1 7-3 9M12 3c-2 2-3 5-3 9s1 7 3 9M3 12h18" />',
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
  onlineShopping: "Online Shopping",
  entertainment: "Entertainment",
  subscription: "Subscription",
  travel: "Travel",
  health: "Health",
  fitness: "Fitness",
  education: "Education",
  family: "Family",
  kids: "Kids",
  pets: "Pets",
  giving: "Church/Giving",
  savings: "Savings",
  investment: "Investment",
  salary: "Salary",
  sideHustle: "Side Hustle",
  business: "Business",
  repairs: "Repairs",
  gifts: "Gifts",
  emergency: "Emergency",
  debt: "Debt/Loans",
  insurance: "Insurance",
  beauty: "Beauty",
  clothing: "Clothing",
  electronics: "Electronics",
  dining: "Dining Out",
  snacks: "Snacks",
  laundry: "Laundry",
  parking: "Parking",
  toll: "Toll Fees",
  mobile: "Mobile Load",
  internet: "Internet",
  water: "Water Bill",
  electricity: "Electricity",
  creditCard: "Credit Card",
  taxes: "Taxes",
  freelance: "Freelance",
  dates: "Dates",
  hobbies: "Hobbies",
  sports: "Sports",
  bills: "Bills",
  transport: "Transport",
  house: "House",
  membership: "Membership",
};
const iconKeywords = {
  beauty: iconPaths.beauty,
  bill: iconPaths.bills,
  bus: iconPaths.transport,
  business: iconPaths.business,
  charity: iconPaths.giving,
  church: iconPaths.giving,
  clothing: iconPaths.clothing,
  credit: iconPaths.creditCard,
  "credit card": iconPaths.creditCard,
  date: iconPaths.dates,
  debt: iconPaths.debt,
  dinner: iconPaths.food,
  "dining out": iconPaths.dining,
  dining: iconPaths.dining,
  education: iconPaths.education,
  electric: iconPaths.electricity,
  electricity: iconPaths.electricity,
  electronics: iconPaths.electronics,
  emergency: iconPaths.emergency,
  entertainment: iconPaths.entertainment,
  fare: iconPaths.transport,
  family: iconPaths.family,
  fitness: iconPaths.fitness,
  freelance: iconPaths.freelance,
  fuel: iconPaths.gas,
  gift: iconPaths.gifts,
  giving: iconPaths.giving,
  grab: iconPaths.transport,
  grocery: iconPaths.food,
  health: iconPaths.health,
  hobbies: iconPaths.hobbies,
  hobby: iconPaths.hobbies,
  home: iconPaths.house,
  house: iconPaths.house,
  improvement: iconPaths.house,
  insurance: iconPaths.insurance,
  internet: iconPaths.internet,
  investment: iconPaths.investment,
  kids: iconPaths.kids,
  laundry: iconPaths.laundry,
  loan: iconPaths.debt,
  lunch: iconPaths.food,
  market: iconPaths.shopping,
  meal: iconPaths.food,
  member: iconPaths.membership,
  membership: iconPaths.membership,
  mobile: iconPaths.mobile,
  "mobile load": iconPaths.mobile,
  "online shopping": iconPaths.onlineShopping,
  online: iconPaths.onlineShopping,
  parking: iconPaths.parking,
  pet: iconPaths.pets,
  petrol: iconPaths.gas,
  rent: iconPaths.bills,
  repair: iconPaths.repairs,
  salary: iconPaths.salary,
  saving: iconPaths.savings,
  shop: iconPaths.shopping,
  "side hustle": iconPaths.sideHustle,
  side: iconPaths.sideHustle,
  snack: iconPaths.snacks,
  sport: iconPaths.sports,
  subscription: iconPaths.subscription,
  taxi: iconPaths.transport,
  taxes: iconPaths.taxes,
  tax: iconPaths.taxes,
  tithe: iconPaths.giving,
  toll: iconPaths.toll,
  travel: iconPaths.travel,
  utility: iconPaths.bills,
  water: iconPaths.water,
  "water bill": iconPaths.water,
};
const categoryData = loadCategoryData();
const circleData = loadCircleData();
const profileData = loadProfile();
const savedTheme = loadTheme();
let authListenersAttached = false;

const paymentMethods = {
  cash: "Cash",
  "credit-card": "Credit Card",
  debit: "Debit",
  "e-wallet": "E-Wallet",
};

const state = {
  expenses: loadExpenses(),
  categories: categoryData.categories,
  categoryIcons: categoryData.icons,
  circle: circleData,
  pendingCircleJoin: loadPendingCircleJoin(),
  pendingCircleRequests: [],
  lastPendingCircleRequestCount: 0,
  expenseVisibility: "personal",
  selectedPaymentMethod: "cash",
  historyFilter: "all",
  insightPeriod: "week",
  profileName: profileData.name,
  theme: savedTheme,
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
  pageSwipeStartX: 0,
  pageSwipeStartY: 0,
  pageSwipeTracking: false,
  selectedCategory: "Food",
  editingId: "",
  openMenuId: "",
  collapsedDays: new Set(),
  expandedDays: new Set(),
  pendingSave: null,
  expenseSyncInFlight: false,
  deferredInstallPrompt: null,
  pendingPhone: "",
  qrStream: null,
  qrScanTimer: 0,
  circleRequestRefreshTimer: 0,
  circleJoinAction: "",
  circleInviteStatus: "",
  circleInviteError: "",
  qrDetector: null,
};

const elements = {
  installNote: document.querySelector("#install-note"),
  installNoteCopy: document.querySelector("#install-note-copy"),
  installNoteAction: document.querySelector("#install-note-action"),
  dismissInstallNote: document.querySelector("#dismiss-install-note"),
  installGuideSheet: document.querySelector("#install-guide-sheet"),
  installSteps: document.querySelector("#install-steps"),
  closeInstallGuideButton: document.querySelector("#close-install-guide-button"),
  authScreen: document.querySelector("#auth-screen"),
  authCopy: document.querySelector("#auth-copy"),
  appShell: document.querySelector("#app-shell"),
  authActions: document.querySelector("#auth-actions"),
  authSignIn: document.querySelector("#auth-sign-in"),
  authGoogle: document.querySelector("#auth-google"),
  signupGoogle: document.querySelector("#signup-google"),
  signinGoogle: document.querySelector("#signin-google"),
  phoneNumber: document.querySelector("#phone-number"),
  phoneCode: document.querySelector("#phone-code"),
  sendPhoneCode: document.querySelector("#send-phone-code"),
  verifyPhoneCode: document.querySelector("#verify-phone-code"),
  signupForm: document.querySelector("#signup-form"),
  signupName: document.querySelector("#signup-name"),
  signupEmail: document.querySelector("#signup-email"),
  signupPassword: document.querySelector("#signup-password"),
  signinForm: document.querySelector("#signin-form"),
  signinEmail: document.querySelector("#signin-email"),
  signinPassword: document.querySelector("#signin-password"),
  forgotPasswordButton: document.querySelector("#forgot-password-button"),
  authMessage: document.querySelector("#auth-message"),
  greeting: document.querySelector("#greeting"),
  dailySpendLine: document.querySelector("#daily-spend-line"),
  amountEntryRow: document.querySelector(".amount-entry-row"),
  quickEntry: document.querySelector("#quick-entry"),
  noteEntry: document.querySelector("#note-entry"),
  expenseForm: document.querySelector("#expense-form"),
  parsePreview: document.querySelector("#parse-preview"),
  paymentMethodSelect: document.querySelector("#payment-method-select"),
  visibilityToggle: document.querySelector("#visibility-toggle"),
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
  circleAccessButton: document.querySelector("#circle-access-button"),
  circleRequestBadge: document.querySelector("#circle-request-badge"),
  circleSheet: document.querySelector("#circle-sheet"),
  closeCircleSheetButton: document.querySelector("#close-circle-sheet-button"),
  circlePanel: document.querySelector("#circle-panel"),
  createCircleButton: document.querySelector("#create-circle-button"),
  inviteCircleButton: document.querySelector("#invite-circle-button"),
  deleteCircleButton: document.querySelector("#delete-circle-button"),
  circleForm: document.querySelector("#circle-form"),
  circleNameInput: document.querySelector("#circle-name-input"),
  circleNameDisplay: document.querySelector("#circle-name-display"),
  circleDetail: document.querySelector("#circle-detail"),
  circleInvite: document.querySelector("#circle-invite"),
  circleQr: document.querySelector("#circle-qr"),
  circleInviteCode: document.querySelector("#circle-invite-code"),
  circleInviteLink: document.querySelector("#circle-invite-link"),
  copyCircleLinkButton: document.querySelector("#copy-circle-link-button"),
  circleRequestList: document.querySelector("#circle-request-list"),
  circleContactList: document.querySelector("#circle-contact-list"),
  joinCircleButton: document.querySelector("#join-circle-button"),
  qrSheet: document.querySelector("#qr-sheet"),
  qrVideo: document.querySelector("#qr-video"),
  qrMessage: document.querySelector("#qr-message"),
  qrPasteForm: document.querySelector("#qr-paste-form"),
  qrLinkInput: document.querySelector("#qr-link-input"),
  closeQrButton: document.querySelector("#close-qr-button"),
  historyFilter: document.querySelector("#history-filter"),
  insightPeriods: document.querySelector("#insight-periods"),
  insightTotal: document.querySelector("#insight-total"),
  insightTrend: document.querySelector("#insight-trend"),
  insightDays: document.querySelector("#insight-days"),
  insightAverage: document.querySelector("#insight-average"),
  insightTop: document.querySelector("#insight-top"),
  insightTopDetail: document.querySelector("#insight-top-detail"),
  insightToday: document.querySelector("#insight-today"),
  insightTodayDetail: document.querySelector("#insight-today-detail"),
  aiInsightTitle: document.querySelector("#ai-insight-title"),
  aiInsightCopy: document.querySelector("#ai-insight-copy"),
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
  saveDateConfirm: document.querySelector("#save-date-confirm"),
  saveDateDetail: document.querySelector("#save-date-detail"),
  saveDateInput: document.querySelector("#save-date-input"),
  cancelSaveDateButton: document.querySelector("#cancel-save-date-button"),
  confirmSaveDateButton: document.querySelector("#confirm-save-date-button"),
  clearConfirm: document.querySelector("#clear-confirm"),
  keepHistoryButton: document.querySelector("#keep-history-button"),
  confirmClearButton: document.querySelector("#confirm-clear-button"),
  profileButton: document.querySelector("#profile-button"),
  profileAvatar: document.querySelector("#profile-avatar"),
  profileNameDisplay: document.querySelector("#profile-name-display"),
  profileNameInput: document.querySelector("#profile-name-input"),
  themeToggle: document.querySelector("#theme-toggle"),
  accountEmail: document.querySelector("#account-email"),
  settingsSheet: document.querySelector("#settings-sheet"),
  closeSettingsButton: document.querySelector("#close-settings-button"),
  labelSettingsButton: document.querySelector("#label-settings-button"),
  circleContactsButton: document.querySelector("#circle-contacts-button"),
  settingsInfoPanel: document.querySelector("#settings-info-panel"),
  settingsInfoClose: document.querySelector("#settings-info-close"),
  settingsInfoKicker: document.querySelector("#settings-info-kicker"),
  settingsInfoTitle: document.querySelector("#settings-info-title"),
  settingsInfoContent: document.querySelector("#settings-info-content"),
  logoutButton: document.querySelector("#logout-button"),
  installButton: document.querySelector("#install-button"),
  addExpenseButton: document.querySelector("#add-expense-button"),
  clearButton: document.querySelector("#clear-button"),
  tabs: document.querySelectorAll(".tab"),
  screens: document.querySelectorAll(".screen"),
};

attachAuthListeners();

try {
  renderTheme();
  renderCategories();
  renderIconPicker();
  renderProfile();
  renderAll();
  renderEmptyPrompt();
  renderInstallNote();

  if (state.authenticated) {
    showApp();
  } else {
    showAuth("welcome");
    if (!supabaseConfigured) {
      showAuthMessage("Add Supabase URL and anon key to supabase-config.js.");
    }
  }

  if (supabaseConfigured) {
    try {
      await withTimeout(initializeSupabaseAuth(), authStartupTimeoutMs, "Unable to connect to Supabase.");
    } catch (error) {
      authStartupError = error?.message || "Unable to connect to Supabase.";
    }
  }

  if (state.authenticated) {
    showApp();
  } else {
    showAuth("welcome");
    if (!supabaseConfigured) {
      showAuthMessage("Add Supabase URL and anon key to supabase-config.js.");
    } else if (authStartupError) {
      showAuthMessage("Connection issue. You can still open sign up and try again.");
    }
  }
} catch (error) {
  showAuth("welcome");
  showAuthMessage(error?.message || "Flow had trouble starting. Please try again.");
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  state.deferredInstallPrompt = event;
  renderInstallNote();
});

window.addEventListener("online", () => {
  retryPendingExpenseSync({ notify: true });
});

window.addEventListener("focus", () => {
  setGreeting();
  retryPendingExpenseSync();
  syncCircleRequestRefresh();
  refreshOwnerCircleRequests();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    setGreeting();
    retryPendingExpenseSync();
    syncCircleRequestRefresh();
    refreshOwnerCircleRequests();
  } else {
    stopCircleRequestRefresh();
  }
});

window.setInterval(setGreeting, greetingRefreshMs);

if ("serviceWorker" in navigator && isLocalHost()) {
  resetLocalServiceWorkers();
} else if ("serviceWorker" in navigator) {
  registerServiceWorker();
}

elements.installNoteAction.addEventListener("click", async () => {
  if (state.deferredInstallPrompt) {
    try {
      state.deferredInstallPrompt.prompt();
      const choice = await state.deferredInstallPrompt.userChoice;
      state.deferredInstallPrompt = null;
      if (choice.outcome === "accepted") {
        dismissInstallNote();
      } else {
        openInstallGuide();
      }
    } catch {
      state.deferredInstallPrompt = null;
      openInstallGuide();
    }
    return;
  }

  openInstallGuide();
});

elements.dismissInstallNote.addEventListener("click", () => {
  dismissInstallNote();
});

elements.closeInstallGuideButton.addEventListener("click", () => {
  closeInstallGuide();
});

elements.installGuideSheet.addEventListener("click", (event) => {
  if (event.target === elements.installGuideSheet) {
    closeInstallGuide();
  }
});

elements.installGuideSheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeInstallGuide();
  }
});

elements.quickEntry.addEventListener("input", () => {
  const parsed = parseEntry(elements.quickEntry.value);
  if (parsed.category) {
    selectCategory(parsed.category);
  }
  renderPreview(parsed);
});

elements.amountEntryRow.addEventListener("click", (event) => {
  if (event.target.closest(".payment-select-label")) {
    return;
  }

  focusCapture({ immediate: true });
});

elements.paymentMethodSelect.addEventListener("change", () => {
  selectPaymentMethod(elements.paymentMethodSelect.value);
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

elements.circleAccessButton.addEventListener("click", () => {
  openCircleSheet();
});

elements.insightPeriods.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-insight-period]");
  if (!button) {
    return;
  }

  state.insightPeriod = button.dataset.insightPeriod;
  if (state.circle) {
    refreshCircleRemoteData().catch(() => renderInsights());
  }
  renderInsights();
});

elements.breakdownList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-breakdown-category]");
  if (!row) {
    return;
  }

  openCategoryBreakdown(row.dataset.breakdownCategory);
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

elements.themeToggle.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-theme]");
  if (!button) {
    return;
  }

  setTheme(button.dataset.theme);
});

const onboarding = document.querySelector("#onboarding");
const onboardingTrack = document.querySelector("#onboarding-track");
const onboardingDots = Array.from(document.querySelectorAll("[data-onboarding-slide]"));
let onboardingTimerId = null;

function setOnboardingSlide(slide) {
  if (!onboarding || !onboardingTrack || !onboardingDots.length) {
    return;
  }

  const safeSlide = ((slide % onboardingDots.length) + onboardingDots.length) % onboardingDots.length;
  onboarding.dataset.slide = String(safeSlide);
  onboardingTrack.style.transform = `translateX(-${safeSlide * 100}%)`;
  onboardingDots.forEach((dot) => {
    const isActive = Number(dot.dataset.onboardingSlide || 0) === safeSlide;
    dot.classList.toggle("active", isActive);
    dot.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function startOnboardingAutoplay() {
  if (!onboardingDots.length) {
    return;
  }

  window.clearInterval(onboardingTimerId);
  onboardingTimerId = window.setInterval(() => {
    const currentSlide = Number(onboarding?.dataset.slide || 0);
    setOnboardingSlide(currentSlide + 1);
  }, 4000);
}

onboardingDots.forEach((button) => {
  button.addEventListener("click", () => {
    const slide = Number(button.dataset.onboardingSlide || 0);
    setOnboardingSlide(slide);
    startOnboardingAutoplay();
  });
});

startOnboardingAutoplay();

document.querySelectorAll("[data-settings-info]").forEach((button) => {
  button.addEventListener("click", () => openSettingsInfo(button.dataset.settingsInfo));
});

elements.settingsInfoClose.addEventListener("click", () => {
  closeSettingsInfo();
});

elements.closeSettingsButton.addEventListener("click", () => {
  closeSettings();
});

elements.labelSettingsButton.addEventListener("click", () => {
  openLabelSettings();
});

elements.circleContactsButton.addEventListener("click", () => {
  closeSettings({ restoreFocus: false });
  openCircleSheet({ showContacts: true });
});

elements.closeCircleSheetButton.addEventListener("click", () => {
  closeCircleSheet();
});

elements.circleSheet.addEventListener("click", (event) => {
  if (event.target === elements.circleSheet) {
    closeCircleSheet();
  }
});

elements.circleSheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCircleSheet();
  }
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

elements.cancelSaveDateButton.addEventListener("click", () => {
  closeSaveDateConfirm();
});

elements.confirmSaveDateButton.addEventListener("click", () => {
  commitPendingSave();
});

elements.saveDateInput.addEventListener("input", () => {
  renderSaveDateConfirm();
});

elements.saveDateConfirm.addEventListener("click", (event) => {
  if (event.target === elements.saveDateConfirm) {
    closeSaveDateConfirm();
  }
});

elements.saveDateConfirm.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSaveDateConfirm();
  }
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
  const existing = wasEditing ? state.expenses.find((item) => item.id === state.editingId) : null;

  state.pendingSave = {
    expense,
    existingId: existing?.id || "",
    wasEditing,
    defaultDate: existing?.createdAt || new Date().toISOString(),
  };
  openSaveDateConfirm();
});

elements.visibilityToggle.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-visibility]");
  if (!button) {
    return;
  }

  if (button.dataset.visibility === "circle" && !state.circle) {
    showToast("Create a Circle first");
    showTab("history", { focusCaptureInput: false });
    return;
  }

  setExpenseVisibility(button.dataset.visibility);
});

elements.createCircleButton.addEventListener("click", () => {
  elements.circleForm.hidden = false;
  window.setTimeout(() => elements.circleNameInput.focus(), 60);
});

elements.inviteCircleButton.addEventListener("click", async () => {
  if (!state.circle) {
    return;
  }

  if (!state.user) {
    state.circleInviteStatus = "auth";
    state.circleInviteError = "";
    renderCircle();
    showToast("Sign in first to invite");
    return;
  }

  elements.inviteCircleButton.disabled = true;
  elements.inviteCircleButton.textContent = "Preparing...";
  try {
    await prepareCircleInvite();
  } catch (error) {
    showToast(error?.message || "Invite could not be prepared");
  } finally {
    elements.inviteCircleButton.disabled = false;
    elements.inviteCircleButton.textContent = "Invite";
  }
});

elements.deleteCircleButton.addEventListener("click", () => {
  deleteCircle();
});

elements.circleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createCircle(elements.circleNameInput.value);
});

elements.copyCircleLinkButton.addEventListener("click", async () => {
  if (!state.user) {
    state.circleInviteStatus = "auth";
    state.circleInviteError = "";
    renderCircle();
    showToast("Sign in first to share an invite");
    return;
  }

  elements.copyCircleLinkButton.disabled = true;
  elements.copyCircleLinkButton.textContent = "Preparing...";
  try {
    const invite = state.circle?.inviteSynced
      ? circleInviteLink() || circleInviteCode()
      : await prepareCircleInvite({ notify: false });
    if (!invite) {
      return;
    }
    try {
      await navigator.clipboard.writeText(invite);
      showToast("Invite link copied");
    } catch {
      showToast(invite);
    }
  } catch (error) {
    showToast(error?.message || "Invite could not be prepared");
  } finally {
    elements.copyCircleLinkButton.disabled = false;
    elements.copyCircleLinkButton.textContent = "Copy invite link";
  }
});

elements.joinCircleButton.addEventListener("click", () => {
  if (state.pendingCircleJoin) {
    handleCircleJoinRequest("check").catch(() => showToast("Circle request could not be checked"));
    return;
  }

  openQrScanner();
});

elements.circleRequestList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-join-request]");
  if (!button) {
    return;
  }

  handleCircleJoinRequest(button.dataset.joinRequest, button.dataset.requestUserId, button.dataset.requestCircleId);
});

elements.closeQrButton.addEventListener("click", () => {
  closeQrScanner();
});

elements.qrSheet.addEventListener("click", (event) => {
  if (event.target === elements.qrSheet) {
    closeQrScanner();
  }
});

elements.qrPasteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const joined = await joinCircleFromInvite(elements.qrLinkInput.value, { showInlineStatus: true });
  if (joined) {
    closeQrScanner();
  }
});

elements.historyFilter.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-history-filter]");
  if (!button) {
    return;
  }

  state.historyFilter = button.dataset.historyFilter;
  renderHistory();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".expense-menu")) {
    closeMenu();
  }
});

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

elements.appShell.addEventListener(
  "touchstart",
  (event) => {
    if (shouldIgnorePageSwipe(event.target) || event.touches.length !== 1) {
      state.pageSwipeTracking = false;
      return;
    }

    const touch = event.touches[0];
    if (touch.clientX < 24 || window.innerWidth - touch.clientX < 24) {
      state.pageSwipeTracking = false;
      return;
    }

    state.pageSwipeStartX = touch.clientX;
    state.pageSwipeStartY = touch.clientY;
    state.pageSwipeTracking = true;
  },
  { passive: true },
);

elements.appShell.addEventListener(
  "touchmove",
  (event) => {
    if (!state.pageSwipeTracking || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - state.pageSwipeStartX;
    const deltaY = touch.clientY - state.pageSwipeStartY;

    if (Math.abs(deltaX) > 18 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      event.preventDefault();
    }
  },
  { passive: false },
);

elements.appShell.addEventListener("touchend", (event) => {
  if (!state.pageSwipeTracking) {
    return;
  }

  const touch = event.changedTouches[0];
  state.pageSwipeTracking = false;

  const deltaX = touch.clientX - state.pageSwipeStartX;
  const deltaY = touch.clientY - state.pageSwipeStartY;

  if (Math.abs(deltaX) < 58 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) {
    return;
  }

  goToAdjacentTab(deltaX < 0 ? 1 : -1);
});

elements.appShell.addEventListener("touchcancel", () => {
  state.pageSwipeTracking = false;
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
    showToast("Nothing saved yet");
    return;
  }

  openClearConfirm();
});

elements.keepHistoryButton.addEventListener("click", () => {
  closeClearConfirm();
  showToast("History kept");
});

elements.confirmClearButton.addEventListener("click", () => {
  clearHistory();
});

elements.clearConfirm.addEventListener("click", (event) => {
  if (event.target === elements.clearConfirm) {
    closeClearConfirm();
    showToast("History kept");
  }
});

elements.clearConfirm.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeClearConfirm();
    showToast("History kept");
  }
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
  const categories = activeCategories();
  elements.categoryGrid.classList.toggle("category-grid-editing", state.categoryEditMode);
  elements.categoryGrid.innerHTML = [
    ...categories.map(
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

  if (!categories.includes(state.selectedCategory)) {
    state.selectedCategory = categories[0] || "Other";
  }

  selectCategory(state.selectedCategory);
  renderCategoryPagination();
  renderCategoryEditBar();
}

function categoryIcon(category) {
  const key = category.toLowerCase();
  const customIcon = activeCategoryIcons()[category];
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

  const categories = activeCategories();
  const icons = activeCategoryIcons();
  const exists = categories.some((item) => item.toLowerCase() === category.toLowerCase());
  if (!exists) {
    categories.push(category);
  }
  icons[category] = state.iconManuallyPicked ? state.newCategoryIcon : inferCategoryIcon(category);
  saveActiveCategories();

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
  return Math.max(3, Math.ceil((activeCategories().length + 1) / 6));
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

  const categories = activeCategories();
  const icons = activeCategoryIcons();
  const exists = categories.some((category) => category.toLowerCase() === next.toLowerCase());
  if (exists) {
    showToast("Label already exists");
    return;
  }

  replaceActiveCategories(categories.map((category) => (category === current ? next : category)));
  icons[next] = icons[current] || inferCategoryIcon(next);
  delete icons[current];
  state.expenses.forEach((expense) => {
    if (expense.category === current) {
      expense.category = next;
    }
  });
  state.selectedCategory = state.selectedCategory === current ? next : state.selectedCategory;
  state.categoryEditTarget = next;
  saveActiveCategories();
  saveExpenses();
  renderCategories();
  renderAll();
}

function deleteCategory() {
  const current = state.categoryEditTarget;
  const categories = activeCategories();
  const icons = activeCategoryIcons();
  if (!current || categories.length <= 1) {
    return;
  }

  if (!window.confirm(`Delete ${current}? Existing expenses stay in history.`)) {
    return;
  }

  replaceActiveCategories(categories.filter((category) => category !== current));
  delete icons[current];
  state.selectedCategory = activeCategories()[0] || "Other";
  state.categoryEditTarget = state.selectedCategory;
  saveActiveCategories();
  renderCategories();
}

function moveCategory(category, direction) {
  const categories = activeCategories();
  const index = categories.indexOf(category);
  const nextIndex = index + direction;

  if (index < 0 || nextIndex < 0 || nextIndex >= categories.length) {
    return;
  }

  const [item] = categories.splice(index, 1);
  categories.splice(nextIndex, 0, item);
  state.categoryEditTarget = item;
  saveActiveCategories();
  renderCategories();
}

function moveCategoryBefore(source, target) {
  const categories = activeCategories();
  const sourceIndex = categories.indexOf(source);
  const targetIndex = categories.indexOf(target);
  if (sourceIndex < 0 || targetIndex < 0) {
    return;
  }

  const [item] = categories.splice(sourceIndex, 1);
  categories.splice(categories.indexOf(target), 0, item);
  saveActiveCategories();
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

function selectPaymentMethod(method) {
  if (!paymentMethods[method]) {
    return;
  }

  state.selectedPaymentMethod = method;
  renderPaymentMethods();
}

function renderPaymentMethods() {
  elements.paymentMethodSelect.value = state.selectedPaymentMethod;
}

function paymentMethodLabel(method) {
  return paymentMethods[method] || paymentMethods.cash;
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
  const categories = activeCategories();
  const category =
    words.map((word) => keywordMap[word]).find(Boolean) ||
    categories.find((item) => item.toLowerCase() === typedLabel) ||
    categories.find((item) => words.includes(item.toLowerCase())) ||
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
  const visibility = state.expenseVisibility === "circle" && state.circle ? "circle" : "personal";
  const category = parsed.category || state.selectedCategory;
  return {
    amount: parsed.amount,
    category,
    categoryId: slugify(category),
    expenseVisibility: visibility,
    circleId: visibility === "circle" ? state.circle.id : null,
    userId: state.user?.id || "local",
    createdByUserId: state.user?.id || "local",
    label: parsed.label || parsed.category || state.selectedCategory,
    note: elements.noteEntry.value.trim(),
    paymentMethod: state.selectedPaymentMethod,
  };
}

function showAuth(mode = "welcome") {
  elements.appShell.hidden = true;
  elements.authScreen.hidden = false;
  elements.authScreen.dataset.authMode = mode;
  elements.authCopy.hidden = mode !== "welcome";
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
  const client = await ensureSupabaseClient();
  if (!client) {
    showAuthMessage(supabaseUnavailableMessage("creating accounts"));
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
  const { data, error } = await client.auth.signUp({
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
  const client = await ensureSupabaseClient();
  if (!client) {
    showAuthMessage(supabaseUnavailableMessage("signing in"));
    return;
  }

  const email = elements.signinEmail.value.trim().toLowerCase();
  const password = elements.signinPassword.value;

  if (!email || !password) {
    showAuthMessage("Enter your email and password.");
    return;
  }

  setAuthLoading(true);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
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

async function signInWithGoogle() {
  const client = await ensureSupabaseClient();
  if (!client) {
    showAuthMessage(supabaseUnavailableMessage("using Google sign in"));
    return;
  }

  setAuthLoading(true);
  const { error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  });
  setAuthLoading(false);

  if (error) {
    showAuthMessage(error.message);
  }
}

async function sendPasswordReset() {
  const client = await ensureSupabaseClient();
  if (!client) {
    showAuthMessage(supabaseUnavailableMessage("resetting your password"));
    return;
  }

  const email = elements.signinEmail.value.trim().toLowerCase();
  if (!email) {
    showAuthMessage("Enter your email first, then tap Forgot password.");
    elements.signinEmail.focus();
    return;
  }

  setAuthLoading(true);
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl(),
  });
  setAuthLoading(false);

  if (error) {
    showAuthMessage(error.message);
    return;
  }

  showAuthMessage("Password reset link sent. Check your email.");
}

async function sendPhoneCode() {
  const client = await ensureSupabaseClient();
  if (!client) {
    showAuthMessage(supabaseUnavailableMessage("using mobile sign in"));
    return;
  }

  const phone = normalizePhone(elements.phoneNumber.value);
  if (!phone) {
    showAuthMessage("Enter your mobile number with country code.");
    elements.phoneNumber.focus();
    return;
  }

  setAuthLoading(true);
  const { error } = await client.auth.signInWithOtp({ phone });
  setAuthLoading(false);

  if (error) {
    showAuthMessage(error.message);
    return;
  }

  state.pendingPhone = phone;
  elements.phoneCode.hidden = false;
  elements.verifyPhoneCode.hidden = false;
  elements.phoneCode.focus();
  showAuthMessage("Code sent. Check your messages.");
}

async function verifyPhoneCode() {
  const client = await ensureSupabaseClient();
  const phone = state.pendingPhone || normalizePhone(elements.phoneNumber.value);
  const token = elements.phoneCode.value.trim();

  if (!client || !phone || token.length < 4) {
    showAuthMessage("Enter the code sent to your phone.");
    return;
  }

  setAuthLoading(true);
  const { data, error } = await client.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  setAuthLoading(false);

  if (error) {
    showAuthMessage(error.message);
    return;
  }

  state.user = data.user;
  state.auth = { email: data.user?.phone || phone };
  state.authenticated = Boolean(data.session);
  state.pendingPhone = "";
  elements.phoneCode.value = "";
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

function isLocalHost() {
  return ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

async function resetLocalServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

function getAuthRedirectUrl() {
  if (isLocalHost()) {
    return productionAppUrl;
  }

  return `${window.location.origin}${window.location.pathname}`;
}

function attachAuthListeners() {
  if (authListenersAttached) {
    return;
  }

  authListenersAttached = true;
  elements.authSignIn?.addEventListener("click", () => {
    showAuth("signin");
  });

  [elements.authGoogle, elements.signupGoogle, elements.signinGoogle].forEach((button) => {
    button?.addEventListener("click", () => signInWithGoogle());
  });

  elements.sendPhoneCode?.addEventListener("click", () => sendPhoneCode());
  elements.verifyPhoneCode?.addEventListener("click", () => verifyPhoneCode());

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

  elements.forgotPasswordButton.addEventListener("click", () => {
    sendPasswordReset();
  });
}

async function initializeSupabaseAuth() {
  const client = await ensureSupabaseClient();
  if (!client) {
    return;
  }

  try {
    const session = await getSupabaseSession();
    state.authenticated = Boolean(session);
    state.user = session?.user || null;
    state.auth = { email: session?.user?.email || "" };

    if (session) {
      await loadRemoteData();
      cleanAuthUrl();
    }
  } catch (error) {
    authStartupError = error?.message || "Unable to connect to Supabase.";
    if (!state.authenticated) {
      showAuthMessage("Connection issue. You can still open sign up and try again.");
    }
  }
}

async function ensureSupabaseClient() {
  if (supabase) {
    return supabase;
  }

  if (!supabaseConfigured) {
    return null;
  }

  try {
    supabase = await createSupabaseClient();
    registerAuthStateListener();
    return supabase;
  } catch (error) {
    authStartupError = error?.message || "Unable to connect to Supabase.";
    return null;
  }
}

function supabaseUnavailableMessage(action) {
  if (!supabaseConfigured) {
    return `Add Supabase keys before ${action}.`;
  }

  if (authStartupError) {
    return `Supabase connection issue: ${authStartupError}`;
  }

  return `Supabase is not ready for ${action}. Refresh and try again.`;
}

function registerAuthStateListener() {
  if (!supabase || authStateListenerAttached) {
    return;
  }

  authStateListenerAttached = true;
  supabase.auth.onAuthStateChange(async (_event, session) => {
    state.authenticated = Boolean(session);
    state.user = session?.user || null;
    state.auth = { email: session?.user?.email || "" };
    if (session) {
      await loadRemoteData();
      cleanAuthUrl();
      showApp();
    }
  });
}

function setAuthLoading(loading) {
  elements.signupForm.querySelector("button[type='submit']").disabled = loading;
  elements.signinForm.querySelector("button[type='submit']").disabled = loading;
  [
    elements.authGoogle,
    elements.signupGoogle,
    elements.signinGoogle,
    elements.forgotPasswordButton,
    elements.sendPhoneCode,
    elements.verifyPhoneCode,
  ].forEach((button) => {
    if (button) {
      button.disabled = loading;
    }
  });
}

function cleanAuthUrl() {
  const url = new URL(window.location.href);
  const authParams = [
    "access_token",
    "code",
    "error",
    "error_code",
    "error_description",
    "expires_at",
    "expires_in",
    "provider_refresh_token",
    "provider_token",
    "refresh_token",
    "state",
    "token_type",
    "type",
  ];
  const hasAuthSearch = authParams.some((param) => url.searchParams.has(param));
  const hasAuthHash = /(?:^|[&#])(access_token|code|error|refresh_token|state)=/.test(url.hash);

  if (!hasAuthSearch && !hasAuthHash) {
    return;
  }

  authParams.forEach((param) => url.searchParams.delete(param));
  url.hash = "";
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
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
  renderDailySpendLine();
  renderCircle();
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

function renderTheme() {
  const theme = state.theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  const themeColor = theme === "light" ? "#d7d7d9" : "#070807";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);

  elements.themeToggle.querySelectorAll("button[data-theme]").forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === theme);
    button.setAttribute("aria-pressed", button.dataset.theme === theme ? "true" : "false");
  });
}

function setTheme(theme) {
  state.theme = theme === "light" ? "light" : "dark";
  try {
    localStorage.setItem(themeStorageKey, state.theme);
  } catch {}
  renderTheme();
}

function renderCircle() {
  const hasCircle = Boolean(state.circle);
  const hasPendingJoin = Boolean(state.pendingCircleJoin && !hasCircle);
  elements.visibilityToggle.hidden = !hasCircle;
  elements.historyFilter.hidden = !hasCircle;

  if (!hasCircle) {
    state.expenseVisibility = "personal";
    state.historyFilter = "all";
  }

  elements.circleNameDisplay.textContent = hasCircle ? state.circle.name : hasPendingJoin ? state.pendingCircleJoin.name : "Circle";
  elements.circleDetail.textContent = hasCircle
    ? `${state.circle.members.length} member${state.circle.members.length === 1 ? "" : "s"} · ${circleExpenses().length} shared expense${circleExpenses().length === 1 ? "" : "s"}`
    : hasPendingJoin
      ? "Request sent. Waiting for your partner to accept."
    : "Create a Circle for family, couples, or roommates.";
  elements.createCircleButton.hidden = hasCircle || hasPendingJoin;
  elements.inviteCircleButton.hidden = !hasCircle;
  elements.deleteCircleButton.hidden = !hasCircle;
  elements.joinCircleButton.textContent = hasPendingJoin
    ? state.circleJoinAction === "check"
      ? "Checking..."
      : "Check request"
    : "Join";
  elements.joinCircleButton.disabled = hasPendingJoin && Boolean(state.circleJoinAction);
  elements.circleForm.hidden = true;
  const showInvitePanel = hasCircle && (state.circle.inviteSynced || state.circleInviteStatus);
  const inviteReady = hasCircle && state.circle.inviteSynced;
  elements.circleInvite.hidden = !showInvitePanel;

  if (hasCircle) {
    const link = circleInviteLink();
    elements.circleQr.hidden = !inviteReady;
    elements.circleInviteCode.hidden = !inviteReady;
    elements.copyCircleLinkButton.hidden = !inviteReady;
    elements.circleInviteCode.textContent = inviteReady ? circleInviteCode() : "";
    elements.circleInviteLink.textContent = inviteReady
      ? "Share this invite link to join."
      : state.circleInviteStatus === "auth"
        ? "Sign in first to prepare an online invite."
        : state.circleInviteStatus === "error"
        ? state.circleInviteError || "Invite could not be prepared. Check your connection, then tap Invite again."
        : state.circleInviteStatus === "slow"
        ? state.circleInviteError || "Still preparing online invite. Keep this open a moment."
        : "Preparing online invite...";
    elements.circleQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}`;
  }

  renderCircleRequests();
  renderCircleContacts();
  syncCircleRequestRefresh();

  elements.visibilityToggle.querySelectorAll("button").forEach((button) => {
    const active = button.dataset.visibility === state.expenseVisibility;
    button.classList.toggle("active", active);
    button.disabled = button.dataset.visibility === "circle" && !hasCircle;
  });

  renderPaymentMethods();

  elements.historyFilter.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.historyFilter === state.historyFilter);
    button.disabled = button.dataset.historyFilter === "circle" && !hasCircle;
  });
}

function renderCircleContacts() {
  if (!state.circle) {
    elements.circleContactList.hidden = false;
    elements.circleContactList.innerHTML = `
      <article class="circle-contact-card">
        <strong>No Circle contacts yet</strong>
        <span>Create or join a Circle to see your people here.</span>
      </article>
    `;
    return;
  }

  const contacts = state.circle.members.length ? state.circle.members : [state.circle.createdByUserId];
  elements.circleContactList.hidden = false;
  elements.circleContactList.innerHTML = `
    <div class="circle-contact-heading">
      <strong>My Contact</strong>
      <span>${contacts.length} Circle member${contacts.length === 1 ? "" : "s"}</span>
    </div>
    ${contacts.map((memberId, index) => `
      <article class="circle-contact-card">
        <div class="circle-contact-avatar">${escapeHtml(memberId === state.user?.id ? (state.profileName || defaultProfileName).charAt(0).toUpperCase() : String(index + 1))}</div>
        <div>
          <strong>${escapeHtml(memberId === state.user?.id ? `${state.profileName || defaultProfileName} (You)` : `Circle member ${index + 1}`)}</strong>
          <span>${escapeHtml(memberId === state.circle.createdByUserId ? "Owner" : "Member")}</span>
        </div>
      </article>
    `).join("")}
  `;
}

function renderCircleRequests() {
  const pendingRequestCount = state.pendingCircleRequests.length;
  const showOwnerBadge = isCircleOwner() && pendingRequestCount > 0;
  elements.circleRequestBadge.hidden = !showOwnerBadge;
  elements.circleRequestBadge.textContent = String(Math.min(pendingRequestCount, 9));
  elements.circleAccessButton.setAttribute(
    "aria-label",
    showOwnerBadge
      ? `${pendingRequestCount} Circle join request${pendingRequestCount === 1 ? "" : "s"}`
      : "Open Circle",
  );

  if (state.pendingCircleJoin && !state.circle) {
    const isChecking = state.circleJoinAction === "check";
    const isCancelling = state.circleJoinAction === "cancel";
    const actionDisabled = state.circleJoinAction ? " disabled" : "";
    elements.circleRequestList.hidden = false;
    elements.circleRequestList.innerHTML = `
      <article class="circle-request-card">
        <strong>Waiting for approval</strong>
        <span>${escapeHtml(state.pendingCircleJoin.name)} will open after the owner accepts your request.</span>
        <div class="circle-request-actions">
          <button type="button" data-join-request="check"${actionDisabled}>${isChecking ? "Checking..." : "Check request"}</button>
          <button class="secondary" type="button" data-join-request="cancel"${actionDisabled}>${isCancelling ? "Cancelling..." : "Cancel"}</button>
        </div>
      </article>
    `;
    return;
  }

  if (!state.circle || !isCircleOwner() || !state.pendingCircleRequests.length) {
    elements.circleRequestList.hidden = true;
    elements.circleRequestList.innerHTML = "";
    return;
  }

  elements.circleRequestList.hidden = false;
  elements.circleRequestList.innerHTML = `
    <article class="circle-request-card circle-request-alert">
      <strong>${pendingRequestCount} join request${pendingRequestCount === 1 ? "" : "s"}</strong>
      <span>Approve trusted people to add them to this Circle.</span>
    </article>
    ${state.pendingCircleRequests
    .map((request) => `
      <article class="circle-request-card">
          <strong>${escapeHtml(request.requester_name || "Someone")}</strong>
          <span>wants to join ${escapeHtml(request.circle_name || "this Circle")}.</span>
          <div class="circle-request-actions">
          <button type="button" data-join-request="accept" data-request-user-id="${escapeHtml(request.requester_user_id)}" data-request-circle-id="${escapeHtml(request.circle_id || state.circle.id)}">Accept</button>
          <button class="secondary" type="button" data-join-request="decline" data-request-user-id="${escapeHtml(request.requester_user_id)}" data-request-circle-id="${escapeHtml(request.circle_id || state.circle.id)}">Decline</button>
        </div>
      </article>
    `)
    .join("")}
  `;
}

function renderHistory() {
  const expenses = filteredExpenses();
  if (!expenses.length) {
    elements.historyList.innerHTML =
      `<div class="empty-state">${state.historyFilter === "circle" ? "No Circle expenses yet." : "No expenses yet."}<br />Add your first expense.</div>`;
    return;
  }

  const groups = historyDayGroups(expenses);
  const todayKey = dateKey(new Date());
  elements.historyList.innerHTML = groups
    .map((group) => {
      const collapsed = state.collapsedDays.has(group.key) || (group.key !== todayKey && !state.expandedDays.has(group.key));
      const rows = group.expenses.length
        ? group.expenses
            .map(
              (expense) => `
            <div class="expense-row">
              <div class="expense-main">
                <div>
                  <strong>${categoryIcon(expense.category)}${escapeHtml(expense.label)}</strong>
                  ${expense.expenseVisibility === "circle" ? `<small>${escapeHtml(state.circle?.name || "Circle")}</small>` : ""}
                  <small>${escapeHtml(paymentMethodLabel(expense.paymentMethod))}</small>
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
            .join("")
        : `<div class="history-empty-day">${escapeHtml(emptyHistoryDayMessage(group.label))}</div>`;

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
  const range = insightRange(state.insightPeriod);
  const previousRange = previousInsightRange(range);
  const insightExpenses = expensesInRange(filteredExpenses(), range);
  const previousExpenses = previousRange ? expensesInRange(filteredExpenses(), previousRange) : [];
  const total = sumExpenses(insightExpenses);
  const previousTotal = sumExpenses(previousExpenses);
  const categoryTotals = insightCategoryTotals(insightExpenses);
  const paymentTotals = insightPaymentMethodTotals(insightExpenses);

  renderInsightPeriodSelector();
  elements.insightTotal.textContent = formatPeso(total);
  renderInsightTrend(total, previousTotal, range);
  elements.insightAverage.textContent = formatPeso(paymentTotals.cash);
  elements.insightDays.textContent = paymentMethodShare(paymentTotals.cash, total);
  elements.insightTop.textContent = formatPeso(paymentTotals["e-wallet"]);
  elements.insightTopDetail.textContent = paymentMethodShare(paymentTotals["e-wallet"], total);
  elements.insightToday.textContent = formatPeso(paymentTotals["credit-card"]);
  elements.insightTodayDetail.textContent = paymentMethodShare(paymentTotals["credit-card"], total);
  renderAiInsight(categoryTotals, total);

  if (!insightExpenses.length) {
    elements.breakdownList.innerHTML = '<div class="empty-state">Add a few ideas and this starts to feel like your story.</div>';
    return;
  }

  elements.breakdownList.innerHTML = renderInsightCategoryRows(categoryTotals);
}

function renderInsightPeriodSelector() {
  elements.insightPeriods.querySelectorAll("button[data-insight-period]").forEach((button) => {
    const active = button.dataset.insightPeriod === state.insightPeriod;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function insightRange(period) {
  const now = new Date();
  const end = now;

  if (period === "month") {
    return { period, start: startOfMonth(now), end, previousLabel: "last month" };
  }

  if (period === "last30") {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 29);
    return { period, start, end, previousLabel: "prev 30d" };
  }

  if (period === "all") {
    return { period, start: null, end, previousLabel: "" };
  }

  return { period: "week", start: startOfWeek(now), end, previousLabel: "last week" };
}

function previousInsightRange(range) {
  if (!range.start) {
    return null;
  }

  const end = new Date(range.start.getTime() - 1);
  const duration = range.end.getTime() - range.start.getTime();
  const start = new Date(end.getTime() - duration);
  return { start, end };
}

function expensesInRange(expenses, range) {
  return expenses.filter((expense) => {
    const date = new Date(expense.createdAt);
    return (!range.start || date >= range.start) && (!range.end || date <= range.end);
  });
}

function sumExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function spendingDayCount(expenses) {
  return new Set(expenses.map((expense) => dateKey(new Date(expense.createdAt)))).size;
}

function insightCategoryTotals(expenses) {
  const total = sumExpenses(expenses);
  return Object.entries(totalByCategory(expenses))
    .map(([category, amount]) => ({
      category,
      total: amount,
      percent: total ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function insightPaymentMethodTotals(expenses) {
  return expenses.reduce(
    (totals, expense) => {
      const method = paymentMethods[expense.paymentMethod] ? expense.paymentMethod : "cash";
      totals[method] = (totals[method] || 0) + expense.amount;
      return totals;
    },
    { cash: 0, "e-wallet": 0, "credit-card": 0 },
  );
}

function paymentMethodShare(amount, total) {
  return `${total ? Math.round((amount / total) * 100) : 0}% of spend`;
}

function renderInsightTrend(total, previousTotal, range) {
  if (!previousTotal) {
    elements.insightTrend.textContent = "No previous period";
    elements.insightTrend.className = "trend neutral";
    return;
  }

  const change = Math.round(((total - previousTotal) / previousTotal) * 100);
  if (change === 0) {
    elements.insightTrend.textContent = `No change vs ${range.previousLabel}`;
    elements.insightTrend.className = "trend neutral";
    return;
  }

  const up = change > 0;
  elements.insightTrend.textContent = `${up ? "↑" : "↓"} ${Math.abs(change)}% vs ${range.previousLabel}`;
  elements.insightTrend.className = `trend ${up ? "up" : "down"}`;
}

function todayComparison(todayTotal, dailyAverage) {
  if (!dailyAverage) {
    return "No average yet";
  }

  const difference = Math.round(Math.abs(todayTotal - dailyAverage));
  if (difference === 0) {
    return "Matches daily average";
  }

  return `${formatPeso(difference)} ${todayTotal > dailyAverage ? "above" : "below"} daily avg`;
}

function renderInsightCategoryRows(categories) {
  const colors = ["#a7e800", "#78ad24", "#4d801c"];
  const highest = categories[0]?.total || 1;
  return categories.map((item, index) => {
    const width = Math.max(3, Math.round((item.total / highest) * 100));
    const color = colors[index] || "#555";
    return `
      <button class="breakdown-row breakdown-button" type="button" data-breakdown-category="${escapeHtml(item.category)}" aria-label="View ${escapeHtml(item.category)} expenses">
        <div class="breakdown-icon">${categoryIcon(item.category)}</div>
        <strong class="breakdown-label">${escapeHtml(item.category)}</strong>
        <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${width}%;background:${color}"></div></div>
        <span class="breakdown-amount">${formatPeso(item.total)}<small>${item.percent}%</small></span>
      </button>
    `;
  }).join("");
}

function renderAiInsight(categories, total) {
  const [first, second] = categories;
  const essentials = ["bills", "rent", "gas", "transport", "insurance", "taxes", "debt", "loan", "electric", "water", "internet", "mobile"];
  const essentialTotal = categories
    .filter((item) => essentials.some((keyword) => item.category.toLowerCase().includes(keyword)))
    .reduce((sum, item) => sum + item.total, 0);
  const discretionary = Math.max(0, total - essentialTotal);
  const periodLabel = state.insightPeriod === "week" ? "this week" : "this period";

  elements.aiInsightTitle.textContent = "Flow insight";
  if (!total || !first) {
    elements.aiInsightCopy.textContent = "Log a few expenses to see a calm summary.";
    return;
  }

  const leaders = second
    ? `${first.category} and ${second.category} make up ${first.percent + second.percent}% of spending`
    : `${first.category} makes up ${first.percent}% of spending`;
  elements.aiInsightCopy.textContent = `${leaders} ${periodLabel}. Discretionary spending is ${formatPeso(discretionary)}, with essentials at ${formatPeso(essentialTotal)}.`;
}

function openInsightDetail(type) {
  window.clearTimeout(state.insightDetailCloseTimer);
  const today = new Date();
  const isWeek = type === "week";
  const entries = isWeek ? buildWeekInsightEntries(today) : buildMonthInsightEntries(today);
  const total = entries.reduce((sum, entry) => sum + entry.total, 0);
  const max = isWeek ? weeklyInsightMax : monthlyInsightMax(entries);

  elements.insightDetailKicker.textContent = isWeek ? weekRangeLabel(entries) : monthRangeLabel(today);
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

function openTodayInsightDetail() {
  const today = new Date();
  const expenses = expensesForDate(today, filteredExpenses());
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  window.clearTimeout(state.insightDetailCloseTimer);
  elements.insightDetailKicker.textContent = detailDateLabel(today);
  elements.insightDetailTitle.textContent = "Spent today";
  elements.insightDetailTotal.textContent = formatMoney(total);
  elements.insightDetailContent.innerHTML = expenses.length
    ? renderCategoryExpenseList(expenses)
    : '<div class="empty-state">No expenses today.</div>';

  elements.insightDetailSheet.hidden = false;
  window.setTimeout(() => {
    elements.insightDetailSheet.classList.add("show");
    elements.closeInsightDetailButton.focus({ preventScroll: true });
  }, 20);
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
  return renderInsightBarChart(entries, max, "week");
}

function renderMonthInsightEntries(entries, max) {
  return renderInsightBarChart(entries, max, "month");
}

function renderInsightBarChart(entries, max, type) {
  const markers = insightScaleMarkers(max);
  const labelIndexes = chartLabelIndexes(entries.length, type);
  return `
    <div class="health-chart ${type === "month" ? "month-chart" : "week-chart"}" style="--bar-count:${entries.length}" aria-label="${type === "month" ? "Daily activity this month" : "Daily activity this week"}">
      <div class="health-plot">
        <div class="health-grid" aria-hidden="true">
          ${markers
            .map(
              (marker) => `
                <div class="health-grid-line" style="bottom:${Math.round((marker / max) * 100)}%">
                  <span>${formatChartAxis(marker)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
        <div class="health-bars">
          ${entries
            .map((entry) => {
              const percent = Math.min(100, Math.round((entry.total / max) * 100));
              return `
                <div class="health-bar-slot">
                  <div class="health-bar-fill" title="${escapeHtml(entry.label)} ${formatMoney(entry.total)}" style="height:${Math.max(percent, entry.total ? 3 : 0)}%"></div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
      <div class="health-x-labels">
        ${entries
          .map((entry, index) => `<span class="${labelIndexes.includes(index) ? "" : "ghost"}">${labelIndexes.includes(index) ? escapeHtml(entry.label) : ""}</span>`)
          .join("")}
      </div>
    </div>
  `;
}

function openCategoryBreakdown(category) {
  const range = insightRange(state.insightPeriod);
  const expenses = filteredExpenses()
    .filter((expense) => expense.category === category)
    .filter((expense) => expensesInRange([expense], range).length)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (!expenses.length) {
    showToast("No expenses found");
    return;
  }

  window.clearTimeout(state.insightDetailCloseTimer);
  elements.insightDetailKicker.textContent = "Spending by Category";
  elements.insightDetailTitle.textContent = category;
  elements.insightDetailTotal.textContent = formatPeso(total);
  elements.insightDetailContent.innerHTML = renderCategoryExpenseList(expenses);

  elements.insightDetailSheet.hidden = false;
  window.setTimeout(() => {
    elements.insightDetailSheet.classList.add("show");
    elements.closeInsightDetailButton.focus({ preventScroll: true });
  }, 20);
}

function renderCategoryExpenseList(expenses) {
  return `
    <div class="category-detail-list">
      ${expenses
        .map((expense) => {
          const date = new Date(expense.createdAt);
          return `
            <article class="category-detail-row">
              <div>
                <strong>${categoryIcon(expense.category)}${escapeHtml(expense.label)}</strong>
                <span>${expense.note ? escapeHtml(expense.note) : detailDateLabel(date)} · ${escapeHtml(paymentMethodLabel(expense.paymentMethod))}</span>
              </div>
              <em>${formatMoney(expense.amount)}</em>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function monthlyInsightMax(entries) {
  const highest = Math.max(...entries.map((entry) => entry.total), monthlyInsightBaseMax);
  return Math.ceil(highest / 5000) * 5000;
}

function insightScaleMarkers(max) {
  return [0, 3000, 6000, 9000, 12000, max]
    .filter((marker, index, markers) => marker <= max && markers.indexOf(marker) === index)
    .sort((a, b) => a - b);
}

function chartLabelIndexes(length, type) {
  if (type === "week") {
    return Array.from({ length }, (_, index) => index);
  }

  return [0, 7, 15, 22, length - 1].filter((index, position, indexes) => {
    return index >= 0 && index < length && indexes.indexOf(index) === position;
  });
}

function weekRangeLabel(entries) {
  const [start, end] = [entries[0]?.date, entries.at(-1)?.date];
  if (!start || !end) {
    return "This Week graph";
  }

  const month = start.toLocaleDateString(undefined, { month: "short" });
  return `${month} ${start.getDate()}-${end.getDate()}, ${end.getFullYear()}`;
}

function monthRangeLabel(date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function totalForDate(date) {
  return expensesForDate(date).reduce((sum, expense) => sum + expense.amount, 0);
}

function expensesForDate(date, expenses = state.expenses) {
  const key = dateKey(date);
  return expenses
    .filter((expense) => dateKey(new Date(expense.createdAt)) === key)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function showTab(name, { focusCaptureInput = true } = {}) {
  closeMenu();
  closeSettings();
  closeCircleSheet();
  closeInsightDetail();
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === name));
  elements.screens.forEach((screen) => screen.classList.toggle("screen-active", screen.id === `${name}-screen`));

  if (name === "history" && state.circle) {
    refreshCircleRemoteData()
      .then(() => renderAll())
      .catch(() => {});
  }

  if (name === "capture" && focusCaptureInput) {
    focusCapture();
  }
}

function goToAdjacentTab(direction) {
  const activeTab = Array.from(elements.tabs).find((tab) => tab.classList.contains("active"))?.dataset.tab || tabOrder[0];
  const activeIndex = tabOrder.indexOf(activeTab);
  const nextIndex = Math.min(tabOrder.length - 1, Math.max(0, activeIndex + direction));

  if (nextIndex !== activeIndex) {
    showTab(tabOrder[nextIndex], { focusCaptureInput: false });
  }
}

function shouldIgnorePageSwipe(target) {
  return Boolean(
    target.closest(
      [
        "button",
        "input",
        "select",
        "textarea",
        "a",
        ".category-grid",
        ".category-pagination",
        ".category-composer",
        ".category-edit-bar",
        ".insight-detail-sheet",
        ".settings-sheet",
        ".install-guide-sheet",
        ".save-date-confirm",
        ".clear-confirm",
        ".install-note",
      ].join(", "),
    ),
  );
}

function startEdit(expense) {
  if (!canWriteExpense(expense)) {
    showToast("Shared expenses are view-only");
    return;
  }

  state.editingId = expense.id;
  elements.quickEntry.value = `${formatPlainAmount(expense.amount)} ${expense.label}`;
  elements.noteEntry.value = expense.note || "";
  selectPaymentMethod(expense.paymentMethod || "cash");
  selectCategory(expense.category);
  renderPreview(parseEntry(elements.quickEntry.value));
  setSaveButtonLabel("Update Flow");
  elements.cancelEditButton.hidden = false;
  showTab("capture");
  focusCapture();
}

function deleteExpense(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (expense && !canWriteExpense(expense)) {
    showToast("Shared expenses are view-only");
    closeMenu();
    return;
  }

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
  closeSaveDateConfirm();
  state.editingId = "";
  elements.quickEntry.value = "";
  elements.noteEntry.value = "";
  selectPaymentMethod("cash");
  setSaveButtonLabel("Add to Flow");
  elements.cancelEditButton.hidden = true;
  renderPreview(parseEntry(""));
}

function setSaveButtonLabel(label) {
  elements.saveButton.innerHTML = `
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
    <span>${escapeHtml(label)}</span>
  `;
}

function toggleMenu(id) {
  state.openMenuId = state.openMenuId === id ? "" : id;
  renderHistory();
}

function toggleDay(day) {
  const todayKey = dateKey(new Date());
  const collapsed = state.collapsedDays.has(day) || (day !== todayKey && !state.expandedDays.has(day));

  if (collapsed) {
    state.collapsedDays.delete(day);
    state.expandedDays.add(day);
  } else {
    state.collapsedDays.add(day);
    state.expandedDays.delete(day);
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
  closeCircleSheet();
  state.settingsReturnFocus = document.activeElement;
  if (state.circle) {
    refreshCircleRemoteData().catch(() => {});
  } else if (state.pendingCircleJoin) {
    refreshPendingCircleJoin().catch(() => {});
  }
  elements.settingsSheet.hidden = false;
  window.setTimeout(() => {
    elements.settingsSheet.classList.add("show");
    elements.closeSettingsButton.focus({ preventScroll: true });
  }, 20);
}

function closeSettings({ restoreFocus = true } = {}) {
  if (elements.settingsSheet.hidden) {
    return;
  }

  closeSettingsInfo();
  elements.settingsSheet.classList.remove("show");
  window.setTimeout(() => {
    elements.settingsSheet.hidden = true;
    if (restoreFocus && state.settingsReturnFocus?.focus) {
      state.settingsReturnFocus.focus({ preventScroll: true });
    }
    state.settingsReturnFocus = null;
  }, 180);
}

const settingsInfoCopy = {
  language: {
    kicker: "Language",
    title: "English for now",
    body: [
      "Flow currently supports English.",
      "More languages can be added later once the core tracking experience is stable.",
    ],
  },
  faq: {
    kicker: "FAQ",
    title: "Common questions",
    items: [
      ["Can I use Flow offline?", "Yes. You can save expenses offline, and pending expenses upload when internet returns."],
      ["Can I edit labels?", "Yes. Open General settings to add, edit, delete, or rearrange labels."],
      ["What is Circle?", "Circle lets you share selected expenses with people you trust."],
    ],
  },
  terms: {
    kicker: "Terms",
    title: "Simple terms of service",
    body: [
      "Flow is a personal expense tracking tool. Use it responsibly and keep your account details private.",
      "Your entries are your responsibility. Flow helps organize spending, but it is not financial, legal, or tax advice.",
      "Do not use Flow to store sensitive secrets such as passwords, government IDs, or payment card numbers.",
    ],
  },
  policy: {
    kicker: "Privacy",
    title: "User policy",
    body: [
      "Flow stores your expenses locally on your device and syncs with your account when Supabase is available.",
      "Offline expenses stay on your device until they can be uploaded.",
      "Circle expenses are visible to the Circle members you share them with.",
    ],
  },
};

function openSettingsInfo(type) {
  const copy = settingsInfoCopy[type];
  if (!copy) {
    return;
  }

  elements.settingsInfoKicker.textContent = copy.kicker;
  elements.settingsInfoTitle.textContent = copy.title;
  elements.settingsInfoContent.innerHTML = copy.items
    ? copy.items
        .map(
          ([question, answer]) => `
            <article>
              <strong>${escapeHtml(question)}</strong>
              <p>${escapeHtml(answer)}</p>
            </article>
          `,
        )
        .join("")
    : copy.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  elements.settingsInfoPanel.hidden = false;
  elements.settingsInfoPanel.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function closeSettingsInfo() {
  elements.settingsInfoPanel.hidden = true;
  elements.settingsInfoContent.textContent = "";
}

function openCircleSheet({ showContacts = false } = {}) {
  closeMenu();
  closeSettings({ restoreFocus: false });
  closeInsightDetail();
  state.settingsReturnFocus = document.activeElement;
  if (state.circle) {
    refreshCircleRemoteData().catch(() => {});
  } else if (state.pendingCircleJoin) {
    refreshPendingCircleJoin().catch(() => {});
  }
  syncCircleRequestRefresh();
  renderCircle();
  elements.circleSheet.hidden = false;
  window.setTimeout(() => {
    elements.circleSheet.classList.add("show");
    if (showContacts && elements.circleContactList.hidden) {
      elements.circleContactList.hidden = false;
    }
    elements.closeCircleSheetButton.focus({ preventScroll: true });
  }, 20);
}

function closeCircleSheet({ restoreFocus = true } = {}) {
  if (elements.circleSheet.hidden) {
    return;
  }

  elements.circleSheet.classList.remove("show");
  window.setTimeout(() => {
    elements.circleSheet.hidden = true;
    if (restoreFocus && state.settingsReturnFocus?.focus) {
      state.settingsReturnFocus.focus({ preventScroll: true });
    }
    state.settingsReturnFocus = null;
  }, 180);
}

function startCircleRequestRefresh() {
  if (!state.circle || !isCircleOwner() || document.hidden || state.circleRequestRefreshTimer) {
    return;
  }

  state.circleRequestRefreshTimer = window.setInterval(() => {
    refreshOwnerCircleRequests();
  }, circleRequestRefreshMs);
}

function stopCircleRequestRefresh() {
  if (!state.circleRequestRefreshTimer) {
    return;
  }

  window.clearInterval(state.circleRequestRefreshTimer);
  state.circleRequestRefreshTimer = 0;
}

function syncCircleRequestRefresh() {
  if (!state.circle || !isCircleOwner() || document.hidden) {
    stopCircleRequestRefresh();
    return;
  }

  startCircleRequestRefresh();
}

function refreshOwnerCircleRequests() {
  if (!state.circle || !isCircleOwner()) {
    return;
  }

  refreshCircleRemoteData().catch(() => {});
}

function openLabelSettings() {
  closeSettings({ restoreFocus: false });
  closeCircleSheet({ restoreFocus: false });
  showTab("capture", { focusCaptureInput: false });
  openCategoryEditMode(state.selectedCategory || activeCategories()[0] || "Food");
  showCategoryComposer();
  showToast("Edit, rearrange, add, or delete labels");
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
  elements.parsePreview.textContent = "";
}

function focusCapture({ immediate = false } = {}) {
  const focus = () => {
    elements.quickEntry.focus({ preventScroll: true });
    elements.quickEntry.classList.add("input-prompted");
    window.setTimeout(() => elements.quickEntry.classList.remove("input-prompted"), 700);
  };

  if (immediate) {
    focus();
    return;
  }

  window.setTimeout(focus, 80);
}

function notifySaved(message = "Saved", expense = null) {
  if ("vibrate" in navigator) {
    navigator.vibrate([18, 35, 18]);
  }
  showSuccess(message, expense);
  showToast(message);
}

function openSaveDateConfirm() {
  if (!state.pendingSave) {
    return;
  }

  const date = new Date(state.pendingSave.defaultDate);
  elements.saveDateInput.value = dateInputValue(date);
  elements.saveDateInput.max = dateInputValue(new Date());
  renderSaveDateConfirm();
  elements.saveDateConfirm.hidden = false;
  elements.saveDateConfirm.classList.remove("show");
  window.requestAnimationFrame(() => elements.saveDateConfirm.classList.add("show"));
  window.setTimeout(() => elements.confirmSaveDateButton.focus({ preventScroll: true }), 60);
}

function closeSaveDateConfirm({ discard = true } = {}) {
  if (elements.saveDateConfirm.hidden) {
    return;
  }

  if (discard) {
    state.pendingSave = null;
  }

  elements.saveDateConfirm.classList.remove("show");
  window.setTimeout(() => {
    elements.saveDateConfirm.hidden = true;
  }, 180);
}

function renderSaveDateConfirm() {
  const expense = state.pendingSave?.expense;
  const selectedDate = selectedSaveDate();
  const dateLabel = selectedDate ? friendlyDateLabel(selectedDate) : "Today";
  elements.saveDateDetail.textContent = expense
    ? `${formatMoney(expense.amount)} · ${expense.category} · ${dateLabel}`
    : dateLabel;
}

function commitPendingSave() {
  if (!state.pendingSave) {
    closeSaveDateConfirm();
    return;
  }

  const selectedDate = selectedSaveDate() || new Date();
  const createdAt = mergeDateWithCurrentTime(selectedDate).toISOString();
  const { expense, existingId, wasEditing } = state.pendingSave;
  const savedExpense = { ...expense, createdAt, syncStatus: "pending", syncError: "" };
  let committedExpense = savedExpense;

  if (wasEditing) {
    const existing = state.expenses.find((item) => item.id === existingId);
    if (existing) {
      Object.assign(existing, savedExpense, { id: existing.id });
      committedExpense = existing;
    }
  } else {
    committedExpense = {
      ...savedExpense,
      id: crypto.randomUUID(),
    };
    state.expenses.unshift(committedExpense);
  }

  state.pendingSave = null;
  saveExpenses();
  closeSaveDateConfirm({ discard: false });
  resetCapture();
  renderAll();
  focusCapture();
  notifySaved(wasEditing ? "Updated" : "Saved", committedExpense);
}

function showSuccess(message, expense) {
  elements.successTitle.textContent = message === "Updated" ? "Updated in Flow" : "Added to Flow";
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

function openClearConfirm() {
  elements.clearConfirm.hidden = false;
  elements.clearConfirm.classList.remove("show");
  window.requestAnimationFrame(() => {
    elements.clearConfirm.classList.add("show");
    elements.keepHistoryButton.focus({ preventScroll: true });
  });
}

function closeClearConfirm() {
  if (elements.clearConfirm.hidden) {
    return;
  }

  elements.clearConfirm.classList.remove("show");
  window.setTimeout(() => {
    elements.clearConfirm.hidden = true;
  }, 180);
}

function clearHistory() {
  state.expenses = [];
  saveExpenses();
  clearRemoteExpenses().catch(() => {});
  closeClearConfirm();
  renderAll();
  showToast("Cleared");
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

function openInstallGuide() {
  const steps = isIOS()
    ? ["Open Flow in Safari.", "Tap the Share button.", "Choose Add to Home Screen.", "Tap Add."]
    : ["Open Flow in Chrome.", "Tap the browser menu.", "Choose Install app or Add to Home Screen.", "Tap Install or Add."];

  elements.installSteps.innerHTML = steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  elements.installGuideSheet.hidden = false;
  window.setTimeout(() => {
    elements.installGuideSheet.classList.add("show");
    elements.closeInstallGuideButton.focus({ preventScroll: true });
  }, 20);
}

function closeInstallGuide() {
  if (elements.installGuideSheet.hidden) {
    return;
  }

  elements.installGuideSheet.classList.remove("show");
  window.setTimeout(() => {
    elements.installGuideSheet.hidden = true;
  }, 180);
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
    return (JSON.parse(localStorage.getItem(storageKey)) || []).map((expense) => ({
      ...expense,
      userId: expense.userId || expense.user_id || expense.createdByUserId || "local",
      paymentMethod: expense.paymentMethod || "cash",
      syncStatus: expense.syncStatus || "synced",
      syncError: expense.syncError || "",
    }));
  } catch {
    return [];
  }
}

function loadCategoryData() {
  try {
    const saved = JSON.parse(localStorage.getItem(categoryStorageKey)) || {};
    const order = Array.isArray(saved) ? saved : saved.order || defaultCategories;
    const categories = cleanCategoryOrder(order);
    return {
      categories: categories.length ? categories : defaultCategories,
      icons: saved.icons || {},
      updatedAt: saved.updatedAt || "",
    };
  } catch {
    return { categories: defaultCategories, icons: {}, updatedAt: "" };
  }
}

function cleanCategoryOrder(order) {
  return (Array.isArray(order) ? order : [])
    .map((category) => titleCase(String(category).trim()))
    .filter(Boolean)
    .filter((category, index, all) => {
      return all.findIndex((item) => item.toLowerCase() === category.toLowerCase()) === index;
    });
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(profileStorageKey)) || {};
    return { name: cleanProfileName(saved.name) };
  } catch {
    return { name: defaultProfileName };
  }
}

function loadTheme() {
  try {
    return localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function loadCircleData() {
  try {
    const saved = JSON.parse(localStorage.getItem(circleStorageKey));
    if (!saved?.id || !saved?.name) {
      return null;
    }

    return {
      id: saved.id,
      name: saved.name,
      inviteCode: saved.inviteCode || saved.invite_code || saved.id.slice(0, 8).toUpperCase(),
      createdByUserId: saved.createdByUserId || "local",
      members: Array.isArray(saved.members) && saved.members.length ? saved.members : [saved.createdByUserId || "local"],
      categories: cleanCategoryOrder(saved.categories).length ? cleanCategoryOrder(saved.categories) : defaultCircleCategories,
      icons: saved.icons || {},
      inviteSynced: saved.inviteSynced === true,
      updatedAt: saved.updatedAt || "",
    };
  } catch {
    return null;
  }
}

function loadPendingCircleJoin() {
  try {
    const saved = JSON.parse(localStorage.getItem(circleJoinRequestStorageKey));
    return saved?.circleId && saved?.name ? saved : null;
  } catch {
    return null;
  }
}

function savePendingCircleJoin(request) {
  state.pendingCircleJoin = request;
  if (request) {
    localStorage.setItem(circleJoinRequestStorageKey, JSON.stringify(request));
  } else {
    localStorage.removeItem(circleJoinRequestStorageKey);
  }
  renderCircle();
}

function saveCircle() {
  if (!state.circle) {
    localStorage.removeItem(circleStorageKey);
    return;
  }

  state.circle.updatedAt = new Date().toISOString();
  localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
  syncCircle().catch(() => {});
}

function saveExpenses() {
  localStorage.setItem(storageKey, JSON.stringify(state.expenses));
  queueExpenseSync();
}

function saveCategories() {
  const updatedAt = new Date().toISOString();
  localStorage.setItem(
    categoryStorageKey,
    JSON.stringify({
      order: state.categories,
      icons: state.categoryIcons,
      updatedAt,
    }),
  );
  syncCategories().catch(() => {});
}

function saveProfile() {
  localStorage.setItem(profileStorageKey, JSON.stringify({ name: state.profileName }));
  ensureRemoteProfile().catch(() => {});
}

function activeCategories() {
  return state.expenseVisibility === "circle" && state.circle ? state.circle.categories : state.categories;
}

function activeCategoryIcons() {
  return state.expenseVisibility === "circle" && state.circle ? state.circle.icons : state.categoryIcons;
}

function replaceActiveCategories(categories) {
  if (state.expenseVisibility === "circle" && state.circle) {
    state.circle.categories = categories;
    return;
  }

  state.categories = categories;
}

function saveActiveCategories() {
  if (state.expenseVisibility === "circle" && state.circle) {
    saveCircle();
    return;
  }

  saveCategories();
}

function createCircle(rawName) {
  const name = titleCase(rawName.trim());
  if (!name) {
    elements.circleNameInput.focus();
    pulse(elements.circleNameInput);
    return;
  }

  const memberId = state.user?.id || "local";
  const inviteCode = createCircleInviteCode();
  state.circleInviteStatus = "";
  state.circleInviteError = "";
  state.circle = {
    id: shortCircleIdToUuid(inviteCode),
    name,
    inviteCode,
    createdByUserId: memberId,
    members: [memberId],
    categories: [...defaultCircleCategories],
    icons: {},
    inviteSynced: false,
    updatedAt: new Date().toISOString(),
  };
  state.expenseVisibility = "circle";
  state.selectedCategory = state.circle.categories[0];
  saveCircle();
  elements.circleNameInput.value = "";
  renderCategories();
  renderAll();
  showToast("Circle created");
  prepareCircleInvite({ notify: false })
    .then(() => showToast("Invite ready"))
    .catch(() => {});
}

function deleteCircle() {
  if (!state.circle) {
    return;
  }

  if (!window.confirm(`Delete ${state.circle.name}? Circle expenses stay in your history.`)) {
    return;
  }

  const deletedCircleId = state.circle.id;
  state.expenses.forEach((expense) => {
    if (expense.circleId === deletedCircleId) {
      expense.circleId = null;
      expense.expenseVisibility = "personal";
    }
  });
  state.circle = null;
  state.circleInviteStatus = "";
  state.circleInviteError = "";
  state.expenseVisibility = "personal";
  state.historyFilter = "all";
  localStorage.removeItem(circleStorageKey);
  saveExpenses();
  renderCategories();
  renderAll();
  showToast("Circle deleted");
}

async function joinCircleFromInvite(raw, { showInlineStatus = false } = {}) {
  const setStatus = (message) => {
    if (showInlineStatus) {
      elements.qrMessage.textContent = message;
    }
  };
  const value = raw.trim();

  if (!value) {
    setStatus("Paste a Circle ID or invite link first.");
    return false;
  }

  try {
    setStatus("Checking Circle invite...");

    if (!supabase || !state.user) {
      setStatus("Sign in first to join a Circle.");
      showToast("Sign in first to join a Circle");
      return false;
    }

    const parsedInvite = parseCircleInvite(value);
    if (!parsedInvite.circleId && !parsedInvite.inviteCode) {
      setStatus("Circle ID not recognized. Check the invite and try again.");
      showToast("Circle ID not recognized");
      return false;
    }

    let resolvedInvite = parsedInvite;
    try {
      resolvedInvite = await withTimeout(
        resolveCircleInvite(value),
        circleLookupTimeoutMs,
        "Circle lookup timed out.",
      );
    } catch {
      setStatus("Could not check the online invite. Try again.");
      showToast("Could not check online invite");
      return false;
    }

    const { circleId, name, inviteCode, circle } = resolvedInvite;
    if (!circleId || !name) {
      setStatus("Circle ID not recognized. Check the invite and try again.");
      showToast("Circle ID not recognized");
      return false;
    }

    if (circle?.created_by_user_id === state.user.id || circle?.members?.includes(state.user.id)) {
      setStatus("Circle joined.");
      await refreshAcceptedCircleJoin(circleId);
      return true;
    }

    const request = {
      circleId,
      name: titleCase(name),
      inviteCode,
      requesterUserId: state.user.id,
      requestedAt: new Date().toISOString(),
    };

    const joinRequestPromise = requestCircleJoin(request);
    let requestStatus = "";
    try {
      requestStatus = await withTimeout(
        joinRequestPromise,
        circleJoinTimeoutMs,
        "Circle join request timed out. Check your connection and try again.",
      );
    } catch (error) {
      if (isCircleJoinTimeoutError(error)) {
        watchSlowCircleJoin(request, joinRequestPromise, setStatus);
        setStatus("Request is still sending. Keep this open a moment.");
        showToast("Request is still sending");
        return false;
      }

      if (isMissingJoinRequestsTableError(error)) {
        setStatus("Circle requests need the latest database schema. Run the schema, then try again.");
        showToast("Circle database needs updating");
        return false;
      }

      if (isMissingCircleInviteError(error)) {
        setStatus("Circle invite is not ready or no longer exists. Ask the owner to copy the invite link again.");
        showToast("Circle invite is not ready");
        return false;
      }
      throw error;
    }
    if (requestStatus === "accepted") {
      setStatus("Circle joined.");
      await refreshAcceptedCircleJoin(request.circleId);
      return true;
    }

    savePendingCircleJoin(request);
    setStatus(requestStatus === "pending" ? "Request sent. Waiting for approval." : "Circle request updated.");
    showToast(requestStatus === "pending" ? "Request sent. Waiting for approval." : "Circle request updated");
    return true;
  } catch (error) {
    setStatus(error?.message || "Circle request could not be sent. Try again.");
    showToast(error?.message || "Circle request could not be sent");
    return false;
  }
}

async function requestCircleJoin(request) {
  const row = {
    circle_id: request.circleId,
    requester_user_id: state.user.id,
    requester_name: state.profileName || defaultProfileName,
    status: "pending",
    updated_at: new Date().toISOString(),
  };

  const { data, error: requestError } = await supabase
    .from("circle_join_requests")
    .upsert(row, { onConflict: "circle_id,requester_user_id" })
    .select("status")
    .maybeSingle();
  if (requestError) {
    throw requestError;
  }

  return data?.status || "pending";
}

function watchSlowCircleJoin(request, promise, setStatus = () => {}) {
  promise
    .then(async (status) => {
      if (!state.pendingCircleJoin || state.circle || state.pendingCircleJoin.circleId !== request.circleId) {
        if (state.circle || state.pendingCircleJoin) {
          return;
        }
      }

      if (status === "accepted") {
        setStatus("Circle joined.");
        await refreshAcceptedCircleJoin(request.circleId);
        return;
      }

      savePendingCircleJoin(request);
      setStatus("Request sent. Waiting for approval.");
      showToast("Request sent. Waiting for approval.");
      closeQrScanner();
      renderCircle();
    })
    .catch((error) => {
      setStatus(error?.message || "Circle request could not be sent. Try again.");
      showToast(error?.message || "Circle request could not be sent");
    });
}

function isMissingJoinRequestsTableError(error) {
  const message = String(error?.message || error?.details || error?.hint || "").toLowerCase();
  const code = String(error?.code || "").toLowerCase();
  return code === "pgrst205" || message.includes("circle_join_requests") && message.includes("schema cache");
}

function isCircleJoinTimeoutError(error) {
  return String(error?.message || "").toLowerCase().includes("circle join request timed out");
}

function isMissingCircleInviteError(error) {
  const message = String(error?.message || error?.details || error?.hint || "").toLowerCase();
  return message.includes("foreign key") || message.includes("violates") || message.includes("not present");
}

async function handleCircleJoinRequest(action, requesterUserId = "", requestCircleId = "") {
  if (action === "check") {
    if (!state.pendingCircleJoin || state.circleJoinAction) {
      return;
    }

    state.circleJoinAction = "check";
    renderCircle();
    try {
      await refreshPendingCircleJoin();
    } finally {
      state.circleJoinAction = "";
      renderCircle();
    }
    return;
  }

  if (action === "cancel") {
    if (!state.pendingCircleJoin || state.circleJoinAction) {
      return;
    }

    state.circleJoinAction = "cancel";
    renderCircle();
    try {
      await cancelPendingCircleJoin();
    } finally {
      state.circleJoinAction = "";
      renderCircle();
    }
    return;
  }

  if (!requesterUserId || !state.circle || !isCircleOwner()) {
    return;
  }

  if (action === "accept") {
    await acceptCircleJoinRequest(requesterUserId, requestCircleId);
    return;
  }

  if (action === "decline") {
    await declineCircleJoinRequest(requesterUserId, requestCircleId);
  }
}

async function acceptCircleJoinRequest(requesterUserId, requestCircleId = "") {
  if (!supabase || !state.user || !state.circle) {
    return;
  }

  const circleId = requestCircleId || state.circle.id;
  const now = new Date().toISOString();
  const { error: requestError } = await supabase.from("circle_join_requests")
    .update({ status: "accepted", updated_at: now })
    .eq("circle_id", circleId)
    .eq("requester_user_id", requesterUserId);
  if (requestError) {
    showToast("Could not accept request");
    return;
  }

  const { error: memberError } = await supabase.from("circle_members").upsert({
    circle_id: circleId,
    user_id: requesterUserId,
    role: "member",
    joined_at: now,
  });
  if (memberError) {
    showToast("Could not add member");
    return;
  }

  const { data: targetCircle } = await supabase
    .from("circles")
    .select("members")
    .eq("id", circleId)
    .maybeSingle();
  const targetMembers = Array.isArray(targetCircle?.members) ? [...targetCircle.members] : [...state.circle.members];
  if (!targetMembers.includes(requesterUserId)) {
    targetMembers.push(requesterUserId);
  }

  const { error: circleError } = await supabase.from("circles")
    .update({ members: targetMembers.filter(isUuid), updated_at: now })
    .eq("id", circleId);
  if (circleError) {
    showToast("Member added, but Circle sync failed");
    return;
  }

  if (circleId === state.circle.id) {
    state.circle.members = targetMembers;
    localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
  }
  await refreshCircleRemoteData();
  renderAll();
  showToast("Circle request accepted");
}

async function declineCircleJoinRequest(requesterUserId, requestCircleId = "") {
  if (!supabase || !state.circle || !isCircleOwner()) {
    return;
  }

  const circleId = requestCircleId || state.circle.id;
  await supabase.from("circle_join_requests")
    .update({ status: "declined", updated_at: new Date().toISOString() })
    .eq("circle_id", circleId)
    .eq("requester_user_id", requesterUserId);
  state.pendingCircleRequests = state.pendingCircleRequests.filter((request) => request.requester_user_id !== requesterUserId);
  renderCircle();
  showToast("Circle request declined");
}

async function cancelPendingCircleJoin() {
  let cancelledOnline = false;

  if (supabase && state.user && state.pendingCircleJoin) {
    try {
      const { error } = await withTimeout(
        supabase.from("circle_join_requests")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("circle_id", state.pendingCircleJoin.circleId)
          .eq("requester_user_id", state.user.id),
        circleRequestActionTimeoutMs,
        "Circle request cancel timed out.",
      );

      cancelledOnline = !error || isMissingJoinRequestsTableError(error);
    } catch {
      cancelledOnline = false;
    }
  }

  savePendingCircleJoin(null);
  showToast(cancelledOnline ? "Circle request cancelled" : "Waiting request removed");
}

async function refreshPendingCircleJoin() {
  if (!supabase || !state.user || !state.pendingCircleJoin) {
    return "none";
  }

  let result = null;
  try {
    result = await withTimeout(
      supabase
        .from("circle_join_requests")
        .select("circle_id, status")
        .eq("circle_id", state.pendingCircleJoin.circleId)
        .eq("requester_user_id", state.user.id)
        .maybeSingle(),
      circleRequestActionTimeoutMs,
      "Circle request check timed out.",
    );
  } catch {
    showToast("Circle request check timed out");
    return "timeout";
  }

  const { data: request, error } = result;

  if (error) {
    if (isMissingJoinRequestsTableError(error)) {
      savePendingCircleJoin(null);
      showToast("Circle request system was updated. Paste the invite again.");
      return "missing-schema";
    }

    showToast("Circle request could not be checked");
    return "error";
  }

  if (!request) {
    savePendingCircleJoin(null);
    showToast("No Circle request found. Try the invite again.");
    return "missing";
  }

  if (request.status === "declined" || request.status === "cancelled") {
    savePendingCircleJoin(null);
    showToast("Circle request was not accepted");
    return request.status;
  }

  if (request.status !== "accepted") {
    showToast("Still waiting for approval");
    return request.status;
  }

  await refreshAcceptedCircleJoin(request.circle_id);
  return "accepted";
}

async function refreshAcceptedCircleJoin(circleId) {
  const [{ data: circle }, { data: members }] = await Promise.all([
    supabase.from("circles").select("id, name, invite_code, created_by_user_id, members, categories, icons, updated_at").eq("id", circleId).maybeSingle(),
    supabase.from("circle_members").select("user_id").eq("circle_id", circleId),
  ]);

  if (!circle) {
    showToast("Circle not found");
    return;
  }

  joinAcceptedCircle(circle, members || []);
  showToast("Circle joined");
}

function joinAcceptedCircle(circle, members = []) {
  state.circleInviteStatus = "";
  state.circleInviteError = "";
  state.circle = {
    id: circle.id,
    name: circle.name,
    inviteCode: circle.invite_code || circle.id.slice(0, 8).toUpperCase(),
    createdByUserId: circle.created_by_user_id,
    members: members.map((member) => member.user_id).length ? members.map((member) => member.user_id) : circle.members || [state.user?.id || "local"],
    categories: cleanCategoryOrder(circle.categories).length ? cleanCategoryOrder(circle.categories) : defaultCircleCategories,
    icons: circle.icons || {},
    inviteSynced: true,
    updatedAt: circle.updated_at || new Date().toISOString(),
  };
  state.expenseVisibility = "circle";
  state.selectedCategory = state.circle.categories[0] || "Others";
  savePendingCircleJoin(null);
  localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
  refreshCircleRemoteData().catch(() => {});
  renderCategories();
  renderAll();
}

function isCircleOwner() {
  return Boolean(state.user && state.circle && state.circle.createdByUserId === state.user.id);
}

function canClaimLocalCircle() {
  return Boolean(state.user && state.circle && !isUuid(state.circle.createdByUserId));
}

function claimLocalCircleOwnership() {
  if (!canClaimLocalCircle()) {
    return;
  }

  state.circle.createdByUserId = state.user.id;
  state.circle.members = state.circle.members
    .filter((member) => member !== "local")
    .filter((member, index, all) => all.indexOf(member) === index);
  if (!state.circle.members.includes(state.user.id)) {
    state.circle.members.unshift(state.user.id);
  }
  localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
}

async function resolveCircleInvite(raw) {
  const parsed = parseCircleInvite(raw);
  if ((!parsed.inviteCode && !parsed.circleId) || !supabase || !state.user) {
    return parsed;
  }

  let query = supabase
    .from("circles")
    .select("id, name, invite_code, created_by_user_id, members, categories, icons, updated_at");

  if (parsed.inviteCode && parsed.circleId) {
    query = query.or(`invite_code.eq.${parsed.inviteCode},id.eq.${parsed.circleId}`);
  } else if (parsed.inviteCode) {
    query = query.eq("invite_code", parsed.inviteCode);
  } else {
    query = query.eq("id", parsed.circleId);
  }

  const { data: circle } = await query.limit(1).maybeSingle();

  if (!circle) {
    return parsed;
  }

  return {
    circleId: circle.id,
    name: circle.name,
    inviteCode: circle.invite_code || parsed.inviteCode,
    circle,
  };
}

function parseCircleInvite(raw) {
  const value = raw.trim();
  if (!value) {
    return { circleId: "", name: "", inviteCode: "" };
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const urlText = decodeURIComponent(`${url.pathname} ${url.search} ${url.hash}`);
      const circleId = normalizeCircleId(url.searchParams.get("circle") || url.searchParams.get("circle_id") || url.searchParams.get("id") || urlText);
      const inviteCode = normalizeCircleInviteCode(
        url.searchParams.get("code") ||
        url.searchParams.get("invite") ||
        url.searchParams.get("invite_code") ||
        url.searchParams.get("circle") ||
        urlText ||
        circleId.slice(0, 8),
      );
      return {
        circleId,
        name: url.searchParams.get("name") || "Circle",
        inviteCode,
      };
    } catch {
      return { circleId: "", name: "", inviteCode: "" };
    }
  }

  const circleId = normalizeCircleId(value);
  if (circleId) {
    const inviteCode = normalizeCircleInviteCode(circleId.slice(0, 8));
    return {
      circleId,
      name: `Circle ${inviteCode.slice(0, 4)}`,
      inviteCode,
    };
  }

  const inviteCode = normalizeCircleInviteCode(value);
  if (!inviteCode) {
    return { circleId: "", name: "", inviteCode: "" };
  }

  return {
    circleId: shortCircleIdToUuid(inviteCode),
    name: `Circle ${inviteCode.slice(0, 4)}`,
    inviteCode,
  };
}

function circleInviteCode() {
  return state.circle ? `FLOW-${ensureCircleInviteCode()}` : "";
}

function ensureCircleInviteCode() {
  if (!state.circle) {
    return "";
  }

  if (!state.circle.inviteCode) {
    state.circle.inviteCode = normalizeCircleInviteCode(state.circle.id.slice(0, 8)) || createCircleInviteCode();
    localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
    syncCircle().catch(() => {});
  }

  return state.circle.inviteCode;
}

function shortCircleIdToUuid(shortId) {
  return `${shortId.toLowerCase()}-0000-4000-8000-000000000000`;
}

function normalizeCircleInviteCode(value) {
  const text = String(value || "").toUpperCase().replace(/https?:\/\/[^\s?#]+/g, "");
  const flowMatch = text.match(/FLOW\s*[-:]?\s*([A-F0-9][A-F0-9\s-]{7,})/);
  const rawCode = flowMatch ? flowMatch[1] : text;
  const code = rawCode
    .toUpperCase()
    .replace(/CIRCLE\s*ID:?/g, "")
    .replace(/INVITE\s*CODE:?/g, "")
    .trim()
    .replace(/[^A-F0-9]/g, "");
  const match = code.match(/[A-F0-9]{8}/);
  return match ? match[0] : "";
}

function normalizeCircleId(value) {
  const match = String(value || "").trim().match(/[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/i);
  return match ? match[0].toLowerCase() : "";
}

function createCircleId() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const shortId = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return shortCircleIdToUuid(shortId.toUpperCase());
}

function createCircleInviteCode() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function circleInviteLink() {
  if (!state.circle) {
    return "";
  }

  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.set("circle", state.circle.id);
  url.searchParams.set("code", ensureCircleInviteCode());
  url.searchParams.set("name", state.circle.name);
  return url.toString();
}

async function prepareCircleInvite({ notify = true } = {}) {
  if (!state.circle) {
    throw new Error("Create a Circle first.");
  }

  if (!state.user) {
    state.circleInviteStatus = "auth";
    state.circleInviteError = "";
    renderCircle();
    throw new Error("Sign in first to prepare an online invite.");
  }

  state.circleInviteStatus = "preparing";
  state.circleInviteError = "";
  renderCircle();
  try {
    const isReady = await syncCircleForInvite({ allowSlow: true });
    if (!isReady) {
      state.circleInviteStatus = "slow";
      state.circleInviteError = "Still preparing online invite. Keep this open a moment.";
      renderCircle();
      if (notify) {
        showToast("Invite is still preparing");
      }
      return "";
    }
    state.circleInviteStatus = "ready";
    renderCircle();
    const invite = circleInviteLink() || circleInviteCode();
    if (!invite) {
      throw new Error("Invite could not be prepared.");
    }
    if (notify) {
      showToast("Invite ready");
    }
    return invite;
  } catch (error) {
    state.circleInviteStatus = "error";
    state.circleInviteError = error?.message || "Invite could not be prepared. Check your connection, then tap Invite again.";
    renderCircle();
    throw error;
  }
}

async function syncCircleForInvite({ allowSlow = false } = {}) {
  if (!state.circle) {
    throw new Error("Create a Circle first.");
  }

  if (!supabase || !state.user) {
    throw new Error("Sign in first to share an invite.");
  }

  const invitePromise = syncCircleInviteRow();
  try {
    await withTimeout(
      invitePromise,
      circleInviteSyncTimeoutMs,
      "Invite sync timed out. Check your connection and try again.",
    );
  } catch (error) {
    if (allowSlow && isCircleInviteTimeoutError(error)) {
      watchSlowCircleInvite(invitePromise);
      return false;
    }
    throw error;
  }
  state.circle.inviteSynced = true;
  localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
  ensureCircleMembership().catch(() => {});
  renderCircle();
  return true;
}

function watchSlowCircleInvite(promise) {
  promise
    .then(() => {
      if (!state.circle) {
        return;
      }
      state.circleInviteStatus = "ready";
      state.circleInviteError = "";
      state.circle.inviteSynced = true;
      localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
      ensureCircleMembership().catch(() => {});
      renderCircle();
      showToast("Invite ready");
    })
    .catch((error) => {
      state.circleInviteStatus = "error";
      state.circleInviteError = error?.message || "Invite could not be prepared. Check your connection, then tap Invite again.";
      renderCircle();
      showToast("Invite could not be prepared");
    });
}

function isCircleInviteTimeoutError(error) {
  return String(error?.message || "").toLowerCase().includes("invite sync timed out");
}

async function syncCircleInviteRow() {
  if (!supabase || !state.user || !state.circle) {
    throw new Error("Sign in first to share an invite.");
  }

  await ensureOnlineSessionForCircleInvite();
  claimLocalCircleOwnership();

  if (!isCircleOwner()) {
    throw new Error("Only the Circle owner can create invites.");
  }

  const memberIds = state.circle.members.filter(isUuid);
  if (!memberIds.includes(state.user.id)) {
    memberIds.push(state.user.id);
  }

  const inviteCode = state.circle.inviteCode || state.circle.id.slice(0, 8).toUpperCase();
  const { data, error } = await supabase
    .from("circles")
    .upsert({
      id: state.circle.id,
      name: state.circle.name,
      invite_code: inviteCode,
      created_by_user_id: isUuid(state.circle.createdByUserId) ? state.circle.createdByUserId : state.user.id,
      members: memberIds,
      categories: state.circle.categories,
      icons: state.circle.icons,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })
    .select("id, invite_code, created_by_user_id, members, updated_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Invite could not be prepared.");
  }

  state.circle = {
    ...state.circle,
    id: data?.id || state.circle.id,
    inviteCode: data?.invite_code || inviteCode,
    createdByUserId: data?.created_by_user_id || state.circle.createdByUserId,
    members: Array.isArray(data?.members) && data.members.length ? data.members : memberIds,
    inviteSynced: true,
    updatedAt: data?.updated_at || state.circle.updatedAt,
  };
  localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
}

async function ensureOnlineSessionForCircleInvite() {
  const client = await ensureSupabaseClient();
  if (!client) {
    throw new Error(supabaseUnavailableMessage("preparing an invite"));
  }

  const session = await withTimeout(
    getSupabaseSession(),
    8000,
    "Could not confirm your sign in. Refresh and sign in again.",
  );

  if (!session?.user) {
    state.authenticated = false;
    state.user = null;
    throw new Error("Sign in again to prepare an online invite.");
  }

  state.authenticated = true;
  state.user = session.user;
  state.auth = { email: session.user.email || state.auth.email || "" };
}

function setExpenseVisibility(visibility) {
  state.expenseVisibility = visibility;
  state.categoryEditMode = false;
  state.categoryEditTarget = "";
  state.selectedCategory = activeCategories()[0] || "Other";
  renderCategories();
  renderCircle();
  renderPreview(parseEntry(elements.quickEntry.value));
  focusCapture();
}

async function openQrScanner() {
  elements.qrSheet.hidden = false;
  elements.qrSheet.classList.add("show");
  elements.qrMessage.textContent = "Opening camera...";
  elements.qrLinkInput.value = "";

  if (!navigator.mediaDevices?.getUserMedia) {
    elements.qrMessage.textContent = "Camera access is not available here. Paste the invite link instead.";
    window.setTimeout(() => elements.qrLinkInput.focus(), 60);
    return;
  }

  try {
    if ("BarcodeDetector" in window) {
      state.qrDetector = new BarcodeDetector({ formats: ["qr_code"] });
    }
    state.qrStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    elements.qrVideo.srcObject = state.qrStream;
    await elements.qrVideo.play();
    elements.qrMessage.textContent = state.qrDetector
      ? "Point your camera at a Flow Circle QR code."
      : "Camera is open. This browser cannot read QR codes automatically, so paste the invite link below.";
    if (state.qrDetector) {
      scanQrFrame();
    }
  } catch {
    elements.qrMessage.textContent = "Camera permission is needed to scan. You can paste the invite link instead.";
    window.setTimeout(() => elements.qrLinkInput.focus(), 60);
  }
}

async function scanQrFrame() {
  if (elements.qrSheet.hidden || !state.qrDetector || !elements.qrVideo.srcObject) {
    return;
  }

  try {
    const codes = await state.qrDetector.detect(elements.qrVideo);
    const value = codes[0]?.rawValue;
    if (value && await joinCircleFromInvite(value)) {
      closeQrScanner();
      return;
    }
  } catch {
    elements.qrMessage.textContent = "Still looking for the QR code.";
  }

  state.qrScanTimer = window.setTimeout(scanQrFrame, 450);
}

function closeQrScanner() {
  window.clearTimeout(state.qrScanTimer);
  state.qrScanTimer = 0;
  state.qrDetector = null;
  state.qrStream?.getTracks().forEach((track) => track.stop());
  state.qrStream = null;
  elements.qrVideo.pause();
  elements.qrVideo.srcObject = null;
  elements.qrSheet.classList.remove("show");
  elements.qrSheet.hidden = true;
}

function filteredExpenses() {
  if (state.historyFilter === "personal") {
    return state.expenses.filter((expense) => (expense.expenseVisibility || "personal") === "personal");
  }

  if (state.historyFilter === "circle") {
    return circleExpenses();
  }

  return state.expenses;
}

function circleExpenses() {
  return state.expenses.filter((expense) => expense.expenseVisibility === "circle" && expense.circleId === state.circle?.id);
}

function mergeRemoteExpenses(rows) {
  if (!rows.length) {
    return;
  }

  const byId = new Map(state.expenses.map((expense) => [expense.id, expense]));
  rows.map(fromExpenseRow).forEach((expense) => {
    byId.set(expense.id, { ...byId.get(expense.id), ...expense });
  });
  state.expenses = Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  localStorage.setItem(storageKey, JSON.stringify(state.expenses));
}

function hasPendingExpenseSync() {
  return state.expenses.some((expense) => canWriteExpense(expense) && (expense.syncStatus === "pending" || expense.syncStatus === "failed"));
}

function queueExpenseSync({ notify = false } = {}) {
  if (!supabase || !state.user || state.expenseSyncInFlight || !hasPendingExpenseSync()) {
    return;
  }

  if (!navigator.onLine) {
    return;
  }

  syncExpenses({ notify }).catch(() => {});
}

function markExpensesSynced() {
  state.expenses.forEach((expense) => {
    if (!canWriteExpense(expense)) {
      return;
    }

    expense.syncStatus = "synced";
    expense.syncError = "";
  });
  localStorage.setItem(storageKey, JSON.stringify(state.expenses));
}

function markExpensesSyncFailed(error) {
  const message = error?.message || "Sync failed";
  state.expenses.forEach((expense) => {
    if (canWriteExpense(expense) && expense.syncStatus === "pending") {
      expense.syncStatus = "failed";
      expense.syncError = message;
    }
  });
  localStorage.setItem(storageKey, JSON.stringify(state.expenses));
}

async function retryPendingExpenseSync({ notify = false } = {}) {
  if (!hasPendingExpenseSync() || !navigator.onLine) {
    return;
  }

  const client = await ensureSupabaseClient();
  if (!client) {
    return;
  }

  if (!state.user) {
    const session = await getSupabaseSession();
    state.authenticated = Boolean(session);
    state.user = session?.user || null;
    state.auth = { email: session?.user?.email || state.auth.email || "" };
  }

  if (!state.user) {
    return;
  }

  try {
    await syncExpenses({ notify });
    renderAll();
  } catch {
    if (notify) {
      showToast("Sync will retry when connection improves");
    }
  }
}

async function createSupabaseClient() {
  let createClient = null;

  try {
    ({ createClient } = await import("https://esm.sh/@supabase/supabase-js@2"));
  } catch {
    ({ createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"));
  }

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
    supabase.from("category_settings").select("categories, icons, updated_at").eq("user_id", state.user.id).maybeSingle(),
    supabase
      .from("expenses")
      .select("*")
      .eq("user_id", state.user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (categories) {
    const localSaved = loadCategoryData();
    const localTime = localSaved.updatedAt ? new Date(localSaved.updatedAt).getTime() : 0;
    const remoteTime = categories.updated_at ? new Date(categories.updated_at).getTime() : 0;

    if (localTime > remoteTime) {
      await syncCategories();
    } else {
      state.categories = cleanCategoryOrder(categories.categories).length ? cleanCategoryOrder(categories.categories) : defaultCategories;
      state.categoryIcons = categories.icons || {};
      localStorage.setItem(
        categoryStorageKey,
        JSON.stringify({
          order: state.categories,
          icons: state.categoryIcons,
          updatedAt: categories.updated_at || new Date().toISOString(),
        }),
      );
    }
  } else {
    await syncCategories();
  }

  if (expenses?.length) {
    const pendingLocal = state.expenses.filter((expense) => expense.syncStatus === "pending" || expense.syncStatus === "failed");
    const byId = new Map(expenses.map(fromExpenseRow).map((expense) => [expense.id, expense]));
    pendingLocal.forEach((expense) => byId.set(expense.id, expense));
    state.expenses = Array.from(byId.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    localStorage.setItem(storageKey, JSON.stringify(state.expenses));
    queueExpenseSync();
  } else if (state.expenses.length) {
    await syncExpenses();
  }

  const invite = parseCircleInvite(window.location.href);
  if (!state.circle && (invite.circleId || invite.inviteCode)) {
    await joinCircleFromInvite(window.location.href);
    window.history.replaceState({}, "", window.location.pathname);
  }

  if (!state.circle) {
    await restoreRemoteCircleMembership();
  }

  if (state.circle) {
    await syncCircle().catch((error) => {
      authStartupError = error?.message || "Circle sync failed.";
    });
    await refreshCircleRemoteData();
  } else if (state.pendingCircleJoin) {
    await refreshPendingCircleJoin();
  }

  renderCategories();
  renderAll();
}

async function syncAllRemote() {
  await Promise.all([ensureRemoteProfile(), syncCategories(), syncCircle(), syncExpenses()]);
}

async function restoreRemoteCircleMembership() {
  if (!supabase || !state.user) {
    return false;
  }

  const { data: memberships, error } = await supabase
    .from("circle_members")
    .select("circle_id, joined_at")
    .eq("user_id", state.user.id)
    .order("joined_at", { ascending: false })
    .limit(1);

  if (error || !memberships?.length) {
    return false;
  }

  const circleId = memberships[0].circle_id;
  const [{ data: circle }, { data: members }] = await Promise.all([
    supabase.from("circles").select("id, name, invite_code, created_by_user_id, members, categories, icons, updated_at").eq("id", circleId).maybeSingle(),
    supabase.from("circle_members").select("user_id").eq("circle_id", circleId),
  ]);

  if (!circle) {
    return false;
  }

  joinAcceptedCircle(circle, members || []);
  return true;
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

async function syncExpenses({ notify = false } = {}) {
  if (!supabase || !state.user || !state.expenses.length || state.expenseSyncInFlight) {
    return;
  }

  if (!navigator.onLine) {
    return;
  }

  const writableExpenses = state.expenses.filter(canWriteExpense);
  if (!writableExpenses.length) {
    return;
  }

  state.expenseSyncInFlight = true;
  const rows = writableExpenses.map(toExpenseRow);
  try {
    const { error } = await supabase.from("expenses").upsert(rows);
    if (error) {
      const fallbackRows = rows.map(({ payment_method, ...row }) => row);
      const { error: fallbackError } = await supabase.from("expenses").upsert(fallbackRows);
      if (fallbackError) {
        throw fallbackError;
      }
    }

    const hadPending = hasPendingExpenseSync();
    markExpensesSynced();
    if (notify && hadPending) {
      showToast("Offline expenses synced");
    }
  } catch (error) {
    markExpensesSyncFailed(error);
    throw error;
  } finally {
    state.expenseSyncInFlight = false;
  }
}

async function reconcileOwnerCircleForRequests() {
  const ids = new Set();
  const namesById = {};
  if (!supabase || !state.user || !state.circle || !isCircleOwner()) {
    if (state.circle?.id) {
      ids.add(state.circle.id);
      namesById[state.circle.id] = state.circle.name;
    }
    return { ids: Array.from(ids), namesById };
  }

  ids.add(state.circle.id);
  namesById[state.circle.id] = state.circle.name;
  const inviteCode = normalizeCircleInviteCode(state.circle.inviteCode || state.circle.id.slice(0, 8));

  const { data: ownedCircles, error } = await supabase
    .from("circles")
    .select("id, name, invite_code, created_by_user_id, members, categories, icons, updated_at")
    .eq("created_by_user_id", state.user.id);

  if (error || !ownedCircles?.length) {
    return { ids: Array.from(ids), namesById };
  }

  ownedCircles.forEach((circle) => {
    ids.add(circle.id);
    namesById[circle.id] = circle.name || "Circle";
  });
  const matchedCircle = ownedCircles.find((circle) => circle.id === state.circle.id)
    || ownedCircles.find((circle) => inviteCode && circle.invite_code === inviteCode);
  if (!matchedCircle) {
    return { ids: Array.from(ids), namesById };
  }

  const previousCircleId = state.circle.id;
  state.circle = {
    ...state.circle,
    id: matchedCircle.id,
    name: matchedCircle.name || state.circle.name,
    inviteCode: matchedCircle.invite_code || state.circle.inviteCode,
    createdByUserId: matchedCircle.created_by_user_id || state.circle.createdByUserId,
    members: Array.isArray(matchedCircle.members) && matchedCircle.members.length ? matchedCircle.members : state.circle.members,
    categories: cleanCategoryOrder(matchedCircle.categories).length ? cleanCategoryOrder(matchedCircle.categories) : state.circle.categories,
    icons: matchedCircle.icons || state.circle.icons,
    inviteSynced: true,
    updatedAt: matchedCircle.updated_at || state.circle.updatedAt,
  };

  if (previousCircleId !== state.circle.id) {
    state.expenses.forEach((expense) => {
      if (expense.circleId === previousCircleId) {
        expense.circleId = state.circle.id;
      }
    });
    localStorage.setItem(storageKey, JSON.stringify(state.expenses));
  }
  localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
  return { ids: Array.from(ids), namesById };
}

async function refreshCircleRemoteData() {
  if (!supabase || !state.user || !state.circle) {
    return;
  }

  const { ids: requestCircleIds, namesById: requestCircleNamesById } = await reconcileOwnerCircleForRequests();
  await ensureCircleMembership();

  const [{ data: circle }, { data: members }, { data: circleExpensesData }] = await Promise.all([
    supabase.from("circles").select("id, name, invite_code, created_by_user_id, members, categories, icons, updated_at").eq("id", state.circle.id).maybeSingle(),
    supabase.from("circle_members").select("user_id").eq("circle_id", state.circle.id),
    supabase
      .from("expenses")
      .select("*")
      .eq("circle_id", state.circle.id)
      .eq("expense_visibility", "circle")
      .order("created_at", { ascending: false }),
  ]);

  if (circle) {
    state.circle = {
      ...state.circle,
      name: circle.name || state.circle.name,
      inviteCode: circle.invite_code || state.circle.inviteCode || state.circle.id.slice(0, 8).toUpperCase(),
      createdByUserId: circle.created_by_user_id || state.circle.createdByUserId,
      members: members?.map((member) => member.user_id) || circle.members || state.circle.members,
      categories: cleanCategoryOrder(circle.categories).length ? cleanCategoryOrder(circle.categories) : state.circle.categories,
      icons: circle.icons || state.circle.icons,
      updatedAt: circle.updated_at || state.circle.updatedAt,
    };
    localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
  } else if (members?.length) {
    state.circle.members = members.map((member) => member.user_id);
    saveCircle();
  }

  mergeRemoteExpenses(circleExpensesData || []);

  if (isCircleOwner()) {
    let requestQuery = supabase
      .from("circle_join_requests")
      .select("circle_id, requester_user_id, requester_name, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (requestCircleIds.length > 1) {
      requestQuery = requestQuery.in("circle_id", requestCircleIds);
    } else {
      requestQuery = requestQuery.eq("circle_id", requestCircleIds[0] || state.circle.id);
    }

    const { data: requests, error } = await requestQuery;
    if (error && !isMissingJoinRequestsTableError(error)) {
      throw error;
    }
    state.pendingCircleRequests = (requests || []).map((request) => ({
      ...request,
      circle_name: requestCircleNamesById[request.circle_id] || "this Circle",
    }));
    if (state.pendingCircleRequests.length > state.lastPendingCircleRequestCount) {
      const latestRequest = state.pendingCircleRequests[state.pendingCircleRequests.length - 1];
      const requesterName = latestRequest?.requester_name || "Someone";
      const circleName = latestRequest?.circle_name || "your Circle";
      showToast(`${requesterName} wants to join ${circleName}`);
    }
    state.lastPendingCircleRequestCount = state.pendingCircleRequests.length;
  } else {
    state.pendingCircleRequests = [];
    state.lastPendingCircleRequestCount = 0;
  }

  renderAll();
}

async function ensureCircleMembership() {
  if (!supabase || !state.user || !state.circle) {
    return;
  }

  const { error } = await supabase.from("circle_members").upsert({
    circle_id: state.circle.id,
    user_id: state.user.id,
    role: state.circle.createdByUserId === state.user.id ? "owner" : "member",
    joined_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

function canWriteExpense(expense) {
  if (!state.user) {
    return !isUuid(expense.userId) && !isUuid(expense.createdByUserId);
  }

  const ownerId = expense.userId || expense.createdByUserId;
  return !isUuid(ownerId) || ownerId === state.user.id;
}

async function syncCircle({ requireOwner = false } = {}) {
  if (!supabase || !state.user || !state.circle) {
    return;
  }

  claimLocalCircleOwnership();

  const memberIds = state.circle.members.filter(isUuid);
  if (!memberIds.includes(state.user.id)) {
    memberIds.push(state.user.id);
  }

  if (isCircleOwner()) {
    const { error } = await supabase.from("circles").upsert({
      id: state.circle.id,
      name: state.circle.name,
      invite_code: state.circle.inviteCode || state.circle.id.slice(0, 8).toUpperCase(),
      created_by_user_id: isUuid(state.circle.createdByUserId) ? state.circle.createdByUserId : state.user.id,
      members: memberIds,
      categories: state.circle.categories,
      icons: state.circle.icons,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    state.circle.inviteSynced = true;
    localStorage.setItem(circleStorageKey, JSON.stringify(state.circle));
  } else if (requireOwner) {
    throw new Error("Only the Circle owner can create invites.");
  }

  await ensureCircleMembership();
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
    user_id: isUuid(expense.userId) ? expense.userId : state.user.id,
    amount: expense.amount,
    category: expense.category,
    category_id: expense.categoryId || slugify(expense.category),
    circle_id: expense.circleId || null,
    created_by_user_id: isUuid(expense.createdByUserId) ? expense.createdByUserId : state.user.id,
    expense_visibility: expense.expenseVisibility || "personal",
    payment_method: expense.paymentMethod || "cash",
    label: expense.label,
    note: expense.note || "",
    created_at: expense.createdAt,
    updated_at: new Date().toISOString(),
  };
}

function fromExpenseRow(row) {
  return {
    id: row.id,
    userId: row.user_id || "",
    amount: Number(row.amount),
    category: row.category,
    categoryId: row.category_id || slugify(row.category),
    circleId: row.circle_id || null,
    createdByUserId: row.created_by_user_id || row.user_id || "",
    expenseVisibility: row.expense_visibility || "personal",
    paymentMethod: row.payment_method || "cash",
    label: row.label,
    note: row.note || "",
    createdAt: row.created_at,
    syncStatus: "synced",
    syncError: "",
  };
}

function setGreeting() {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const firstName = firstProfileName(state.profileName || defaultProfileName);
  elements.greeting.textContent = `Good ${timeOfDay}, ${firstName}`;
}

function renderDailySpendLine() {
  if (!elements.dailySpendLine) {
    return;
  }

  const total = totalForDate(new Date());
  elements.dailySpendLine.textContent = `${formatMoney(total)} added today`;
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

function historyDayGroups(expenses) {
  const groups = groupByDay(expenses);
  const today = new Date();
  const todayKey = dateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dateKey(yesterday);
  groups[todayKey] ||= { expenses: [], key: todayKey, label: "Today", total: 0 };
  groups[yesterdayKey] ||= { expenses: [], key: yesterdayKey, label: "Yesterday", total: 0 };

  return Object.values(groups)
    .map((group) => ({
      ...group,
      sortTime: sortTimeFromDateKey(group.key),
      expenses: group.expenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    }))
    .sort((a, b) => b.sortTime - a.sortTime);
}

function sortTimeFromDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month, day).getTime();
}

function emptyHistoryDayMessage(label) {
  if (label === "Today") {
    return "Nothing logged today yet.";
  }

  if (label === "Yesterday") {
    return "Nothing logged yesterday.";
  }

  return "No expenses logged this day.";
}

function totalByCategory(expenses) {
  return expenses.reduce((totals, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});
}

function slugify(value) {
  return String(value || "other")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "other";
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value));
}

async function withTimeout(promise, timeoutMs, message = "Operation timed out.") {
  let timeoutId = 0;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    window.clearTimeout(timeoutId);
  }
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

function detailDateLabel(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function friendlyDateLabel(date) {
  return dayLabel(date) === "Today" || dayLabel(date) === "Yesterday"
    ? dayLabel(date)
    : detailDateLabel(date);
}

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function selectedSaveDate() {
  if (!elements.saveDateInput.value) {
    return null;
  }

  const [year, month, day] = elements.saveDateInput.value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function mergeDateWithCurrentTime(date) {
  const now = new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const day = (date.getDay() + 6) % 7;
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
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: amount % 1 ? 2 : 0,
  }).format(amount);
}

function formatPeso(amount) {
  return `₱${formatMoney(Math.round(amount))}`;
}

function formatChartAxis(amount) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount);
}

function formatPlainAmount(amount) {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

function normalizePhone(value) {
  const phone = String(value || "").replace(/[^\d+]/g, "");
  return phone.startsWith("+") ? phone : "";
}

function titleCase(text) {
  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function cleanProfileName(name) {
  return titleCase(String(name || "").trim()) || defaultProfileName;
}

function firstProfileName(name) {
  return cleanProfileName(name).split(/\s+/)[0] || defaultProfileName;
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
