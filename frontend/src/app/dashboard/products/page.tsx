"use client";

import React, { useState } from 'react';
import { useLanguageStore, useAuthStore, translations } from '@/lib/store';
import { Plus, Search, Edit, Trash2, Check, X, ShieldAlert, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  nameAr: string;
  sku: string;
  price: number;
  stock: number;
  status: 'active' | 'out_of_stock' | 'low_stock';
  category: string;
  image?: string;
}

export default function ProductsPage() {
  const { lang } = useLanguageStore();
  const { user } = useAuthStore();
  const t = translations[lang];

  const initialProducts: Product[] = [
    { id: 1, name: 'Samsung Smart TV 55"', nameAr: 'تلفزيون سامسونج ذكي 55"', sku: 'SMG-TV55', price: 18500, stock: 12, status: 'active', category: 'Electronics', image: '📺' },
    { id: 2, name: 'AirPods Pro 2', nameAr: 'سماعات ايربودز برو 2', sku: 'APP-PRO2', price: 9500, stock: 8, status: 'low_stock', category: 'Electronics', image: '🎧' },
    { id: 3, name: 'Almarai Fresh Milk 1L', nameAr: 'حليب المراعي طازج 1 لتر', sku: 'ALM-MILK1', price: 38, stock: 150, status: 'active', category: 'Grocery', image: '🥛' },
    { id: 4, name: 'Coca Cola 330ml Can', nameAr: 'كانز كوكا كولا 330 مل', sku: 'COCA-330', price: 12, stock: 500, status: 'active', category: 'Beverages', image: '🥤' },
    { id: 5, name: 'Premium Coffee Beans 250g', nameAr: 'بن قهوة فاخر 250 جرام', sku: 'COF-PREM250', price: 180, stock: 0, status: 'out_of_stock', category: 'Grocery', image: '☕' },
    { id: 6, name: 'Cairo Blend Tea 100 Pack', nameAr: 'شاي توليفة القاهرة 100 فتلة', sku: 'TEA-CAI100', price: 65, stock: 80, status: 'active', category: 'Beverages', image: '🫖' }
  ];

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // New Product Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newPrice, setNewPrice] = useState(0);
  const [newStock, setNewStock] = useState(0);
  const [newCategory, setNewCategory] = useState('Grocery');

  // Customer purchase state
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState('');

  // KPI Calculations
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active' || p.status === 'low_stock').length;
  const lowStockProducts = products.filter(p => p.status === 'low_stock' || (p.stock > 0 && p.stock <= 10)).length;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSku || newPrice <= 0) return;

    let status: 'active' | 'out_of_stock' | 'low_stock' = 'active';
    if (newStock === 0) status = 'out_of_stock';
    else if (newStock <= 10) status = 'low_stock';

    const newProd: Product = {
      id: Date.now(),
      name: newName,
      nameAr: newName,
      sku: newSku,
      price: newPrice,
      stock: newStock,
      status,
      category: newCategory,
      image: '📦'
    };

    setProducts([newProd, ...products]);
    setNewName('');
    setNewSku('');
    setNewPrice(0);
    setNewStock(0);
    setDrawerOpen(false);
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleCustomerBuy = (prod: Product) => {
    setPurchasedItem(lang === 'ar' ? prod.nameAr : prod.name);
    setPurchaseSuccess(true);
    
    // deduct stock
    setProducts(products.map(p => p.id === prod.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p));
    
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 2000);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.nameAr.includes(searchTerm) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // ==================== CUSTOMER E-COMMERCE VIEW ====================
  if (user?.role === 'customer') {
    return (
      <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              {lang === 'ar' ? 'المتجر الإلكتروني' : 'Online Storefront'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar' ? 'تصفح بضائع المتجر واشتري احتياجاتك مباشرة' : 'Browse products, place orders and earn loyalty points'}
            </p>
          </div>
        </div>

        {purchaseSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 max-w-sm animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{lang === 'ar' ? `تم شراء ${purchasedItem} بنجاح!` : `Purchased ${purchasedItem} successfully!`}</span>
          </div>
        )}

        {/* Search */}
        <div className="glass-panel p-4 rounded-2xl flex justify-between items-center">
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchProduct}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/40 border border-white/5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Customer Catalog Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock === 0;
            return (
              <div 
                key={p.id} 
                className={`glass-panel p-4 rounded-2xl flex flex-col justify-between h-48 border hover:border-indigo-500/40 hover:shadow-lg transition duration-200 ${
                  isOutOfStock ? 'opacity-55' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-2xl">{p.image || '📦'}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    isOutOfStock ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {isOutOfStock ? (lang === 'ar' ? 'نفذ' : 'Out') : (lang === 'ar' ? 'متوفر' : 'In Stock')}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="text-[9px] text-slate-400 uppercase font-mono">{p.sku}</span>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mt-0.5">{lang === 'ar' ? p.nameAr : p.name}</h4>
                  <p className="text-xs font-black text-indigo-400 mt-1 font-mono">{p.price} EGP</p>
                </div>
                <button
                  onClick={() => !isOutOfStock && handleCustomerBuy(p)}
                  disabled={isOutOfStock}
                  className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-900 disabled:text-slate-500 text-white font-bold rounded-xl text-[10px] transition cursor-pointer"
                >
                  {isOutOfStock ? (lang === 'ar' ? 'غير متوفر' : 'Out of Stock') : (lang === 'ar' ? 'شراء الآن' : 'Buy Now')}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  // ==================== MERCHANT CATALOG VIEW ====================
  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in-up">
      
      {/* Title Header & Action Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">{t.products}</h1>
          <p className="text-xs text-slate-400 mt-1">{lang === 'ar' ? 'أضف وعدل أصناف المنتجات للشركة' : 'Manage and configure your global product catalog'}</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={14} />
          <span>{lang === 'ar' ? 'إضافة منتج' : 'Add Product'}</span>
        </button>
      </div>

      {/* Product KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.totalProducts}</span>
            <h3 className="text-xl font-black mt-1 text-slate-200">{totalProducts}</h3>
          </div>
          <span className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 font-bold text-xs">SKUs</span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{lang === 'ar' ? 'الأصناف النشطة' : 'Active Items'}</span>
            <h3 className="text-xl font-black mt-1 text-emerald-400">{activeProducts}</h3>
          </div>
          <span className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><Check size={18} /></span>
        </div>
        <div className="glass-panel p-5 rounded-2xl flex justify-between items-center h-24">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.lowStockAlerts}</span>
            <h3 className="text-xl font-black mt-1 text-amber-500">{lowStockProducts}</h3>
          </div>
          <span className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><ShieldAlert size={18} /></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center">
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

        <div className="flex gap-1.5 bg-slate-950/40 border border-white/5 rounded-xl p-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'active', 'low_stock', 'out_of_stock'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                filterStatus === status ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-4 px-4">{t.productName}</th>
                <th className="py-4 px-4">{t.sku}</th>
                <th className="py-4 px-4">{lang === 'ar' ? 'القسم' : 'Category'}</th>
                <th className="py-4 px-4 text-center">{t.price}</th>
                <th className="py-4 px-4 text-center">{t.stock}</th>
                <th className="py-4 px-4 text-center">{t.status}</th>
                <th className="py-4 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">{t.noData}</td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition">
                    <td className="py-4.5 px-4 font-semibold text-slate-200">
                      {lang === 'ar' ? p.nameAr : p.name}
                    </td>
                    <td className="py-4.5 px-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-4.5 px-4 text-slate-400">{p.category}</td>
                    <td className="py-4.5 px-4 text-center font-bold text-indigo-400 font-mono">{p.price} EGP</td>
                    <td className="py-4.5 px-4 text-center font-bold font-mono">{p.stock}</td>
                    <td className="py-4.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                        p.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        p.status === 'low_stock' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {p.status === 'active' ? (lang === 'ar' ? 'متوفر' : 'In Stock') :
                         p.status === 'low_stock' ? (lang === 'ar' ? 'منخفض' : 'Low Stock') : (lang === 'ar' ? 'غير متوفر' : 'Out of Stock')}
                      </span>
                    </td>
                    <td className="py-4.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT DRAWER MODAL */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-slate-950 border-l border-white/10 h-full p-6 flex flex-col gap-6 relative animate-slide-left">
            <button onClick={() => setDrawerOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>

            <div>
              <h3 className="text-base font-black text-slate-200 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <span>{lang === 'ar' ? 'إضافة منتج جديد للكتالوج' : 'Add New Catalog Product'}</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'أدخل تفاصيل صنف المخزون الجديد' : 'Input technical specifications and details'}</p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">{t.productName}</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">{t.sku}</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    required
                    placeholder="e.g. BARCODE-1234"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold uppercase mb-1.5">{t.price} (EGP)</label>
                    <input
                      type="number"
                      value={newPrice || ''}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold uppercase mb-1.5">{t.stock}</label>
                    <input
                      type="number"
                      value={newStock || ''}
                      onChange={(e) => setNewStock(Number(e.target.value))}
                      required
                      className="w-full px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1.5">{lang === 'ar' ? 'القسم' : 'Category'}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-1/3 py-3 border border-white/5 hover:bg-white/5 rounded-xl font-bold text-slate-400 text-center cursor-pointer"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 glow-btn font-bold py-3 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'إضافة المنتج' : 'Add Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
