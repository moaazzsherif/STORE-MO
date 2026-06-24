"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { Briefcase, Plus, Search, Mail, Phone, DollarSign, ExternalLink } from 'lucide-react';

interface Supplier {
  id: number;
  name: string;
  nameAr: string;
  contact: string;
  phone: string;
  email: string;
  debt: number;
}

export default function SuppliersPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 1, name: 'Juhayna Dairy Corp', nameAr: 'شركة جهينة للصناعات الغذائية', contact: 'Amr Fahmy', phone: '+20 100 987 6543', email: 'orders@juhayna.com', debt: 12000 },
    { id: 2, name: 'Almarai Group Egypt', nameAr: 'مجموعة المراعي مصر', contact: 'Kareem Saudi', phone: '+20 111 654 3210', email: 'sales.eg@almarai.com', debt: 15400 },
    { id: 3, name: 'Samsung Electronics Distributor', nameAr: 'موزع سامسونج المعتمد مصر', contact: 'Sherif Omar', phone: '+20 122 789 4561', email: 'wholesale@samsung-eg.com', debt: 185000 }
  ]);

  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const newSup: Supplier = {
      id: Date.now(),
      name: newName,
      nameAr: newName,
      contact: newContact || 'Default Agent',
      phone: newPhone,
      email: newEmail || 'info@supplier.com',
      debt: 0
    };

    setSuppliers([newSup, ...suppliers]);
    setNewName('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
    setShowForm(false);
  };

  const totalDebt = suppliers.reduce((sum, s) => sum + s.debt, 0);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nameAr.includes(searchTerm) || 
    s.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.suppliers}</h1>
          <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'سجل الموردين، شركات التوزيع والحسابات الجارية الدائنة' : 'Directory of wholesalers, bulk distributors and account debts'}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={14} />
          <span>{lang === 'ar' ? 'إضافة مورد' : 'Add Supplier'}</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'إجمالي الموردين المسجلين' : 'Wholesale Partners'}</span>
            <h3 className="text-xl font-black mt-1 text-slate-200">{suppliers.length} {lang === 'ar' ? 'شركاء' : 'companies'}</h3>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Briefcase size={18} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'مستحقات للموردين (ديون الشركة)' : 'Outstanding Supplier Debts'}</span>
            <h3 className="text-xl font-black mt-1 text-amber-500">{totalDebt} EGP</h3>
          </div>
          <span className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><DollarSign size={18} /></span>
        </div>
      </div>

      {/* Quick Add Supplier Form */}
      {showForm && (
        <form onSubmit={handleAddSupplier} className="glass-panel p-5 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-4 items-end text-xs animate-fade-in">
          <div className="md:col-span-2">
            <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'اسم الشركة / المورد' : 'Supplier / Company Name'}</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'المندوب المسؤول' : 'Contact Person'}</label>
            <input
              type="text"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-bold mb-1.5">{t.phone}</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none"
            />
          </div>
          <button type="submit" className="w-full glow-btn font-bold py-3 rounded-xl flex items-center justify-center cursor-pointer">
            <span>{lang === 'ar' ? 'حفظ المورد' : 'Save Partner'}</span>
          </button>
        </form>
      )}

      {/* Search supplier */}
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

      {/* Suppliers Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-4">{lang === 'ar' ? 'المورد' : 'Supplier Name'}</th>
                <th className="py-4 px-4">{lang === 'ar' ? 'المندوب' : 'Contact Agent'}</th>
                <th className="py-4 px-4">{t.phone}</th>
                <th className="py-4 px-4">{t.email}</th>
                <th className="py-4 px-4 text-center">{lang === 'ar' ? 'الرصيد المستحق' : 'Debt Balance'}</th>
                <th className="py-4 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition">
                  <td className="py-4.5 px-4 font-semibold text-slate-200">{lang === 'ar' ? s.nameAr : s.name}</td>
                  <td className="py-4.5 px-4 text-slate-400">{s.contact}</td>
                  <td className="py-4.5 px-4 font-mono text-slate-400">{s.phone}</td>
                  <td className="py-4.5 px-4 text-slate-400">{s.email}</td>
                  <td className="py-4.5 px-4 text-center font-bold text-red-400 font-mono">{s.debt} EGP</td>
                  <td className="py-4.5 px-4 text-center">
                    <button className="p-1.5 bg-white/5 hover:bg-indigo-500 hover:text-white rounded-lg text-slate-400 transition">
                      <ExternalLink size={12} />
                    </button>
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
