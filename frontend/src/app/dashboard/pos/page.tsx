"use client";

import React, { useState } from 'react';
import { useLanguageStore, translations } from '@/lib/store';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, DollarSign, Receipt, Printer, X, Sparkles } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  // Mock Products list
  const initialProducts = [
    { id: 1, name: 'Samsung Smart TV 55"', nameAr: 'تلفزيون سامسونج ذكي 55"', price: 18500, category: 'electronics', stock: 12 },
    { id: 2, name: 'AirPods Pro 2', nameAr: 'سماعات ايربودز برو 2', price: 9500, category: 'electronics', stock: 8 },
    { id: 3, name: 'Almarai Fresh Milk 1L', nameAr: 'حليب المراعي طازج 1 لتر', price: 38, category: 'grocery', stock: 150 },
    { id: 4, name: 'Coca Cola 330ml Can', nameAr: 'كانز كوكا كولا 330 مل', price: 12, category: 'beverages', stock: 500 },
    { id: 5, name: 'Premium Coffee Beans 250g', nameAr: 'بن قهوة فاخر 250 جرام', price: 180, category: 'grocery', stock: 4 },
    { id: 6, name: 'Cairo Blend Tea 100 Pack', nameAr: 'شاي توليفة القاهرة 100 فتلة', price: 65, category: 'beverages', stock: 80 },
    { id: 7, name: 'Oversized Cotton Hoodie', nameAr: 'هودي قطن فضفاض', price: 650, category: 'fashion', stock: 25 },
    { id: 8, name: 'Leather Wallet Classic', nameAr: 'محفظة جلدية كلاسيكية', price: 350, category: 'fashion', stock: 18 }
  ];

  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [discount, setDiscount] = useState(0);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Cart operations
  const addToCart = (product: typeof initialProducts[0]) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return; // limit to stock
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, nameAr: product.nameAr, price: product.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    const item = cart.find(i => i.id === id);
    const prod = products.find(p => p.id === id);
    if (!item || !prod) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else if (newQty <= prod.stock) {
      setCart(cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.14);
  const total = Math.max(0, subtotal + tax - discount);

  const handleCheckout = (method: 'cash' | 'card') => {
    if (cart.length === 0) return;
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    setReceiptOpen(true);
  };

  const confirmPayment = () => {
    // Deduct stock
    setProducts(products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.quantity) } : p;
    }));
    setCart([]);
    setDiscount(0);
    setReceiptOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.nameAr.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-6 animate-fade-in-up">
      
      {/* LEFT PANEL: Cart & Checkout */}
      <div className="w-full lg:w-[420px] flex flex-col h-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />
        
        {/* Cart Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2 text-slate-200">
            <ShoppingCart size={18} className="text-indigo-400" />
            <h3 className="font-bold text-sm">{t.cart}</h3>
          </div>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-lg font-bold">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} {lang === 'ar' ? 'عناصر' : 'items'}
          </span>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-slate-500 gap-2">
              <ShoppingCart size={32} strokeWidth={1} />
              <span className="text-xs">{t.emptyCart}</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-2xl hover:border-white/10 transition">
                <div className="overflow-hidden flex-1 mr-2">
                  <p className="text-xs font-bold text-slate-200 truncate">{lang === 'ar' ? item.nameAr : item.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{item.price} EGP</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300">
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-extrabold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-400">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 ml-1">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary panel */}
        <div className="border-t border-white/5 pt-4 mt-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>{t.subtotal}</span>
            <span className="font-mono">{subtotal} EGP</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>{t.tax}</span>
            <span className="font-mono">{tax} EGP</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>{t.discount}</span>
            <div className="flex items-center bg-slate-950/40 rounded-lg border border-white/5 overflow-hidden">
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                placeholder="0"
                className="w-16 bg-transparent px-2 py-1 text-right text-xs font-mono focus:outline-none"
              />
              <span className="px-1.5 text-[10px] bg-white/5">EGP</span>
            </div>
          </div>
          
          <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/5">
            <span>{t.totalAmount}</span>
            <span className="font-mono text-indigo-400">{total} EGP</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              onClick={() => handleCheckout('cash')}
              disabled={cart.length === 0}
              className="py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-emerald-600/10"
            >
              <DollarSign size={14} />
              <span>{t.payCash}</span>
            </button>
            <button
              onClick={() => handleCheckout('card')}
              disabled={cart.length === 0}
              className="py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/10"
            >
              <CreditCard size={14} />
              <span>{t.payCard}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Search & Catalog */}
      <div className="flex-1 flex flex-col h-full bg-slate-900/20 backdrop-blur-sm border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-white/5 mb-4">
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

          <div className="flex gap-1 bg-slate-950/40 border border-white/5 rounded-xl p-1 overflow-x-auto w-full sm:w-auto">
            {['all', 'grocery', 'beverages', 'electronics', 'fashion'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${
                  selectedCategory === cat ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pr-1">
          {filteredProducts.map((p) => {
            const isLowStock = p.stock <= 5;
            return (
              <div 
                key={p.id}
                onClick={() => p.stock > 0 && addToCart(p)}
                className={`glass-panel p-4 rounded-2xl flex flex-col justify-between h-40 border hover:border-indigo-500/50 hover:shadow-lg transition duration-200 cursor-pointer ${
                  p.stock === 0 ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] text-slate-400 capitalize font-medium">{p.category}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      p.stock === 0 ? 'bg-red-500/20 text-red-400' : isLowStock ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {p.stock === 0 ? (lang === 'ar' ? 'نفذ' : 'Out') : `${p.stock} pcs`}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 mt-2 line-clamp-2">{lang === 'ar' ? p.nameAr : p.name}</h4>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                  <span className="text-xs font-extrabold text-indigo-400 font-mono">{p.price} EGP</span>
                  <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                    <Plus size={12} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {receiptOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel w-full max-w-[360px] rounded-3xl p-6 relative flex flex-col gap-4 text-xs">
            <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
            <button onClick={() => setReceiptOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={16} />
            </button>

            <div className="text-center pb-4 border-b border-dashed border-white/10 mt-2">
              <Sparkles size={20} className="text-indigo-400 mx-auto mb-2" />
              <h2 className="text-sm font-black uppercase text-slate-200">{t.receiptTitle}</h2>
              <p className="text-[10px] text-slate-400 mt-1">{lang === 'ar' ? 'فرع القاهرة الرئيسي' : 'Cairo Main Branch'}</p>
            </div>

            <div className="space-y-1.5 font-mono text-slate-400 text-[10px]">
              <div className="flex justify-between">
                <span>{t.invoiceNumber}:</span>
                <span className="text-white font-bold">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'التاريخ' : 'Date'}:</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'ar' ? 'الكاشير' : 'Cashier'}:</span>
                <span className="text-white">STORE-MO Cashier</span>
              </div>
            </div>

            {/* Cart list in receipt */}
            <div className="divide-y divide-dashed divide-white/5 py-2 max-h-32 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between py-1.5">
                  <span className="truncate flex-1 mr-2">{lang === 'ar' ? item.nameAr : item.name} (x{item.quantity})</span>
                  <span className="font-mono text-white">{item.price * item.quantity} EGP</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 border-t border-dashed border-white/10 pt-3 text-[10px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span>{subtotal} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>{t.tax}</span>
                <span>{tax} EGP</span>
              </div>
              <div className="flex justify-between">
                <span>{t.discount}</span>
                <span>-{discount} EGP</span>
              </div>
              <div className="flex justify-between text-xs font-black text-indigo-400 border-t border-white/5 pt-1.5">
                <span>{lang === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span>{total} EGP</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => window.print()} className="w-1/2 py-2 bg-slate-900 border border-white/5 rounded-xl hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <Printer size={12} />
                <span>{t.printReceipt}</span>
              </button>
              <button onClick={confirmPayment} className="w-1/2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                <span>{t.close}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
