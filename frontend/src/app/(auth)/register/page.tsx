"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguageStore, useThemeStore, translations, Palette } from '@/lib/store';
import { Sun, Moon, Languages, ArrowRight, ArrowLeft, Building2, User, Key, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguageStore();
  const { theme, toggleTheme, palette, setPalette } = useThemeStore();
  const t = translations[lang];

  // Steps: 'business' | 'owner' | 'plan'
  const [step, setStep] = useState<'business' | 'owner' | 'plan'>('business');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('supermarket');
  const [subdomain, setSubdomain] = useState('');
  const [phone, setPhone] = useState('');
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [success, setSuccess] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'business') {
      setStep('owner');
    } else if (step === 'owner') {
      setStep('plan');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  return (
    <div className="premium-login-body min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background drifting glow circles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px] animate-pulse pointer-events-none" />
      
      {/* Header controls */}
      <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 z-50">
        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-2">
          <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition">
            <Languages size={14} />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-2">
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
                className={`w-5 h-5 rounded-full ${colors[p]} transition transform hover:scale-125 ${
                  palette === p ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-65'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-[540px] z-10 animate-fade-in-up mt-12 mb-6">
        <div className="glass-panel rounded-[28px] p-6 md:p-8 shadow-2xl relative">
          <div className="absolute inset-0 rounded-[28px] border border-white/10 pointer-events-none" />

          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-500/20 rounded-full text-emerald-400 mb-4 animate-bounce">
                <Check size={36} />
              </div>
              <h2 className="text-xl font-bold">{t.successMsg}</h2>
              <p className="text-xs text-slate-400 mt-2">
                {lang === 'ar' ? 'جاري توجيهك لصفحة تسجيل الدخول...' : 'Redirecting to login portal...'}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">STORE-MO</span>
                  <span className="font-light"> Setup</span>
                </h1>
                <p className="text-xs text-slate-400 mt-2">{t.registerSubtitle}</p>
              </div>

              {/* Progress steps indicator */}
              <div className="flex justify-between items-center mb-8 px-4 text-xs font-bold text-slate-400 relative">
                <div className="absolute left-8 right-8 top-1/2 h-[2px] bg-white/5 -z-10" />
                <div className={`flex flex-col items-center gap-1.5 ${step === 'business' ? 'text-indigo-400' : ''}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] ${
                    step === 'business' ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-white/10 bg-slate-950'
                  }`}>1</span>
                  <span>{lang === 'ar' ? 'المتجر' : 'Store'}</span>
                </div>
                <div className={`flex flex-col items-center gap-1.5 ${step === 'owner' ? 'text-indigo-400' : ''}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] ${
                    step === 'owner' ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-white/10 bg-slate-950'
                  }`}>2</span>
                  <span>{lang === 'ar' ? 'المالك' : 'Owner'}</span>
                </div>
                <div className={`flex flex-col items-center gap-1.5 ${step === 'plan' ? 'text-indigo-400' : ''}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] ${
                    step === 'plan' ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-white/10 bg-slate-950'
                  }`}>3</span>
                  <span>{lang === 'ar' ? 'الباقة' : 'Plan'}</span>
                </div>
              </div>

              {/* Business Step */}
              {step === 'business' && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.businessName}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Building2 size={16} /></span>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        placeholder="e.g. Cairo Supermarket"
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.businessType}</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="supermarket">{lang === 'ar' ? 'سوبر ماركت' : 'Supermarket'}</option>
                        <option value="pharmacy">{lang === 'ar' ? 'صيدلية' : 'Pharmacy'}</option>
                        <option value="electronics">{lang === 'ar' ? 'إلكترونيات' : 'Electronics'}</option>
                        <option value="fashion">{lang === 'ar' ? 'ملابس وأزياء' : 'Fashion/Apparel'}</option>
                        <option value="wholesaler">{lang === 'ar' ? 'تجارة جملة' : 'Wholesaler'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.phone}</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        placeholder="+20 123..."
                        className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.subdomain}</label>
                    <div className="flex rounded-xl bg-slate-950/40 border border-white/5 overflow-hidden focus-within:border-indigo-500 transition">
                      <input
                        type="text"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        required
                        placeholder="cairo-market"
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm focus:outline-none"
                      />
                      <span className="bg-white/5 text-xs text-slate-400 px-4 flex items-center border-l border-white/5 font-mono">.storemo.com</span>
                    </div>
                  </div>

                  <button type="submit" className="w-full glow-btn font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-6">
                    <span>{lang === 'ar' ? 'التالي' : 'Next'}</span>
                    {lang === 'en' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                  </button>
                </form>
              )}

              {/* Owner Details Step */}
              {step === 'owner' && (
                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'ar' ? 'الاسم الأول' : 'First Name'}</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{lang === 'ar' ? 'اسم العائلة' : 'Last Name'}</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.email}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><User size={16} /></span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="owner@example.com"
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">{t.password}</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><Key size={16} /></span>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep('business')}
                      className="w-1/3 py-3 border border-white/5 hover:bg-white/5 rounded-xl font-semibold text-xs transition text-center cursor-pointer"
                    >
                      {lang === 'ar' ? 'السابق' : 'Back'}
                    </button>
                    <button type="submit" className="w-2/3 glow-btn font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                      <span>{lang === 'ar' ? 'التالي' : 'Next'}</span>
                      {lang === 'en' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                    </button>
                  </div>
                </form>
              )}

              {/* Plan Step */}
              {step === 'plan' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-3">
                    <div 
                      onClick={() => setSelectedPlan('free')}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex justify-between items-center ${
                        selectedPlan === 'free' ? 'bg-indigo-500/10 border-indigo-500/60' : 'bg-slate-950/40 border-white/5'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-200">{lang === 'ar' ? 'الباقة الأساسية (تجريبية)' : 'Basic Free Tier'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'فرع واحد، مستخدمين كاشير عدد 2' : '1 branch, 2 active cashier users'}</p>
                      </div>
                      <span className="text-xs font-black text-indigo-400">0 EGP</span>
                    </div>

                    <div 
                      onClick={() => setSelectedPlan('pro')}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex justify-between items-center ${
                        selectedPlan === 'pro' ? 'bg-indigo-500/10 border-indigo-500/60' : 'bg-slate-950/40 border-white/5'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-200">{lang === 'ar' ? 'باقة نمو الأعمال (البريميوم)' : 'Business Growth Plan'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'مستودعات وفروع متعددة، كاشير ذكي، توقعات بالذكاء الاصطناعي' : 'Multiple branches, unlimited POS devices, AI center'}</p>
                      </div>
                      <span className="text-xs font-black text-indigo-400">1,200 EGP</span>
                    </div>

                    <div 
                      onClick={() => setSelectedPlan('enterprise')}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex justify-between items-center ${
                        selectedPlan === 'enterprise' ? 'bg-indigo-500/10 border-indigo-500/60' : 'bg-slate-950/40 border-white/5'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-200">{lang === 'ar' ? 'باقة الشركات الكبرى' : 'Dubai Enterprise'}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'ربط مخصص للربط الضريبي الحكومي، خادم سحابي مخصص' : 'Custom integrations, dedicated servers, API keys access'}</p>
                      </div>
                      <span className="text-xs font-black text-indigo-400">3,500 EGP</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep('owner')}
                      className="w-1/3 py-3 border border-white/5 hover:bg-white/5 rounded-xl font-semibold text-xs transition text-center cursor-pointer"
                    >
                      {lang === 'ar' ? 'السابق' : 'Back'}
                    </button>
                    <button type="submit" className="w-2/3 glow-btn font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                      <span>{t.registerBtn}</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="flex justify-center items-center mt-6 pt-6 border-t border-white/5 text-xs">
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition">
                  {t.haveAccount}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
