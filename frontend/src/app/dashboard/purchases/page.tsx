"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { Truck, Plus, CheckCircle2, Clock, DollarSign, Search } from 'lucide-react';

interface PurchaseOrder {
  id: number;
  orderNo: string;
  supplier: string;
  supplierAr: string;
  cost: number;
  itemsCount: number;
  status: 'ordered' | 'received' | 'pending';
  date: string;
}

export default function PurchasesPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  const [orders, setOrders] = useState<PurchaseOrder[]>([
    { id: 1, orderNo: 'PO-998', supplier: 'Juhayna Dairy Corp', supplierAr: 'شركة جهينة للصناعات الغذائية', cost: 12000, itemsCount: 400, status: 'received', date: '2026-06-20' },
    { id: 2, orderNo: 'PO-999', supplier: 'Samsung Electronics Egypt', supplierAr: 'سامسونج للإلكترونيات مصر', cost: 185000, itemsCount: 15, status: 'ordered', date: '2026-06-22' },
    { id: 3, orderNo: 'PO-1000', supplier: 'Almarai Group', supplierAr: 'مجموعة المراعي', cost: 15400, itemsCount: 500, status: 'pending', date: '2026-06-23' }
  ]);

  const [selectedSupplier, setSelectedSupplier] = useState('Juhayna Dairy Corp');
  const [costInput, setCostInput] = useState(1000);
  const [itemsCountInput, setItemsCountInput] = useState(10);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (costInput <= 0 || itemsCountInput <= 0) return;

    const newOrder: PurchaseOrder = {
      id: Date.now(),
      orderNo: `PO-${orders.length + 998}`,
      supplier: selectedSupplier,
      supplierAr: selectedSupplier === 'Juhayna Dairy Corp' ? 'شركة جهينة للصناعات الغذائية' : selectedSupplier === 'Almarai Group' ? 'مجموعة المراعي' : 'سامسونج للإلكترونيات مصر',
      cost: costInput,
      itemsCount: itemsCountInput,
      status: 'pending',
      date: new Date().toISOString().slice(0, 10)
    };

    setOrders([newOrder, ...orders]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setCostInput(1000);
    setItemsCountInput(10);
  };

  const totalCost = orders.reduce((sum, order) => sum + order.cost, 0);
  const pendingCount = orders.filter(order => order.status === 'pending' || order.status === 'ordered').length;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.purchases}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'أوامر الشراء للموردين واستلام شحنات المخازن' : 'Manage supply orders, suppliers costs and delivery states'}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'إجمالي تكلفة المشتريات' : 'Total Purchases COGS'}</span>
            <h3 className="text-xl font-black mt-1 text-slate-200">{totalCost} EGP</h3>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><DollarSign size={18} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'شحنات قيد الانتظار' : 'Pending Deliveries'}</span>
            <h3 className="text-xl font-black mt-1 text-amber-500">{pendingCount} {lang === 'ar' ? 'شحنات' : 'orders'}</h3>
          </div>
          <span className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Truck size={18} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'الموردين النشطين' : 'Active Wholesalers'}</span>
            <h3 className="text-xl font-black mt-1 text-emerald-400">3 {lang === 'ar' ? 'شركات' : 'corporations'}</h3>
          </div>
          <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><CheckCircle2 size={18} /></span>
        </div>
      </div>

      {/* Create PO & PO History grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Creator Form */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Plus size={14} className="text-indigo-400" />
              <span>{lang === 'ar' ? 'إنشاء أمر شراء جديد' : 'New Purchase Order'}</span>
            </h3>

            {showSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{t.successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{t.suppliers}</label>
                <select 
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Juhayna Dairy Corp">Juhayna Dairy Corp</option>
                  <option value="Almarai Group">Almarai Group</option>
                  <option value="Samsung Electronics Egypt">Samsung Electronics Egypt</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'الكمية المطلوبة' : 'Quantity'}</label>
                  <input
                    type="number"
                    value={itemsCountInput || ''}
                    onChange={(e) => setItemsCountInput(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'التكلفة الإجمالية' : 'Total Cost'}</label>
                  <input
                    type="number"
                    value={costInput || ''}
                    onChange={(e) => setCostInput(Math.max(10, Number(e.target.value)))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <button type="submit" className="w-full glow-btn font-bold py-3 rounded-xl flex items-center justify-center cursor-pointer mt-4">
                <span>{lang === 'ar' ? 'تأكيد وإرسال الأمر' : 'Confirm & Issue PO'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* PO Table */}
        <div className="glass-panel p-6 rounded-2xl xl:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Truck size={14} className="text-indigo-400" />
              <span>{lang === 'ar' ? 'سجل أوامر الشراء الصادرة' : 'Purchase Orders Ledger'}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold">
                    <th className="py-3 px-2">{lang === 'ar' ? 'رقم الأمر' : 'PO Number'}</th>
                    <th className="py-3 px-2">{t.suppliers}</th>
                    <th className="py-3 px-2 text-center">{lang === 'ar' ? 'عدد القطع' : 'Qty'}</th>
                    <th className="py-3 px-2 text-center">{lang === 'ar' ? 'التكلفة' : 'Cost'}</th>
                    <th className="py-3 px-2 text-center">{t.status}</th>
                    <th className="py-3 px-2 text-right">{lang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-2 font-mono font-bold text-slate-200">{order.orderNo}</td>
                      <td className="py-4 px-2 text-slate-400">{lang === 'ar' ? order.supplierAr : order.supplier}</td>
                      <td className="py-4 px-2 text-center font-bold font-mono">{order.itemsCount}</td>
                      <td className="py-4 px-2 text-center font-bold text-indigo-400 font-mono">{order.cost} EGP</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          order.status === 'received' ? 'bg-emerald-500/10 text-emerald-400' :
                          order.status === 'ordered' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {order.status === 'received' ? (lang === 'ar' ? 'مستلمة' : 'Received') :
                           order.status === 'ordered' ? (lang === 'ar' ? 'مشحونة' : 'Shipped') : (lang === 'ar' ? 'معلق' : 'Pending')}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-mono text-slate-500 text-[10px]">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
