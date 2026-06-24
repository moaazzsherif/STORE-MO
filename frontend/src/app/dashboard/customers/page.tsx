"use client";

import React, { useState } from 'react';
import { useLanguageStore, useAuthStore, translations } from '@/lib/store';
import { Users, Plus, Award, DollarSign, Search, UserCheck } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  points: number;
  balance: number;
  status: 'active' | 'blocked';
}

export default function CustomersPage() {
  const { lang } = useLanguageStore();
  const { user } = useAuthStore();
  const t = translations[lang];

  if (user?.role === 'customer') {
    return (
      <div className="p-6 text-center text-red-400 font-bold">
        {lang === 'ar' ? 'غير مصرح لك بالوصول لهذه الصفحة.' : 'Unauthorized access to this page.'}
      </div>
    );
  }

  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, name: 'Mohamed Aly', nameAr: 'محمد علي', email: 'mohamed@example.com', phone: '+20 100 234 5678', points: 450, balance: 0, status: 'active' },
    { id: 2, name: 'Fatma Hassan', nameAr: 'فاطمة حسن', email: 'fatma@example.com', phone: '+20 111 876 5432', points: 120, balance: 0, status: 'active' },
    { id: 3, name: 'Ahmed Ibrahim', nameAr: 'أحمد إبراهيم', email: 'ahmed.ib@example.com', phone: '+20 122 345 6789', points: 80, balance: 180, status: 'active' },
    { id: 4, name: 'Sarah Mansour', nameAr: 'سارة منصور', email: 'sarah@example.com', phone: '+20 155 765 4321', points: 300, balance: 0, status: 'active' }
  ]);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newCust: Customer = {
      id: Date.now(),
      name: newName,
      nameAr: newName,
      email: newEmail || 'no-email@storemo.com',
      phone: newPhone,
      points: 10, // signup points
      balance: 0,
      status: 'active'
    };

    setCustomers([newCust, ...customers]);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setShowForm(false);
  };

  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const totalReceivables = customers.reduce((sum, c) => sum + c.balance, 0);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.nameAr.includes(searchTerm) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.customers}</h1>
          <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'سجل بيانات العملاء، الحسابات الآجلة ونقاط الولاء' : 'Manage client ledger profiles and loyalty rewards points'}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={14} />
          <span>{lang === 'ar' ? 'إضافة عميل' : 'Add Customer'}</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalCustomers}</span>
            <h3 className="text-xl font-black mt-1 text-slate-200">{customers.length}</h3>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Users size={18} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'إجمالي نقاط الولاء للعملاء' : 'Global Loyalty Points'}</span>
            <h3 className="text-xl font-black mt-1 text-emerald-400">{totalPoints} {lang === 'ar' ? 'نقطة' : 'pts'}</h3>
          </div>
          <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Award size={18} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'مستحقات على العملاء (حساب آجل)' : 'Receivables Ledger'}</span>
            <h3 className="text-xl font-black mt-1 text-amber-500">{totalReceivables} EGP</h3>
          </div>
          <span className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><DollarSign size={18} /></span>
        </div>
      </div>

      {/* Quick Add Form drawer */}
      {showForm && (
        <form onSubmit={handleAddCustomer} className="glass-panel p-5 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs animate-fade-in">
          <div>
            <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'اسم العميل' : 'Customer Name'}</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1.5">{t.email}</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1.5">{t.phone}</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button type="submit" className="w-full glow-btn font-bold py-3 rounded-xl flex items-center justify-center cursor-pointer">
            <span>{lang === 'ar' ? 'تأكيد الحفظ' : 'Save Customer'}</span>
          </button>
        </form>
      )}

      {/* Search customer */}
      <div className="glass-panel p-4 rounded-2xl flex justify-between items-center">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/40 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Customers List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-4">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                <th className="py-4 px-4">{t.email}</th>
                <th className="py-4 px-4">{t.phone}</th>
                <th className="py-4 px-4 text-center">{lang === 'ar' ? 'نقاط الولاء' : 'Loyalty Points'}</th>
                <th className="py-4 px-4 text-center">{lang === 'ar' ? 'الحساب الآجل' : 'Outstanding Balance'}</th>
                <th className="py-4 px-4 text-right">{t.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition">
                  <td className="py-4.5 px-4 font-semibold text-slate-200 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                      {c.name[0]}
                    </div>
                    <span>{lang === 'ar' ? c.nameAr : c.name}</span>
                  </td>
                  <td className="py-4.5 px-4 text-slate-400">{c.email}</td>
                  <td className="py-4.5 px-4 font-mono text-slate-400">{c.phone}</td>
                  <td className="py-4.5 px-4 text-center font-bold text-emerald-400 font-mono">{c.points} pts</td>
                  <td className="py-4.5 px-4 text-center font-bold text-amber-500 font-mono">{c.balance} EGP</td>
                  <td className="py-4.5 px-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
