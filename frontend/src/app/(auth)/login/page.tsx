"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useLanguageStore, useThemeStore, translations, Palette } from '@/lib/store';
import { Mail, Lock, ShieldCheck, Sun, Moon, Languages, ArrowRight, ArrowLeft, User, Briefcase, Shield } from 'lucide-react';

type RoleType = 'admin' | 'manager' | 'cashier' | 'inventory' | 'customer';

export default function LoginPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguageStore();
  const { theme, toggleTheme, palette, setPalette } = useThemeStore();
  const { login, isAuthenticated } = useAuthStore();
  const t = translations[lang];

  // Forms state
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('adminpassword123');
  const [selectedRole, setSelectedRole] = useState<RoleType>('admin');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [code, setCode] = useState(['', '', '', '', '', '']);

  // Role credentials map for quick-fill
  const roleAccounts: Record<RoleType, { email: string; pass: string; nameEn: string; nameAr: string }> = {
    admin: { email: 'admin@example.com', pass: 'adminpassword123', nameEn: 'Owner Admin', nameAr: 'المدير العام' },
    manager: { email: 'manager@example.com', pass: 'manager123', nameEn: 'Branch Manager', nameAr: 'مدير الفرع' },
    cashier: { email: 'cashier@example.com', pass: 'cashier123', nameEn: 'Cashier Staff', nameAr: 'موظف الكاشير' },
    inventory: { email: 'inventory@example.com', pass: 'inventory123', nameEn: 'Stock Keeper', nameAr: 'أمين المستودع' },
    customer: { email: 'customer@example.com', pass: 'customer123', nameEn: 'Loyal Customer', nameAr: 'العميل المميز' }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    setEmail(roleAccounts[role].email);
    setPassword(roleAccounts[role].pass);
    setError('');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check credentials against the role map
    const activeAccount = roleAccounts[selectedRole];
    if (email === activeAccount.email && password === activeAccount.pass) {
      setStep('2fa');
    } else {
      setError(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة لنوع الحساب المحدد' : 'Invalid credentials for the selected account type');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');

    // Simulate verification check (valid code: 123456)
    if (verificationCode === '123456') {
      const accountInfo = roleAccounts[selectedRole];
      login({
        email: email,
        name: lang === 'ar' ? accountInfo.nameAr : accountInfo.nameEn,
        role: selectedRole,
        tenantName: 'STORE-MO Cairo Group',
        tenantSubdomain: 'cairo',
      });
      
      // Redirect cashier directly to POS page, others to Dashboard
      if (selectedRole === 'cashier') {
        router.push('/dashboard/pos');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(lang === 'ar' ? 'رمز الأمان غير صحيح (استخدم 123456)' : 'Invalid security code (use 123456)');
    }
  };

  return (
    <div className="premium-login-body min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      
      {/* Background drifting glow circles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px] animate-pulse pointer-events-none" />
      
      {/* Header controls (Language & Dark Mode & Palette) */}
      <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 z-50">
        
        {/* Theme and language switcher */}
        <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-2">
          
          {/* Toggle Theme Mode */}
          <button 
            onClick={toggleTheme} 
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Toggle Language */}
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition"
          >
            <Languages size={14} />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>

        {/* Theme Palette Switcher */}
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
                title={p}
              />
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-[480px] z-10 animate-fade-in-up mt-12 mb-6">
        
        {/* Main login card */}
        <div className="glass-panel rounded-[28px] p-6 md:p-8 shadow-2xl relative">
          
          {/* Border accent glow */}
          <div className="absolute inset-0 rounded-[28px] border border-white/10 pointer-events-none" />

          {step === 'credentials' ? (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">STORE-MO</span>
                  <span className="font-light"> Portal</span>
                </h1>
                <p className="text-sm text-slate-400 mt-2">{t.loginSubtitle}</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Quick role selection cards */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  {t.roleSelectorLabel}
                </label>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-white/5">
                  {(['admin', 'manager', 'cashier', 'inventory', 'customer'] as RoleType[]).map((role) => {
                    const isActive = selectedRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleChange(role)}
                        className={`py-2 text-[10px] font-bold rounded-lg transition-all capitalize ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.email}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="email@example.com"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {t.password}
                    </label>
                    <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                      {t.forgotPass}
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full glow-btn font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-4">
                  <span>{t.loginBtn}</span>
                  {lang === 'en' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                </button>
              </form>
              
              <div className="flex justify-center items-center mt-6 pt-6 border-t border-white/5 text-xs text-slate-400">
                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition">
                  {lang === 'ar' ? 'سجل شركتك الآن (إنشاء حساب جديد)' : 'Register your business (Create Account)'}
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/15 rounded-2xl text-indigo-400 mb-3">
                  <ShieldCheck size={28} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">{t.twoFactorTitle}</h1>
                <p className="text-xs text-slate-400 mt-2">{t.twoFactorSubtitle}</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handle2FASubmit} className="space-y-6">
                <div className="flex justify-center gap-2 dir-ltr">
                  {code.map((num, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={num}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-12 text-center text-lg font-extrabold bg-slate-950/40 border border-white/5 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none transition"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setError('');
                      setCode(['', '', '', '', '', '']);
                    }}
                    className="w-1/3 py-3 border border-white/5 hover:bg-white/5 rounded-xl font-semibold text-xs transition text-center cursor-pointer"
                  >
                    {lang === 'ar' ? 'رجوع' : 'Back'}
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 glow-btn font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {t.verifyBtn}
                  </button>
                </div>
              </form>

              <div className="text-center mt-6">
                <span className="text-xs text-slate-400">
                  {lang === 'ar' ? 'رمز الأمان للتجربة:' : 'Demo security code:'} <code className="text-indigo-400 bg-white/5 px-2 py-0.5 rounded">123456</code>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
