"use client";

import React, { useState, useEffect } from 'react';
import { useLanguageStore, useAuthStore, translations } from '@/lib/store';
import {
  TrendingUp, ShoppingCart, Package, Users, DollarSign,
  AlertTriangle, ArrowUpRight, Bot, Send, Sparkles, X, Plus,
  Award, ShoppingBag, Clock, Percent, ShieldCheck, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const { lang } = useLanguageStore();
  const { user } = useAuthStore();
  const t = translations[lang];
  const [mounted, setMounted] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: lang === 'ar' 
      ? 'مرحباً بك! أنا مساعد الذكاء الاصطناعي لـ STORE-MO. كيف يمكنني مساعدتك في عملك اليوم؟' 
      : 'Hello! I am the STORE-MO AI Assistant. How can I help you optimize your business today?' }
  ]);
  const [typing, setTyping] = useState(false);

  // Customer Hub simulated states
  const [custPoints, setCustPoints] = useState(320);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [successItem, setSuccessItem] = useState('');
  const [customerOrders, setCustomerOrders] = useState([
    { id: 1, orderNo: 'ORD-5409', date: '2026-06-23', item: 'AirPods Pro 2', amount: 9500, status: 'delivered' },
    { id: 2, orderNo: 'ORD-5310', date: '2026-06-21', item: 'Almarai Fresh Milk 1L', amount: 38, status: 'delivered' }
  ]);

  // Catalog products for Customer Shop
  const shopProducts = [
    { id: 1, name: 'Samsung Smart TV 55"', nameAr: 'تلفزيون سامسونج ذكي 55"', price: 18500, image: '📺' },
    { id: 2, name: 'AirPods Pro 2', nameAr: 'سماعات ايربودز برو 2', price: 9500, image: '🎧' },
    { id: 3, name: 'Almarai Fresh Milk 1L', nameAr: 'حليب المراعي طازج 1 لتر', price: 38, image: '🥛' },
    { id: 4, name: 'Coca Cola 330ml Can', nameAr: 'كانز كوكا كولا 330 مل', price: 12, image: '🥤' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data for charts (Merchant view)
  const salesData = [
    { name: '1', sales: 12000 },
    { name: '2', sales: 19000 },
    { name: '3', sales: 15000 },
    { name: '4', sales: 22000 },
    { name: '5', sales: 26000 },
    { name: '6', sales: 21000 },
    { name: '7', sales: 34000 },
  ];

  const revenueData = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 49000 },
    { name: 'Apr', revenue: 63000 },
    { name: 'May', revenue: 58000 },
    { name: 'Jun', revenue: 76000 },
  ];

  const topProducts = [
    { id: 1, name: 'Samsung Smart TV 55"', sales: 48, revenue: '888,000 EGP', stock: 12 },
    { id: 2, name: 'Almarai Fresh Milk 1L', sales: 350, revenue: '13,300 EGP', stock: 150 },
    { id: 3, name: 'Coca Cola 330ml Can', sales: 290, revenue: '3,480 EGP', stock: 500 },
  ];

  const lowStock = [
    { id: 1, name: 'AirPods Pro 2', stock: 8, min: 10 },
    { id: 2, name: 'Premium Coffee Beans', stock: 4, min: 15 },
  ];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setTyping(false);
      let response = '';
      if (lang === 'ar') {
        if (userMsg.includes('مبيعات') || userMsg.includes('المبيعات')) {
          response = 'مبيعاتك الإجمالية لشهر يونيو بلغت 76,000 ج.م بزيادة قدرها 12% عن الشهر الماضي. المنتج الأكثر مبيعاً هو تلفزيون سامسونج الذكي 55 بوصة.';
        } else if (userMsg.includes('مخزون') || userMsg.includes('المخزون') || userMsg.includes('نقص')) {
          response = 'هناك منتجان تنقص كميتهما عن الحد الأدنى: AirPods Pro 2 (8 قطع متبقية) وحبوب البن الممتازة (4 قطع متبقية). أنصح بإنشاء أمر شراء للموردين.';
        } else {
          response = 'بناءً على تحليلي، أنصح بزيادة كمية تخزين المشروبات بنسبة 15% استعداداً لزيادة الطلب المتوقعة في عطلة نهاية الأسبوع القادمة.';
        }
      } else {
        if (userMsg.includes('sales') || userMsg.includes('revenue')) {
          response = 'Your total sales for June reached 76,000 EGP, showing a 12% increase from last month. The top selling item is the Samsung Smart TV 55".';
        } else if (userMsg.includes('stock') || userMsg.includes('inventory')) {
          response = 'Two items are currently below thresholds: AirPods Pro 2 (8 left) and Premium Coffee Beans (4 left). I recommend generating a purchase order.';
        } else {
          response = 'Based on my analysis, I suggest increasing stock levels of beverages by 15% to prepare for higher demand forecasted for next weekend.';
        }
      }
      setChatMessages((prev) => [...prev, { role: 'assistant', text: response }]);
    }, 1500);
  };

  const handleCustomerPurchase = (prod: typeof shopProducts[0]) => {
    setSuccessItem(lang === 'ar' ? prod.nameAr : prod.name);
    setShowPurchaseSuccess(true);
    setCustPoints(prev => prev + 15); // earn 15 points
    
    // Add to order list
    const newOrd = {
      id: Date.now(),
      orderNo: `ORD-${Math.floor(5000 + Math.random() * 1000)}`,
      date: new Date().toISOString().slice(0, 10),
      item: prod.name,
      amount: prod.price,
      status: 'processing'
    };
    setCustomerOrders([newOrd, ...customerOrders]);

    setTimeout(() => {
      setShowPurchaseSuccess(false);
    }, 2500);
  };

  if (!mounted) return null;

  // ==================== RENDER CUSTOMER VIEW ====================
  if (user?.role === 'customer') {
    return (
      <div className="p-6 space-y-6 animate-fade-in-up">
        
        {/* Welcome Customer Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              {lang === 'ar' ? `مرحباً بك، ${user.name}` : `Welcome, ${user.name}`}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar' ? 'بوابة ولاء العملاء والتسوق المباشر الخاصة بك' : 'Your personal loyalty portal & online shopping hub'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 font-bold px-3.5 py-2 rounded-xl text-xs">
            <ShieldCheck size={14} />
            <span>{lang === 'ar' ? 'حساب زبون مميز' : 'Verified Customer Account'}</span>
          </div>
        </div>

        {showPurchaseSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl flex items-center gap-2 max-w-md animate-fade-in">
            <CheckCircle2 size={18} />
            <div>
              <p className="font-bold">{lang === 'ar' ? 'تم تقديم طلب الشراء بنجاح!' : 'Order Placed Successfully!'}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'ar' ? `لقد اشتريت ${successItem} وكسبت +15 نقطة ولاء جديدة!` : `You purchased ${successItem} and earned +15 loyalty points!`}
              </p>
            </div>
          </div>
        )}

        {/* Ads and Promotions Hero Banner */}
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border-indigo-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 text-indigo-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <Percent size={12} />
              <span>{lang === 'ar' ? 'عروض حصرية وحملات ترويجية' : 'Exclusive Promo Campaigns'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight leading-tight">
              {lang === 'ar' ? 'خصومات الصيف الكبرى وعروض العيد!' : 'Midsummer Megasaver & Eid Sales Live!'}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'ar' 
                ? 'استخدم كود WELCOME10 للحصول على خصم 10% إضافي عند الدفع، أو كود EID2026 لخصم 50 ج.م على الطلبات فوق 200 ج.م!' 
                : 'Apply coupon code WELCOME10 for an extra 10% discount, or EID2026 to save 50 EGP instantly on orders above 200 EGP!'}
            </p>
          </div>
        </div>

        {/* Loyalty Points Card & Recent Purchases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Customer Loyalty Points */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-56">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === 'ar' ? 'نقاط الولاء الخاصة بك' : 'Your Loyalty Points'}</h4>
                <h3 className="text-2xl font-black mt-2 text-indigo-400 font-mono">{custPoints} {lang === 'ar' ? 'نقطة' : 'pts'}</h3>
              </div>
              <span className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Award size={20} /></span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>{lang === 'ar' ? 'الفئة: عضوية ذهبية' : 'Tier: Gold Member'}</span>
                <span>{custPoints} / 500 {lang === 'ar' ? 'نقطة للبلاتينية' : 'pts for Platinum'}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${(custPoints/500)*100}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 leading-relaxed block mt-1">
                {lang === 'ar' ? '* تكسب 15 نقطة إضافية عند كل عملية شراء جديدة!' : '* Every item purchased rewards you with +15 points!'}
              </span>
            </div>
          </div>

          {/* Customer Purchases / Order history */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2 overflow-hidden flex flex-col justify-between h-56">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-400" />
                <span>{lang === 'ar' ? 'سجل طلباتي ومشترياتي الأخيرة' : 'My Recent Orders & Receipts'}</span>
              </h3>

              <div className="overflow-y-auto max-h-[140px] space-y-3 pr-1 text-xs">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="flex justify-between items-center p-2.5 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition">
                    <div className="overflow-hidden mr-2">
                      <p className="font-bold text-slate-200">{ord.item}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{ord.orderNo} • {ord.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-400 font-mono">{ord.amount} EGP</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase ${
                        ord.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                      }`}>
                        {ord.status === 'delivered' ? (lang === 'ar' ? 'تم التوصيل' : 'Delivered') : (lang === 'ar' ? 'قيد التحضير' : 'Processing')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Customer Shop Catalog Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <ShoppingBag size={14} className="text-indigo-400" />
            <span>{lang === 'ar' ? 'تسوق المنتجات مباشرة من المتجر' : 'Quick Online Shopping Grid'}</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shopProducts.map((prod) => (
              <div key={prod.id} className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-48 border hover:border-indigo-500/40 hover:shadow-lg transition duration-200">
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{prod.image}</span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded">In Stock</span>
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{lang === 'ar' ? prod.nameAr : prod.name}</h4>
                  <p className="text-xs font-black text-indigo-400 mt-1 font-mono">{prod.price} EGP</p>
                </div>
                <button
                  onClick={() => handleCustomerPurchase(prod)}
                  className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] transition cursor-pointer"
                >
                  {lang === 'ar' ? 'شراء الآن' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // ==================== RENDER MERCHANT VIEW (ADMIN, MANAGER, STAFF) ====================
  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      
      {/* Welcome header & Quick actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.dashboard}</h1>
          <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'مرحباً بك مجدداً في مركز إدارة أعمالك' : 'Welcome back to your business control panel'}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer">
            <Plus size={14} />
            <span>{t.newSale}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* KPI 1: Sales */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 glow-border transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalSales}</span>
            <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><TrendingUp size={16} /></span>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight mt-1">18,600 EGP</h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight size={10} /> +12.5% {lang === 'ar' ? 'اليوم' : 'today'}
            </span>
          </div>
        </div>

        {/* KPI 2: Orders */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 glow-border transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalOrders}</span>
            <span className="p-2 bg-sky-500/10 rounded-xl text-sky-400"><ShoppingCart size={16} /></span>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight mt-1">42 {lang === 'ar' ? 'طلب' : 'orders'}</h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight size={10} /> +4.2% {lang === 'ar' ? 'هذا الأسبوع' : 'this week'}
            </span>
          </div>
        </div>

        {/* KPI 3: Products */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 glow-border transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalProducts}</span>
            <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><Package size={16} /></span>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight mt-1">148 {lang === 'ar' ? 'صنف' : 'items'}</h3>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {lang === 'ar' ? 'نشط في الفروع' : 'active in branches'}
            </span>
          </div>
        </div>

        {/* KPI 4: Customers */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 glow-border transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalCustomers}</span>
            <span className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><Users size={16} /></span>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight mt-1">320</h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight size={10} /> +8.1% {lang === 'ar' ? 'هذا الشهر' : 'this month'}
            </span>
          </div>
        </div>

        {/* KPI 5: Profit */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 glow-border transition duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalProfit}</span>
            <span className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><DollarSign size={16} /></span>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight mt-1">2,600 EGP</h3>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight size={10} /> +14.2%
            </span>
          </div>
        </div>

        {/* KPI 6: Alerts */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-32 glow-border transition duration-300 border-amber-500/30">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.lowStockAlerts}</span>
            <span className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><AlertTriangle size={16} /></span>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight mt-1 text-amber-500">2 {lang === 'ar' ? 'تنبيه' : 'alerts'}</h3>
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5 mt-1">
              {lang === 'ar' ? 'يتطلب إعادة طلب' : 'Reorder required'}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Charts Section (Row 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Line Chart */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-200">{t.salesCharts}</h3>
            <span className="text-xs text-slate-400">{lang === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}</span>
          </div>
          <div className="h-64 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    labelClassName="text-slate-400 font-bold"
                  />
                  <Line type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-200">{t.revenueCharts}</h3>
            <span className="text-xs text-slate-400">{lang === 'ar' ? 'آخر 6 أشهر' : 'Last 6 months'}</span>
          </div>
          <div className="h-64 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    labelClassName="text-slate-400 font-bold"
                  />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activities & Top Products & AI Insights (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table: Top Selling Products */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl lg:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-200">{t.topSellingProducts}</h3>
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">{lang === 'ar' ? 'عرض الكل' : 'View all'}</a>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold">
                    <th className="py-3 px-2">{t.productName}</th>
                    <th className="py-3 px-2 text-center">{lang === 'ar' ? 'الكمية المباعة' : 'Qty Sold'}</th>
                    <th className="py-3 px-2 text-center">{t.price}</th>
                    <th className="py-3 px-2 text-center">{lang === 'ar' ? 'المخزون المتبقي' : 'In Stock'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {topProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition">
                      <td className="py-4.5 px-2 font-semibold text-slate-200">{p.name}</td>
                      <td className="py-4.5 px-2 text-center font-bold text-indigo-400">{p.sales}</td>
                      <td className="py-4.5 px-2 text-center">{p.revenue}</td>
                      <td className="py-4.5 px-2 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          p.stock < 15 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right card: AI Insights & Low Stock Summary */}
        <div className="space-y-6">
          
          {/* AI Insights Card */}
          <div className="glass-panel p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-indigo-400" size={16} />
              <h3 className="text-sm font-bold text-slate-200">{t.aiInsights}</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-400">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition">
                <p className="font-bold text-indigo-400">{lang === 'ar' ? 'زيادة المبيعات المتوقعة' : 'Sales Growth Predicted'}</p>
                <p className="mt-1 leading-relaxed">{lang === 'ar' ? 'يتوقع الذكاء الاصطناعي زيادة بنسبة 15% في مبيعات المشروبات الأسبوع القادم بسبب الطقس الحار.' : 'AI models predict a 15% rise in beverage sales next week based on local weather trends.'}</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition">
                <p className="font-bold text-amber-400">{lang === 'ar' ? 'تنبيه تحسين المخزون' : 'Stock Optimization Alert'}</p>
                <p className="mt-1 leading-relaxed">{lang === 'ar' ? 'معدل سحب AirPods Pro 2 مرتفع. ننصح بطلب 20 وحدة إضافية لتفادي نفاذ الكمية.' : 'AirPods Pro 2 has high turnover speed. Recommend purchasing 20 additional units immediately.'}</p>
              </div>
            </div>
          </div>

          {/* Low Stock Panel */}
          <div className="glass-panel p-6 rounded-2xl shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">{t.lowStockAlerts}</h3>
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl hover:border-red-500/20 transition">
                  <div>
                    <p className="text-xs font-bold text-slate-200">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? `الحد الأدنى المطلوب: ${item.min}` : `Minimum required: ${item.min}`}</p>
                  </div>
                  <span className="text-xs font-extrabold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg">
                    {item.stock} {lang === 'ar' ? 'قطع' : 'left'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Floating AI Chatbot Icon */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-110"
        >
          {chatOpen ? <X size={22} /> : <Bot size={22} />}
        </button>

        {/* AI Chatbox Overlay Drawer */}
        {chatOpen && (
          <div className={`fixed bottom-24 w-80 sm:w-96 h-[460px] bg-slate-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transition-all duration-300 ${
            lang === 'ar' ? 'left-6' : 'right-6'
          }`}>
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Bot className="text-indigo-400" size={18} />
                <span className="text-xs font-bold">{lang === 'ar' ? 'المساعد الذكي لـ STORE-MO' : 'STORE-MO Smart Assistant'}</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">AI Agent</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 max-w-[80%] rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {typing && (
                <div className="flex justify-start">
                  <div className="p-3 bg-white/5 border border-white/5 text-slate-300 rounded-2xl rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-slate-900/40 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.aiPlaceholder}
                className="flex-1 px-3 py-2 bg-slate-950/60 border border-white/5 rounded-xl text-xs focus:border-indigo-500 focus:outline-none transition"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
