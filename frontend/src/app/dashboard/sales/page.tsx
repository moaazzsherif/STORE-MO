"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { ShoppingCart, DollarSign, Clock, ArrowUpRight, Search, FileText } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNo: string;
  date: string;
  customer: string;
  customerAr: string;
  amount: number;
  method: 'cash' | 'card';
  status: 'paid' | 'unpaid' | 'refunded';
}

export default function SalesPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  const [invoices] = useState<Invoice[]>([
    { id: 1, invoiceNo: 'INV-765091', date: '2026-06-23 15:10', customer: 'Mohamed Aly', customerAr: 'محمد علي', amount: 18600, method: 'card', status: 'paid' },
    { id: 2, invoiceNo: 'INV-765090', date: '2026-06-23 12:40', customer: 'Fatma Hassan', customerAr: 'فاطمة حسن', amount: 38, method: 'cash', status: 'paid' },
    { id: 3, invoiceNo: 'INV-765089', date: '2026-06-22 19:15', customer: 'Walk-In Customer', customerAr: 'عميل نقدي مباشر', amount: 9500, method: 'card', status: 'paid' },
    { id: 4, invoiceNo: 'INV-765088', date: '2026-06-22 10:30', customer: 'Ahmed Ibrahim', customerAr: 'أحمد إبراهيم', amount: 180, method: 'cash', status: 'unpaid' },
    { id: 5, invoiceNo: 'INV-765087', date: '2026-06-21 16:45', customer: 'Sarah Mansour', customerAr: 'سارة منصور', amount: 12, method: 'cash', status: 'refunded' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  // Calculations
  const totalSales = invoices.reduce((sum, inv) => inv.status === 'paid' ? sum + inv.amount : sum, 0);
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;
  const unpaidSales = invoices.reduce((sum, inv) => inv.status === 'unpaid' ? sum + inv.amount : sum, 0);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNo.includes(searchTerm) || 
    inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.customerAr.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.sales}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'سجل عمليات البيع، الفواتير ودفاتر التحصيل' : 'Monitor sales invoices, transactions, and payment methods'}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalSales}</span>
            <h3 className="text-xl font-black mt-1 text-slate-200">{totalSales} EGP</h3>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><DollarSign size={18} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalOrders}</span>
            <h3 className="text-xl font-black mt-1 text-emerald-400">{paidCount} {lang === 'ar' ? 'مكتملة' : 'completed'}</h3>
          </div>
          <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><ShoppingCart size={18} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'مبالغ غير محصلة' : 'Unpaid Receivables'}</span>
            <h3 className="text-xl font-black mt-1 text-amber-500">{unpaidSales} EGP</h3>
          </div>
          <span className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Clock size={18} /></span>
        </div>
      </div>

      {/* Invoice search & Filters */}
      <div className="glass-panel p-4 rounded-2xl flex justify-between items-center">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.invoiceNumber}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/40 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Invoices List */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-4">{t.invoiceNumber}</th>
                <th className="py-4 px-4">{lang === 'ar' ? 'العميل' : 'Customer'}</th>
                <th className="py-4 px-4 text-center">{t.paymentMethod}</th>
                <th className="py-4 px-4 text-center">{t.totalAmount}</th>
                <th className="py-4 px-4 text-center">{t.status}</th>
                <th className="py-4 px-4 text-right">{lang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition">
                  <td className="py-4 px-4 font-mono font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText size={12} className="text-slate-400" />
                    <span>{inv.invoiceNo}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-200">{lang === 'ar' ? inv.customerAr : inv.customer}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-0.5 bg-slate-950 border border-white/5 text-[9px] font-bold rounded capitalize">
                      {inv.method}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-indigo-400 font-mono">{inv.amount} EGP</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                      inv.status === 'unpaid' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {inv.status === 'paid' ? (lang === 'ar' ? 'مدفوع' : 'Paid') :
                       inv.status === 'unpaid' ? (lang === 'ar' ? 'آجل' : 'Unpaid') : (lang === 'ar' ? 'مرتجع' : 'Refunded')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-500 text-[10px]">{inv.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
