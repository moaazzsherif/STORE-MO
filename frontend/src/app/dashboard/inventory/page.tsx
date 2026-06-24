"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { Warehouse, Plus, ArrowDown, ArrowUp, RefreshCw, BarChart2, CheckCircle2 } from 'lucide-react';

interface Movement {
  id: number;
  product: string;
  productAr: string;
  warehouse: string;
  warehouseAr: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  reasonAr: string;
  date: string;
}

export default function InventoryPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  // Warehouses Mock Data
  const [warehouses, setWarehouses] = useState([
    { id: 1, name: 'Nasr City Central', nameAr: 'مستودع مدينة نصر الرئيسي', code: 'WH-NC-01', capacity: 75, itemsCount: 420 },
    { id: 2, name: 'Maadi Distribution', nameAr: 'فرع مستودع المعادي', code: 'WH-MD-02', capacity: 45, itemsCount: 180 },
    { id: 3, name: 'Giza Outlet WH', nameAr: 'مخزن منفذ الجيزة', code: 'WH-GZ-03', capacity: 90, itemsCount: 680 }
  ]);

  // Stock movements log
  const [movements, setMovements] = useState<Movement[]>([
    { id: 1, product: 'Samsung Smart TV 55"', productAr: 'تلفزيون سامسونج ذكي 55"', warehouse: 'Nasr City Central', warehouseAr: 'مستودع مدينة نصر الرئيسي', type: 'in', quantity: 20, reason: 'Purchase from Supplier', reasonAr: 'شراء من المورد', date: '2026-06-23 11:20' },
    { id: 2, product: 'AirPods Pro 2', productAr: 'سماعات ايربودز برو 2', warehouse: 'Maadi Distribution', warehouseAr: 'فرع مستودع المعادي', type: 'out', quantity: 5, reason: 'Transfer to POS Shelf', reasonAr: 'نقل إلى رف الكاشير', date: '2026-06-23 09:15' },
    { id: 3, product: 'Almarai Fresh Milk 1L', productAr: 'حليب المراعي طازج 1 لتر', warehouse: 'Giza Outlet WH', warehouseAr: 'مخزن منفذ الجيزة', type: 'in', quantity: 100, reason: 'Daily Supplier Delivery', reasonAr: 'شحنة موردين يومية', date: '2026-06-22 17:40' }
  ]);

  // Adjustment Form State
  const [selectedProduct, setSelectedProduct] = useState('Samsung Smart TV 55"');
  const [selectedWarehouse, setSelectedWarehouse] = useState('Nasr City Central');
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('Correction');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) return;

    const selectedWh = warehouses.find(w => w.name === selectedWarehouse);
    if (!selectedWh) return;

    const newMovement: Movement = {
      id: Date.now(),
      product: selectedProduct,
      productAr: selectedProduct === 'Samsung Smart TV 55"' ? 'تلفزيون سامسونج ذكي 55"' : 'سماعات ايربودز برو 2',
      warehouse: selectedWarehouse,
      warehouseAr: selectedWh.nameAr,
      type: adjustType,
      quantity: qty,
      reason: reason,
      reasonAr: reason === 'Correction' ? 'تعديل جرد يدوي' : 'تالف / كسر',
      date: new Date().toLocaleString().slice(0, 16)
    };

    setMovements([newMovement, ...movements]);

    // Update warehouse items counts / capacity simulation
    setWarehouses(warehouses.map(w => {
      if (w.name === selectedWarehouse) {
        const change = adjustType === 'in' ? qty : -qty;
        const newCount = Math.max(0, w.itemsCount + change);
        const newCapacity = Math.min(100, Math.round((newCount / 800) * 100)); // base max capacity 800
        return { ...w, itemsCount: newCount, capacity: newCapacity };
      }
      return w;
    }));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setQty(1);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.inventory}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'إدارة المستودعات، الجرد والتعديلات الفورية للمخزون' : 'Control multi-branch warehouses, transfers and adjustments'}</p>
      </div>

      {/* Grid: Warehouses capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {warehouses.map((wh) => (
          <div key={wh.id} className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-extrabold text-slate-200">{lang === 'ar' ? wh.nameAr : wh.name}</h4>
                <span className="text-[10px] text-slate-400 font-mono block mt-1">{wh.code}</span>
              </div>
              <span className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><Warehouse size={16} /></span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                <span>{t.capacity}</span>
                <span className="font-mono text-slate-200">{wh.capacity}% ({wh.itemsCount} / 800)</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    wh.capacity > 85 ? 'bg-red-500' : wh.capacity > 60 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${wh.capacity}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main panels: Form + Log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Adjustment Form panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <RefreshCw size={14} className="text-indigo-400" />
              <span>{t.stockAdjust}</span>
            </h3>

            {showSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{t.successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{t.productName}</label>
                <select 
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value='Samsung Smart TV 55"'>Samsung Smart TV 55"</option>
                  <option value="AirPods Pro 2">AirPods Pro 2</option>
                  <option value="Almarai Fresh Milk 1L">Almarai Fresh Milk 1L</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{t.warehouses}</label>
                <select 
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.name}>{lang === 'ar' ? w.nameAr : w.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'نوع الحركة' : 'Movement Type'}</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setAdjustType('in')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        adjustType === 'in' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {lang === 'ar' ? 'إدخال (+)' : 'Add (+)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('out')}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        adjustType === 'out' ? 'bg-red-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {lang === 'ar' ? 'إخراج (-)' : 'Remove (-)'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">{t.quantity}</label>
                  <input
                    type="number"
                    value={qty || ''}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{t.reason}</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Correction">{lang === 'ar' ? 'تعديل جرد يدوي' : 'Manual Inventory Correction'}</option>
                  <option value="Damaged">{lang === 'ar' ? 'تالف / كسر' : 'Damaged / Broken goods'}</option>
                  <option value="Theft">{lang === 'ar' ? 'عجز / مفقود' : 'Stock Shortage'}</option>
                </select>
              </div>

              <button type="submit" className="w-full glow-btn font-bold py-3 rounded-xl flex items-center justify-center cursor-pointer mt-4">
                {t.adjustBtn}
              </button>
            </form>
          </div>
        </div>

        {/* Stock Movements Log panel */}
        <div className="glass-panel p-6 rounded-2xl xl:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <BarChart2 size={14} className="text-indigo-400" />
              <span>{lang === 'ar' ? 'سجل حركات المخزن الأخيرة' : 'Recent Inventory Movements Ledger'}</span>
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold">
                    <th className="py-3 px-2">{t.productName}</th>
                    <th className="py-3 px-2">{t.warehouses}</th>
                    <th className="py-3 px-2 text-center">{t.quantity}</th>
                    <th className="py-3 px-2">{t.reason}</th>
                    <th className="py-3 px-2 text-right">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-2 font-semibold text-slate-200">{lang === 'ar' ? m.productAr : m.product}</td>
                      <td className="py-4 px-2 text-slate-400">{lang === 'ar' ? m.warehouseAr : m.warehouse}</td>
                      <td className="py-4 px-2 text-center font-bold font-mono">
                        <span className={`px-2 py-0.5 rounded-lg flex items-center justify-center gap-0.5 w-16 mx-auto ${
                          m.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {m.type === 'in' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                          {m.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-slate-400">{lang === 'ar' ? m.reasonAr : m.reason}</td>
                      <td className="py-4 px-2 text-right font-mono text-slate-500 text-[10px]">{m.date}</td>
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
