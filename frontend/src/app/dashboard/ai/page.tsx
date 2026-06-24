"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { Sparkles, Bot, LineChart as ChartIcon, AlertCircle, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AICenterPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  // AI sales prediction chart data
  const data = [
    { name: 'Mon', actual: 12000, forecast: 11500 },
    { name: 'Tue', actual: 19000, forecast: 18000 },
    { name: 'Wed', actual: 15000, forecast: 16200 },
    { name: 'Thu', actual: 22000, forecast: 21000 },
    { name: 'Fri', actual: 26000, forecast: 25000 },
    { name: 'Sat', actual: 0, forecast: 32000 },
    { name: 'Sun', actual: 0, forecast: 28000 }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.aiCenter}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'تحليلات ونماذج توقعات المبيعات وإعادة طلب المخزون بالذكاء الاصطناعي' : 'Advanced sales forecasting and stock recommendation models'}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'توقعات مبيعات 7 أيام القادمة' : 'Predicted 7-Day Revenue'}</span>
            <h3 className="text-xl font-black mt-1 text-indigo-400">210,000 EGP</h3>
          </div>
          <span className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><TrendingUp size={16} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'مؤشر كفاءة التشغيل' : 'Turnover Index'}</span>
            <h3 className="text-xl font-black mt-1 text-emerald-400">8.4x</h3>
          </div>
          <span className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400"><Sparkles size={16} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'معدل ثقة النموذج' : 'Model Confidence Score'}</span>
            <h3 className="text-xl font-black mt-1 text-slate-200">96.8%</h3>
          </div>
          <span className="p-2.5 bg-white/5 rounded-xl text-slate-300"><Info size={16} /></span>
        </div>
      </div>

      {/* AI forecast area chart */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <ChartIcon size={14} className="text-indigo-400" />
            <span>{lang === 'ar' ? 'منحنى مبيعات الأسبوع الفعلي مقابل المتوقع بالذكاء الاصطناعي' : 'Actual vs. AI Forecasted Weekly Revenue'}</span>
          </h3>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold">Model V2.1</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                labelClassName="text-slate-400 font-bold"
              />
              <Area type="monotone" dataKey="actual" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
              <Area type="monotone" dataKey="forecast" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Stock recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recommendation Panel */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4">
            <Bot className="text-indigo-400" size={16} />
            <h3 className="text-sm font-bold text-slate-200">{lang === 'ar' ? 'توصيات الشراء الذكية' : 'AI Stock Purchase Orders'}</h3>
          </div>

          <div className="space-y-3.5 text-xs text-slate-400">
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition">
              <p className="font-bold text-indigo-400">{lang === 'ar' ? 'سماعات AirPods Pro 2' : 'AirPods Pro 2'}</p>
              <p className="mt-1 leading-relaxed">{lang === 'ar' ? 'مخزون حرج (8 قطع متبقية). ننصح بطلب 20 قطعة لتفادي نفاذ الكمية بناء على سرعة المبيعات.' : 'Critical level (8 left). Recommend purchasing 20 units to secure next 30 days.'}</p>
            </div>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition">
              <p className="font-bold text-emerald-400">{lang === 'ar' ? 'حليب المراعي 1 لتر' : 'Almarai Fresh Milk 1L'}</p>
              <p className="mt-1 leading-relaxed">{lang === 'ar' ? 'سرعة تصريف مرتفعة بنسبة 20%. ننصح بزيادة الطلبية اليومية إلى 150 علبة.' : 'Velocity increased by 20%. Increase daily order size to 150 units.'}</p>
            </div>
          </div>
        </div>

        {/* AI Insight note */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            <span>{lang === 'ar' ? 'ملاحظات وتوقعات الطقس والمناسبات' : 'Model Event Correlation'}</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'ar' 
              ? 'يربط النظام تلقائياً بيانات الطقس المحلية والتقويم العام. درجات الحرارة المتوقعة 38 درجة الأسبوع القادم ستزيد مبيعات المشروبات بنسبة 18%.' 
              : 'Our system correlates local weather reports. Expected temperature spikes (+3°C) next week will correlate to +18% beverage product sales.'}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            {lang === 'ar'
              ? 'موسم العطلات يبدأ في غضون 10 أيام. ننصح بتعجيل أوامر الشراء لمنتجات البقالة الكبرى.'
              : 'Holiday season starts in 10 days. Pre-ordering of grocery essentials is advised to prevent wholesale price surges.'}
          </p>
        </div>

      </div>
    </div>
  );
}
