"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { BarChart3, Download, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

interface ReportFile {
  id: number;
  name: string;
  nameAr: string;
  type: string;
  size: string;
  date: string;
}

export default function ReportsPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('this_month');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock generated reports
  const [generatedFiles, setGeneratedFiles] = useState<ReportFile[]>([
    { id: 1, name: 'Sales_Report_June_2026.pdf', nameAr: 'تقرير_المبيعات_يونيو_2026.pdf', type: 'PDF Document', size: '1.2 MB', date: '2026-06-23' },
    { id: 2, name: 'Inventory_Audit_NasrCity_NC01.xlsx', nameAr: 'تدقيق_المخزون_مدينة_نصر_NC01.xlsx', type: 'Excel Spreadsheet', size: '3.4 MB', date: '2026-06-22' },
    { id: 3, name: 'Shift_Summary_HossamHassan.pdf', nameAr: 'ملخص_وردية_حسام_حسن.pdf', type: 'PDF Document', size: '420 KB', date: '2026-06-23' }
  ]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setExporting(true);

    setTimeout(() => {
      setExporting(false);
      setSuccess(true);
      
      const newFile: ReportFile = {
        id: Date.now(),
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Report_${dateRange}.${exportFormat}`,
        nameAr: `تقرير_${reportType === 'sales' ? 'المبيعات' : reportType === 'inventory' ? 'المخزون' : 'الورديات'}_${dateRange}.${exportFormat}`,
        type: exportFormat.toUpperCase() + (exportFormat === 'pdf' ? ' Document' : ' Spreadsheet'),
        size: '850 KB',
        date: new Date().toISOString().slice(0, 10)
      };

      setGeneratedFiles([newFile, ...generatedFiles]);

      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.reports}</h1>
        <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'تصدير التقارير المالية والتحليلات بصيغ PDF أو Excel' : 'Generate and download financial, sales, and audit spreadsheet reports'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Report Selector panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden h-[420px]">
          <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
          
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <BarChart3 size={14} className="text-indigo-400" />
              <span>{lang === 'ar' ? 'تخصيص تقرير جديد' : 'Customize Report Generator'}</span>
            </h3>

            {success && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{lang === 'ar' ? 'تم إنشاء التقرير وحفظه أدناه!' : 'Report compiled and saved to list below!'}</span>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'نوع التقرير' : 'Report Module'}</label>
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="sales">{lang === 'ar' ? 'تقرير المبيعات والضرائب' : 'Sales & Tax Ledger'}</option>
                  <option value="inventory">{lang === 'ar' ? 'جرد المخزون والتعديلات' : 'Inventory & Movements'}</option>
                  <option value="shifts">{lang === 'ar' ? 'حركات الصندوق والورديات' : 'Cashier Shift Audit Logs'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'الفترة الزمنية' : 'Date Range'}</label>
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="today">{lang === 'ar' ? 'اليوم' : 'Today'}</option>
                  <option value="this_week">{lang === 'ar' ? 'هذا الأسبوع' : 'This Week'}</option>
                  <option value="this_month">{lang === 'ar' ? 'هذا الشهر' : 'This Month'}</option>
                  <option value="last_quarter">{lang === 'ar' ? 'الربع السنوي الأخير' : 'Last Quarter'}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">{lang === 'ar' ? 'صيغة الملف' : 'Export Format'}</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-white/5">
                  {['pdf', 'xlsx', 'csv'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setExportFormat(fmt)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase ${
                        exportFormat === fmt ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={exporting}
                className="w-full glow-btn font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {exporting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Download size={14} />
                    <span>{lang === 'ar' ? 'إصدار وتجميع التقرير' : 'Compile & Export'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Generated Reports list */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between h-[420px] overflow-hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <FileText size={14} className="text-indigo-400" />
              <span>{lang === 'ar' ? 'أحدث التقارير المصدرة' : 'Exported Reports Archive'}</span>
            </h3>

            <div className="overflow-y-auto max-h-[300px] space-y-3 pr-1">
              {generatedFiles.map((file) => (
                <div key={file.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition">
                  <div className="overflow-hidden flex-1 mr-2">
                    <p className="text-xs font-bold text-slate-200 truncate">{lang === 'ar' ? file.nameAr : file.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{file.type} • {file.size}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-mono">{file.date}</span>
                    <button className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition cursor-pointer">
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
