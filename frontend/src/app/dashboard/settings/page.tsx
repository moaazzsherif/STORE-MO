"use client";

import React, { useState } from 'react';
import { useLanguageStore, useThemeStore, useAuthStore, translations, Palette } from '@/lib/store';
import { Settings, Save, CheckCircle2, User, Phone, Mail, Languages } from 'lucide-react';

export default function SettingsPage() {
  const { lang, setLang } = useLanguageStore();
  const { theme, toggleTheme, palette, setPalette } = useThemeStore();
  const { user } = useAuthStore();
  const t = translations[lang];

  // Merchant Settings State
  const [shopName, setShopName] = useState('STORE-MO Cairo Group');
  const [shopPhone, setShopPhone] = useState('+20 100 234 5678');
  const [currency, setCurrency] = useState('EGP');
  const [taxRate, setTaxRate] = useState(14);
  
  // Customer Profile State
  const [custName, setCustName] = useState(user?.name || 'Mohamed Aly');
  const [custPhone, setCustPhone] = useState('+20 100 234 5678');
  const [custEmail, setCustEmail] = useState(user?.email || 'customer@example.com');
  
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  // ==================== CUSTOMER SETTINGS VIEW ====================
  if (user?.role === 'customer') {
    return (
      <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
        
        {/* Title */}
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">
            {lang === 'ar' ? 'الملف الشخصي والإعدادات' : 'My Profile & Preferences'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ar' ? 'تعديل بيانات حسابك الشخصي ولغتك وتخصيص المظهر' : 'Configure your personal contact info, languages, and theme preferences'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Form */}
          <div className="glass-panel p-6 rounded-2xl lg:col-span-2 relative overflow-hidden">
            <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
            
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
                <User size={14} className="text-indigo-400" />
                <span>{lang === 'ar' ? 'بيانات الحساب الشخصي' : 'Personal Profile Information'}</span>
              </h3>

              {success && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>{t.successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><User size={14} /></span>
                    <input
                      type="text"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">{t.phone}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Phone size={14} /></span>
                      <input
                        type="text"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">{t.email}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Mail size={14} /></span>
                      <input
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        required
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Preferred Language */}
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'اللغة المفضلة للواجهة' : 'App Interface Language'}</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLang('ar')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        lang === 'ar' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Languages size={14} />
                      <span>العربية</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        lang === 'en' ? 'bg-indigo-600 text-white' : 'bg-slate-950 border border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Languages size={14} />
                      <span>English</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 mt-6">
                  <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer transition">
                    <Save size={14} />
                    <span>{lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Theme customizer for customer */}
          <div className="glass-panel p-6 rounded-2xl space-y-5 h-fit">
            <h3 className="text-sm font-bold text-slate-200">{lang === 'ar' ? 'تخصيص المظهر والثيم' : 'Visual Theme Settings'}</h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'وضع الإضاءة / العتمة' : 'Theme Mode'}</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/5">
                  <button 
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {lang === 'ar' ? 'فاتح' : 'Light'}
                  </button>
                  <button 
                    onClick={() => theme === 'light' && toggleTheme()}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {lang === 'ar' ? 'داكن' : 'Dark'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'لوحة الألوان الأساسية' : 'Color Palette Selector'}</label>
                <div className="grid grid-cols-5 gap-2 bg-slate-950 border border-white/5 rounded-xl p-2">
                  {(['indigo', 'ocean', 'emerald', 'amber', 'violet'] as Palette[]).map((p) => {
                    const colors = {
                      indigo: 'bg-indigo-500',
                      ocean: 'bg-sky-500',
                      emerald: 'bg-emerald-500',
                      amber: 'bg-amber-500',
                      violet: 'bg-purple-500',
                    };
                    return (
                      <button
                        key={p}
                        onClick={() => setPalette(p)}
                        className={`h-7 rounded-lg ${colors[p]} transition transform hover:scale-110 flex items-center justify-center ${
                          palette === p ? 'ring-2 ring-white' : 'opacity-65'
                        }`}
                        title={p}
                      >
                        {palette === p && <span className="h-1.5 w-1.5 bg-white rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==================== MERCHANT SETTINGS VIEW ====================
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.settings}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'تعديل بيانات المتجر، خيارات الضرائب، العملة وتخصيص المظهر' : 'Configure global ERP options, billing taxes, currency, and theme layout styles'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Settings Form */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Settings size={14} className="text-indigo-400" />
              <span>{t.storeInfo}</span>
            </h3>

            {success && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{t.successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'اسم المتجر / النشاط' : 'Shop Name'}</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{t.phone}</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{t.currency}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="EGP">Egyptian Pound (EGP)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="SAR">Saudi Riyal (SAR)</option>
                    <option value="AED">UAE Dirham (AED)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{t.taxRate} (%)</label>
                  <input
                    type="number"
                    value={taxRate || ''}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Logo upload widget */}
              <div className="pt-2">
                <label className="block text-slate-400 font-bold mb-1.5">{t.logo}</label>
                <div className="flex items-center gap-4 p-4 bg-slate-950/40 border border-dashed border-white/10 rounded-2xl">
                  <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                    <span className="text-xl">🖼️</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-200">{lang === 'ar' ? 'رفع شعار جديد' : 'Upload Store Logo'}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">PNG, JPG up to 2MB (recommended square 512x512)</p>
                  </div>
                  <button type="button" className="ml-auto text-[10px] font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition">
                    {lang === 'ar' ? 'اختر ملف' : 'Choose File'}
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 mt-6">
                <button type="submit" className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/10">
                  <Save size={14} />
                  <span>{t.saveSettings}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Theme customization panel */}
        <div className="glass-panel p-6 rounded-2xl space-y-5 h-fit">
          <h3 className="text-sm font-bold text-slate-200">{lang === 'ar' ? 'تخصيص المظهر والثيم' : 'Visual Theme Settings'}</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'وضع الإضاءة / العتمة' : 'Theme Mode'}</label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/5">
                <button 
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    theme === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? 'فاتح' : 'Light'}
                </button>
                <button 
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                    theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {lang === 'ar' ? 'داكن' : 'Dark'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'لوحة الألوان الأساسية' : 'Color Palette Selector'}</label>
              <div className="grid grid-cols-5 gap-2 bg-slate-950 border border-white/5 rounded-xl p-2">
                {(['indigo', 'ocean', 'emerald', 'amber', 'violet'] as Palette[]).map((p) => {
                  const colors = {
                    indigo: 'bg-indigo-500',
                    ocean: 'bg-sky-500',
                    emerald: 'bg-emerald-500',
                    amber: 'bg-amber-500',
                    violet: 'bg-purple-500',
                  };
                  return (
                    <button
                      key={p}
                      onClick={() => setPalette(p)}
                      className={`h-7 rounded-lg ${colors[p]} transition transform hover:scale-110 flex items-center justify-center ${
                        palette === p ? 'ring-2 ring-white' : 'opacity-65'
                      }`}
                      title={p}
                    >
                      {palette === p && <span className="h-1.5 w-1.5 bg-white rounded-full" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
