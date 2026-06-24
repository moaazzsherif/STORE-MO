"use client";

import React, { useState } from 'react';
import { useLanguageStore, useThemeStore, useAuthStore, translations } from '@/lib/store';
import { Search, Bell, Moon, Sun, Languages, Globe } from 'lucide-react';

export default function TopNav() {
  const { lang, setLang } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const t = translations[lang];
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const notifications = [
    { id: 1, title: lang === 'ar' ? 'تنبيه: نقص المخزون' : 'Alert: Low stock item', desc: lang === 'ar' ? 'عبوة حليب المراعي شارف على الانتهاء' : 'Almarai Milk quantity is below threshold', time: '5m' },
    { id: 2, title: lang === 'ar' ? 'طلب جديد من المتجر' : 'New Order Received', desc: lang === 'ar' ? 'طلب بقيمة 18,500 ج.م بانتظار الشحن' : 'Order value 18,500 EGP is ready for delivery', time: '1h' },
  ];

  return (
    <header className="h-20 flex items-center justify-between px-6 bg-slate-950/40 border-b border-white/5 backdrop-blur-md sticky top-0 z-30">
      
      {/* Page Title & Breadcrumbs */}
      <div className="hidden sm:block">
        <h2 className="text-sm font-bold text-slate-200">
          {user?.tenantName || 'STORE-MO Enterprise'}
        </h2>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {user?.tenantSubdomain ? `${user.tenantSubdomain}.storemo.com` : 'cairo.storemo.com'}
        </p>
      </div>

      {/* Global Search Bar */}
      <div className="relative w-full max-w-xs md:max-w-md mx-4">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        
        {/* Toggle Language */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl transition cursor-pointer"
          title="Toggle Language"
        >
          <Languages size={16} />
        </button>

        {/* Toggle Light / Dark */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl transition cursor-pointer"
          title="Toggle Dark Mode"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notification Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl transition relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className={`absolute top-12 w-80 bg-slate-950 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 ${
              lang === 'ar' ? 'left-0' : 'right-0'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-200">{lang === 'ar' ? 'التنبيهات العاجلة' : 'System Alerts'}</h4>
                <span className="text-[10px] text-indigo-400 cursor-pointer">{lang === 'ar' ? 'تحديد كالمقروء' : 'Mark all read'}</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl transition">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Badge / Domain link */}
        <a
          href="#"
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <Globe size={14} />
          <span>{lang === 'ar' ? 'عرض المتجر' : 'View Store'}</span>
        </a>
      </div>
    </header>
  );
}
