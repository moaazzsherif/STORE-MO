import { create } from 'zustand';

// 1. Language Store (Arabic / English)
interface LanguageState {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: 'ar', // Default to Arabic as requested
  setLang: (lang) => set({ lang }),
}));

// 2. Theme Store (Modes and Palettes)
export type Palette = 'indigo' | 'ocean' | 'emerald' | 'amber' | 'violet';

interface ThemeState {
  theme: 'light' | 'dark';
  palette: Palette;
  toggleTheme: () => void;
  setPalette: (palette: Palette) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark', // Default to dark mode for rich premium aesthetic
  palette: 'indigo',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setPalette: (palette) => set({ palette }),
}));

// 3. Authentication & Tenant Session Store
export interface UserSession {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier' | 'inventory' | 'customer';
  tenantName: string;
  tenantSubdomain: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserSession | null;
  login: (user: UserSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));

// 4. In-App Localization Dictionaries
export const translations = {
  en: {
    dashboard: "Dashboard",
    sales: "Sales Ledger",
    products: "Product Catalog",
    inventory: "Warehouses & Stock",
    pos: "POS Cashier",
    purchases: "Purchases",
    ecommerce: "E-Commerce",
    customers: "Customers",
    suppliers: "Suppliers",
    employees: "Employees & Shifts",
    reports: "Report Center",
    billing: "SaaS Billing",
    aiCenter: "AI Analytics",
    settings: "Settings",
    loginTitle: "STORE-MO Control Center",
    loginSubtitle: "Sign in to manage your retail & POS enterprise",
    email: "Email Address",
    password: "Password",
    loginBtn: "Sign In",
    forgotPass: "Forgot password?",
    twoFactorTitle: "Two-Factor Verification",
    twoFactorSubtitle: "Enter the code sent to your mobile",
    verifyBtn: "Verify Code",
    totalSales: "Total Sales",
    totalOrders: "Total Orders",
    totalProducts: "Total Products",
    totalCustomers: "Total Customers",
    totalProfit: "Total Profit",
    totalExpenses: "Total Expenses",
    lowStockAlerts: "Low Stock Alerts",
    recentActivities: "Recent Activities",
    topSellingProducts: "Top Selling Products",
    salesCharts: "Sales Trend",
    revenueCharts: "Monthly Revenue",
    aiInsights: "AI Insights",
    searchPlaceholder: "Search records, actions, or products...",
    logout: "Log Out",
    welcome: "Welcome",
    productName: "Product Name",
    sku: "SKU",
    price: "Price",
    stock: "Stock",
    status: "Status",
    actions: "Actions",
    noData: "No records found.",
    aiPlaceholder: "Ask the AI assistant anything about sales, forecasts, or inventory...",
    send: "Send",
    newSale: "New Sale",
    totalAmount: "Total Amount",
    paymentMethod: "Payment Method",
    invoiceNumber: "Invoice Number",

    // Role-based testing keys
    roleSelectorLabel: "Choose Testing Profile / Role",
    adminRole: "Administrator (Full Access)",
    managerRole: "Branch Manager (Limited Operations)",
    cashierRole: "Cashier (POS & Shift Only)",
    inventoryRole: "Inventory Manager (Stock & Products)",
    customerRole: "Loyal Customer (Loyalty Portal)",

    // Auth forms
    registerTitle: "Register Business",
    registerSubtitle: "Launch your retail & POS enterprise in seconds",
    businessName: "Business Name",
    businessType: "Business Type",
    subdomain: "Subdomain Prefix",
    phone: "Phone Number",
    ownerDetails: "Owner Details",
    selectPlan: "Select Subscription Tier",
    registerBtn: "Register & Setup",
    haveAccount: "Already have an account? Sign In",
    forgotPassTitle: "Recover Password",
    forgotPassSubtitle: "Enter your email to receive recovery instructions",
    sendResetLink: "Send Recovery Link",
    resetPassTitle: "Reset Password",
    resetPassSubtitle: "Create a new strong password for your account",
    updatePasswordBtn: "Update Password",
    backToLogin: "Back to Sign In",
    successMsg: "Action completed successfully!",

    // POS details
    cart: "Shopping Cart",
    emptyCart: "Cart is empty",
    checkout: "Checkout & Pay",
    searchProduct: "Search product...",
    categories: "Categories",
    discount: "Discount",
    receiptTitle: "STORE-MO Receipt",
    printReceipt: "Print Receipt",
    close: "Close",
    payCash: "Pay Cash",
    payCard: "Pay Card",
    tax: "Tax (14%)",
    subtotal: "Subtotal",

    // Inventory details
    warehouses: "Warehouses",
    stockAdjust: "Stock Adjustment",
    reason: "Reason",
    quantity: "Quantity",
    adjustBtn: "Adjust Stock",
    capacity: "Capacity",

    // Settings details
    storeInfo: "Store Information",
    saveSettings: "Save Settings",
    currency: "Currency",
    taxRate: "Tax Rate",
    logo: "Store Logo",

    // Billing details
    upgradePlan: "Upgrade Business Plan",
    activePlan: "Active Plan",
    features: "Features",
    pricePerMonth: "EGP / month",
  },
  ar: {
    dashboard: "لوحة التحكم",
    sales: "دفتر المبيعات",
    products: "دليل المنتجات",
    inventory: "المخازن والمخزون",
    pos: "كاشير ونقاط البيع",
    purchases: "المشتريات",
    ecommerce: "المتجر الإلكتروني",
    customers: "العملاء",
    suppliers: "الموردين",
    employees: "الموظفين والورديات",
    reports: "التقارير والإحصائيات",
    billing: "الاشتراكات والفواتير",
    aiCenter: "مركز الذكاء الاصطناعي",
    settings: "الإعدادات العامة",
    loginTitle: "بوابة التحكم لـ STORE-MO",
    loginSubtitle: "تسجيل الدخول لإدارة نقاط البيع والمخازن",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginBtn: "تسجيل الدخول",
    forgotPass: "هل نسيت كلمة المرور؟",
    twoFactorTitle: "التحقق الثنائي للمسؤول",
    twoFactorSubtitle: "أدخل رمز الأمان المرسل لهاتفك المحمول",
    verifyBtn: "تأكيد الرمز",
    totalSales: "إجمالي المبيعات",
    totalOrders: "إجمالي الطلبات",
    totalProducts: "إجمالي المنتجات",
    totalCustomers: "إجمالي العملاء",
    totalProfit: "صافي الأرباح",
    totalExpenses: "إجمالي المصاريف",
    lowStockAlerts: "تنبيهات نقص المخزون",
    recentActivities: "آخر النشاطات",
    topSellingProducts: "المنتجات الأكثر مبيعاً",
    salesCharts: "منحنى المبيعات",
    revenueCharts: "الإيرادات الشهرية",
    aiInsights: "رؤى وتوصيات الذكاء الاصطناعي",
    searchPlaceholder: "البحث في المنتجات، السجلات، أو الإجراءات...",
    logout: "تسجيل الخروج",
    welcome: "مرحباً بك",
    productName: "اسم المنتج",
    sku: "كود المنتج (SKU)",
    price: "السعر",
    stock: "الكمية",
    status: "الحالة",
    actions: "الإجراءات",
    noData: "لا توجد سجلات حالية.",
    aiPlaceholder: "اسأل المساعد الذكي عن توقعات المبيعات والمخزون...",
    send: "إرسال",
    newSale: "عملية بيع جديدة",
    totalAmount: "المبلغ الإجمالي",
    paymentMethod: "طريقة الدفع",
    invoiceNumber: "رقم الفاتورة",

    // Role-based testing keys
    roleSelectorLabel: "اختر صلاحية / نوع الحساب للتجربة",
    adminRole: "المدير العام (صلاحيات كاملة)",
    managerRole: "مدير الفرع (صلاحيات تشغيلية)",
    cashierRole: "الكاشير (نقاط البيع والورديات فقط)",
    inventoryRole: "مسؤول المستودع (المخزون والمنتجات)",
    customerRole: "العميل (بوابة ولاء العملاء)",

    // Auth forms
    registerTitle: "تسجيل حساب شركة جديد",
    registerSubtitle: "ابدأ إدارة متجرك ونقاط البيع الخاصة بك خلال ثوانٍ",
    businessName: "اسم الشركة / النشاط التجاري",
    businessType: "نوع النشاط",
    subdomain: "الرابط الفرعي (Subdomain)",
    phone: "رقم الهاتف",
    ownerDetails: "بيانات مالك الحساب",
    selectPlan: "اختر باقة الاشتراك",
    registerBtn: "إنشاء الحساب والإعداد",
    haveAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
    forgotPassTitle: "استعادة كلمة المرور",
    forgotPassSubtitle: "أدخل بريدك الإلكتروني لإرسال رابط الاستعادة",
    sendResetLink: "إرسال رابط الاستعادة",
    resetPassTitle: "تعيين كلمة المرور الجديدة",
    resetPassSubtitle: "قم بإنشاء كلمة مرور قوية لحماية حسابك",
    updatePasswordBtn: "تحديث كلمة المرور",
    backToLogin: "العودة لتسجيل الدخول",
    successMsg: "تمت العملية بنجاح!",

    // POS details
    cart: "سلة المشتريات",
    emptyCart: "السلة فارغة",
    checkout: "تأكيد الدفع وفاتورة",
    searchProduct: "ابحث عن منتج...",
    categories: "الأقسام",
    discount: "الخصم",
    receiptTitle: "فاتورة شراء STORE-MO",
    printReceipt: "طباعة الفاتورة",
    close: "إغلاق",
    payCash: "دفع نقدي",
    payCard: "دفع بالبطاقة",
    tax: "الضريبة (14%)",
    subtotal: "المجموع الفرعي",

    // Inventory details
    warehouses: "المستودعات والفروع",
    stockAdjust: "تعديل كمية المخزون",
    reason: "سبب التعديل",
    quantity: "الكمية",
    adjustBtn: "تعديل الكمية",
    capacity: "السعة الاستيعابية",

    // Settings details
    storeInfo: "بيانات المتجر",
    saveSettings: "حفظ الإعدادات",
    currency: "العملة",
    taxRate: "نسبة الضريبة",
    logo: "شعار المتجر",

    // Billing details
    upgradePlan: "ترقية باقة الشركة",
    activePlan: "الباقة النشطة حالياً",
    features: "المميزات المشمولة",
    pricePerMonth: "ج.م / شهرياً",
  }
};
