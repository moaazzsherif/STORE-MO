"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { CreditCard, Check, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function BillingPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  const [activePlan, setActivePlan] = useState('pro'); // default
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: lang === 'ar' ? 'الباقة الأساسية' : 'Basic Free Tier',
      price: '0',
      features: lang === 'ar' 
        ? ['فرع واحد فقط', '2 مستخدم كاشير كحد أقصى', '1,000 فاتورة شهرياً', 'دعم فني عبر البريد'] 
        : ['1 active branch', 'Max 2 POS cashier users', '1,000 invoices/month', 'Email ticket support']
    },
    {
      id: 'pro',
      name: lang === 'ar' ? 'باقة نمو الأعمال' : 'Business Growth Plan',
      price: '1,200',
      features: lang === 'ar' 
        ? ['فروع ومخازن غير محدودة', 'مستخدمين كاشير بلا حدود', 'فواتير وتقارير بلا حدود', 'مركز توقعات الذكاء الاصطناعي', 'دعم فني 24/7'] 
        : ['Unlimited branches & stock', 'Unlimited POS cashiers', 'Unlimited invoices', 'AI analytics forecasting center', 'Premium 24/7 support']
    },
    {
      id: 'enterprise',
      name: lang === 'ar' ? 'باقة الشركات الكبرى' : 'Dubai Enterprise',
      price: '3,500',
      features: lang === 'ar' 
        ? ['ربط الفواتير الحكومية والربط الضريبي', 'خادم مخصص أسرع بنسبة 300%', 'مفتاح API للربط البرمجي', 'مدير حساب مخصص للفروع'] 
        : ['Government tax portal integration', 'Dedicated high-speed servers', 'Custom API access keys', 'Dedicated branch setup manager']
    }
  ];

  const handleUpgrade = (planId: string) => {
    setUpgradingTo(planId);
    setTimeout(() => {
      setActivePlan(planId);
      setUpgradingTo(null);
    }, 1500);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.billing}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'إدارة خطة الاشتراك للشركة وتفاصيل الدفع والترقية' : 'Manage your business subscription plans, bills and merchant tiers'}</p>
      </div>

      {/* Active Plan info banner */}
      <div className="glass-panel p-5 rounded-2xl border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><CreditCard size={20} /></span>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">{t.activePlan}</span>
            <h4 className="text-sm font-bold text-slate-200 capitalize mt-0.5">
              {plans.find(p => p.id === activePlan)?.name}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 font-bold px-3 py-1.5 rounded-xl">
          <ShieldCheck size={14} />
          <span>{lang === 'ar' ? 'تم التحقق من الحساب' : 'Account Verified'}</span>
        </div>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {plans.map((plan) => {
          const isActive = activePlan === plan.id;
          const isUpgrading = upgradingTo === plan.id;
          return (
            <div 
              key={plan.id}
              className={`glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-[460px] border transition ${
                isActive ? 'border-indigo-500 bg-slate-900/50 shadow-indigo-500/5 shadow-2xl' : 'border-white/5'
              }`}
            >
              {plan.id === 'pro' && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white font-extrabold text-[9px] px-3.5 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={8} />
                  <span>Popular</span>
                </div>
              )}

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{plan.name}</span>
                <div className="flex items-baseline mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-200 font-mono">{plan.price}</span>
                  <span className="text-[10px] text-slate-500 ml-1.5 mr-1.5">{t.pricePerMonth}</span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-400">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="p-0.5 bg-emerald-500/15 rounded text-emerald-400 mt-0.5"><Check size={10} /></span>
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6">
                {isActive ? (
                  <button className="w-full py-3 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-default">
                    <Check size={14} className="text-indigo-400" />
                    <span>{lang === 'ar' ? 'الخطة النشطة الحالية' : 'Current Active Plan'}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgradingTo !== null}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    {isUpgrading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <span>{lang === 'ar' ? 'ترقية وتحديث الاشتراك' : 'Upgrade Plan'}</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
