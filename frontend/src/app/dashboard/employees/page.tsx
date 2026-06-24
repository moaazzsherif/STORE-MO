"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { UserCheck, Plus, CheckCircle2, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  nameAr: string;
  role: string;
  roleAr: string;
  status: 'present' | 'absent' | 'leave';
  attendanceRate: string;
}

interface Shift {
  id: number;
  cashier: string;
  cashierAr: string;
  start: string;
  end: string;
  status: 'active' | 'closed';
  startCash: number;
  endCash: number;
}

export default function EmployeesPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  // Mock staff list
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: 'Hossam Hassan', nameAr: 'حسام حسن', role: 'POS Cashier', roleAr: 'موظف كاشير', status: 'present', attendanceRate: '98%' },
    { id: 2, name: 'Nour El-Din', nameAr: 'نور الدين', role: 'Branch Manager', roleAr: 'مدير فرع', status: 'present', attendanceRate: '95%' },
    { id: 3, name: 'Mona Aly', nameAr: 'منى علي', role: 'Stock Keeper', roleAr: 'أمين مخزن', status: 'leave', attendanceRate: '92%' }
  ]);

  // Shifts list
  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, cashier: 'Hossam Hassan', cashierAr: 'حسام حسن', start: '2026-06-23 08:00', end: '2026-06-23 16:00', status: 'closed', startCash: 1000, endCash: 15400 },
    { id: 2, cashier: 'Nour El-Din', cashierAr: 'نور الدين', start: '2026-06-23 16:00', end: '--:--', status: 'active', startCash: 1000, endCash: 0 }
  ]);

  const [shiftCashier, setShiftCashier] = useState('Hossam Hassan');
  const [startCash, setStartCash] = useState(1000);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (startCash <= 0) return;

    const newShift: Shift = {
      id: Date.now(),
      cashier: shiftCashier,
      cashierAr: shiftCashier === 'Hossam Hassan' ? 'حسام حسن' : shiftCashier === 'Nour El-Din' ? 'نور الدين' : 'منى علي',
      start: new Date().toLocaleString().slice(0, 16),
      end: '--:--',
      status: 'active',
      startCash: startCash,
      endCash: 0
    };

    setShifts([newShift, ...shifts]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.employees}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'سجل الموظفين والورديات الحالية لكاشيرات نقاط البيع' : 'Monitor cashiers daily rosters, shifts and starting drawer balances'}</p>
      </div>

      {/* Grid: Staff + Shifts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left column: Shift Trigger Form */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Clock size={14} className="text-indigo-400" />
              <span>{lang === 'ar' ? 'فتح وردية كاشير جديدة' : 'Open New Cashier Shift'}</span>
            </h3>

            {showSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{t.successMsg}</span>
              </div>
            )}

            <form onSubmit={handleStartShift} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'موظف الكاشير' : 'Cashier'}</label>
                <select 
                  value={shiftCashier}
                  onChange={(e) => setShiftCashier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{lang === 'ar' ? emp.nameAr : emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'العهد النقدية البدء (درج الكاشير)' : 'Starting Cash Drawer'}</label>
                <input
                  type="number"
                  value={startCash || ''}
                  onChange={(e) => setStartCash(Math.max(0, Number(e.target.value)))}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button type="submit" className="w-full glow-btn font-bold py-3 rounded-xl flex items-center justify-center cursor-pointer mt-4">
                <span>{lang === 'ar' ? 'فتح الوردية وتأكيد الدرج' : 'Open Shift & Confirm Drawer'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Middle/Right: Roster & Shifts Log */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active Shifts Table */}
          <div className="glass-panel p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Clock size={14} className="text-indigo-400" />
              <span>{lang === 'ar' ? 'سجل ورديات الكاشير' : 'POS Cashier Shifts Log'}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold">
                    <th className="py-2">{lang === 'ar' ? 'الموظف' : 'Cashier'}</th>
                    <th className="py-2">{lang === 'ar' ? 'بداية الوردية' : 'Start Time'}</th>
                    <th className="py-2">{lang === 'ar' ? 'نهاية الوردية' : 'End Time'}</th>
                    <th className="py-2 text-center">{lang === 'ar' ? 'بداية الصندوق' : 'Start Cash'}</th>
                    <th className="py-2 text-center">{lang === 'ar' ? 'نهاية الصندوق' : 'End Cash'}</th>
                    <th className="py-2 text-right">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {shifts.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition">
                      <td className="py-3 font-semibold text-slate-200">{lang === 'ar' ? s.cashierAr : s.cashier}</td>
                      <td className="py-3 font-mono text-slate-400">{s.start}</td>
                      <td className="py-3 font-mono text-slate-400">{s.end}</td>
                      <td className="py-3 text-center font-mono text-slate-300">{s.startCash} EGP</td>
                      <td className="py-3 text-center font-mono text-indigo-400 font-bold">{s.status === 'active' ? '--' : `${s.endCash} EGP`}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          s.status === 'active' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-950 border border-white/5 text-slate-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Employees List */}
          <div className="glass-panel p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <UserCheck size={14} className="text-indigo-400" />
              <span>{lang === 'ar' ? 'قائمة موظفي الفروع والنشاط' : 'Active Employees Roster'}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold">
                    <th className="py-2">{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                    <th className="py-2">{lang === 'ar' ? 'الدور الوظيفي' : 'Role'}</th>
                    <th className="py-2 text-center">{lang === 'ar' ? 'نسبة الحضور' : 'Attendance'}</th>
                    <th className="py-2 text-right">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-white/5 transition">
                      <td className="py-3 font-semibold text-slate-200">{lang === 'ar' ? emp.nameAr : emp.name}</td>
                      <td className="py-3 text-slate-400">{lang === 'ar' ? emp.roleAr : emp.role}</td>
                      <td className="py-3 text-center font-mono font-bold text-slate-300">{emp.attendanceRate}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          emp.status === 'present' ? 'bg-emerald-500/10 text-emerald-400' :
                          emp.status === 'leave' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
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
