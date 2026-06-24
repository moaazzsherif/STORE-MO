"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { Globe, Palette, Sparkles, Tag, Plus, CheckCircle2 } from 'lucide-react';

interface Domain {
  id: number;
  domain: string;
  status: 'active' | 'pending';
  type: 'primary' | 'alias';
}

interface Coupon {
  id: number;
  code: string;
  discount: string;
  status: 'active' | 'expired';
  expiry: string;
}

export default function EcommercePage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  // Mock Themes
  const [selectedTheme, setSelectedTheme] = useState('minimalist');
  const themes = [
    { id: 'minimalist', name: 'Minimalist Clean', desc: 'Sleek white-space visual, suited for fashion & boutiques.' },
    { id: 'neon', name: 'Cyber Neon Tech', desc: 'Dark theme with colorful glow highlights, suited for electronics.' },
    { id: 'grocery', name: 'Green Grocery Outlet', desc: 'Vibrant emerald elements, suited for supermarkets & food stores.' }
  ];

  // Mock Domains
  const [domains, setDomains] = useState<Domain[]>([
    { id: 1, domain: 'cairo.storemo.com', status: 'active', type: 'primary' },
    { id: 2, domain: 'www.cairomarket.eg', status: 'pending', type: 'alias' }
  ]);

  // Mock Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: 1, code: 'WELCOME10', discount: '10%', status: 'active', expiry: '2026-12-31' },
    { id: 2, code: 'EID2026', discount: '50 EGP', status: 'active', expiry: '2026-07-15' }
  ]);

  const [newDomain, setNewDomain] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    setDomains([...domains, { id: Date.now(), domain: newDomain, status: 'pending', type: 'alias' }]);
    setNewDomain('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    setCoupons([...coupons, { id: Date.now(), code: newCouponCode.toUpperCase(), discount: newCouponDiscount, status: 'active', expiry: '2026-08-31' }]);
    setNewCouponCode('');
    setNewCouponDiscount('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.ecommerce}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'إعدادات المتجر الإلكتروني، القوالب، النطاقات التنافسية وأكواد الخصم' : 'Configure online storefronts, themes, domains and coupons'}</p>
      </div>

      {showSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 max-w-sm">
          <CheckCircle2 size={14} />
          <span>{t.successMsg}</span>
        </div>
      )}

      {/* Grid: Theme Selection */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Palette size={16} className="text-indigo-400" />
          <span>{lang === 'ar' ? 'تصميم المتجر والقوالب' : 'Online Storefront Themes'}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            return (
              <div 
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between h-36 ${
                  isSelected ? 'bg-indigo-500/10 border-indigo-500/60' : 'bg-slate-950/40 border-white/5'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{theme.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{theme.desc}</p>
                </div>
                {isSelected && (
                  <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded self-start mt-2">Active Theme</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Custom Domains & Coupons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Custom Domains */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Globe size={16} className="text-indigo-400" />
            <span>{lang === 'ar' ? 'النطاقات والروابط الخاصة (DNS)' : 'Custom Domains (DNS)'}</span>
          </h3>

          <form onSubmit={handleAddDomain} className="flex gap-2 text-xs">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="e.g. store.mydomain.com"
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer">
              <Plus size={14} />
              <span>{lang === 'ar' ? 'ربط' : 'Link'}</span>
            </button>
          </form>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-bold">
                  <th className="py-2">{lang === 'ar' ? 'النطاق' : 'Domain'}</th>
                  <th className="py-2 text-center">{lang === 'ar' ? 'النوع' : 'Type'}</th>
                  <th className="py-2 text-right">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {domains.map(d => (
                  <tr key={d.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono text-slate-200">{d.domain}</td>
                    <td className="py-3 text-center capitalize text-slate-400">{d.type}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        d.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coupons codes */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Tag size={16} className="text-indigo-400" />
            <span>{lang === 'ar' ? 'قسائم الخصم الترويجية' : 'Store Discount Coupons'}</span>
          </h3>

          <form onSubmit={handleAddCoupon} className="grid grid-cols-3 gap-2 text-xs">
            <input
              type="text"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
              placeholder="CODE"
              className="px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={newCouponDiscount}
              onChange={(e) => setNewCouponDiscount(e.target.value)}
              placeholder="e.g. 15% or 50 EGP"
              className="px-3 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer">
              <Plus size={14} />
              <span>{lang === 'ar' ? 'إضافة' : 'Add'}</span>
            </button>
          </form>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-bold">
                  <th className="py-2">{lang === 'ar' ? 'كود القسيمة' : 'Coupon Code'}</th>
                  <th className="py-2 text-center">{lang === 'ar' ? 'الخصم' : 'Discount'}</th>
                  <th className="py-2 text-right">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Expiry'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono font-bold text-slate-200">{c.code}</td>
                    <td className="py-3 text-center text-indigo-400 font-bold">{c.discount}</td>
                    <td className="py-3 text-right font-mono text-slate-500">{c.expiry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
