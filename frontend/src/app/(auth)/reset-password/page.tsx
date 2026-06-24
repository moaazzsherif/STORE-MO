"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguageStore, useThemeStore, translations, Palette } from '@/lib/store';
import { Sun, Moon, Languages, Lock, Check, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguageStore();
  const { theme, toggleTheme, palette, setPalette } = useThemeStore();
  const t = translations[lang];

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(lang === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="premium-login-body min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background drifting glow circles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
      
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

      <div className="w-full max-w-[440px] z-10 animate-fade-in-up">
        <div className="glass-panel rounded-[28px] p-8 md:p-10 shadow-2xl relative">
          <div className="absolute inset-0 rounded-[28px] border border-white/10 pointer-events-none" />

          {submitted ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 mb-4">
                <Check size={28} />
              </div>
              <h2 className="text-lg font-bold">{t.successMsg}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {lang === 'ar' 
                  ? 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' 
                  : 'Password updated successfully. You can now sign in.'}
              </p>
              <div className="mt-8 flex justify-center">
                <Link href="/login" className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition">
                  {lang === 'en' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                  <span>{t.backToLogin}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold tracking-tight">{t.resetPassTitle}</h1>
                <p className="text-xs text-slate-400 mt-2">{t.resetPassSubtitle}</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                  </label>
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
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:border-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-sm focus:border-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full glow-btn font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-6">
                  <span>{t.updatePasswordBtn}</span>
                </button>
              </form>

              <div className="text-center mt-6">
                <Link href="/login" className="text-xs text-slate-400 hover:text-white transition">
                  {t.backToLogin}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
