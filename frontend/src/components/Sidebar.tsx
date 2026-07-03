"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguageStore, useAuthStore, translations } from '@/lib/store';
import {
  Home, ShoppingBag, Package, Boxes, Monitor, Truck, Globe,
  Users, Briefcase, UserCheck, BarChart3, CreditCard, Sparkles,
  Settings, Menu, X, LogOut
} from 'lucide-react';

interface SidebarProps {
  onMenuToggle?: (isOpen: boolean) => void;
}

export default function Sidebar({ onMenuToggle }: SidebarProps) {
  const pathname = usePathname();
  const { lang } = useLanguageStore();
  const { logout, user } = useAuthStore();
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: t.dashboard, icon: Home, path: '/dashboard' },
    { name: t.pos, icon: Monitor, path: '/dashboard/pos' },
    { name: t.products, icon: Package, path: '/dashboard/products' },
    { name: t.inventory, icon: Boxes, path: '/dashboard/inventory' },
    { name: t.sales, icon: ShoppingBag, path: '/dashboard/sales' },
    { name: t.purchases, icon: Truck, path: '/dashboard/purchases' },
    { name: t.ecommerce, icon: Globe, path: '/dashboard/ecommerce' },
    { name: t.customers, icon: Users, path: '/dashboard/customers' },
    { name: t.suppliers, icon: Briefcase, path: '/dashboard/suppliers' },
    { name: t.employees, icon: UserCheck, path: '/dashboard/employees' },
    { name: t.reports, icon: BarChart3, path: '/dashboard/reports' },
    { name: t.billing, icon: CreditCard, path: '/dashboard/billing' },
    { name: t.aiCenter, icon: Sparkles, path: '/dashboard/ai' },
    { name: t.settings, icon: Settings, path: '/dashboard/settings' },
  ];

  // Filter menu items by active user role
  const getFilteredMenuItems = () => {
    const role = user?.role || 'admin';
    if (role === 'admin') return menuItems;
    if (role === 'manager') {
      return menuItems.filter(item => 
        ['/dashboard', '/dashboard/pos', '/dashboard/products', '/dashboard/inventory', '/dashboard/sales', '/dashboard/purchases', '/dashboard/customers', '/dashboard/suppliers', '/dashboard/employees', '/dashboard/reports'].includes(item.path)
      );
    }
    if (role === 'cashier') {
      return menuItems.filter(item => 
        ['/dashboard/pos', '/dashboard/employees'].includes(item.path)
      );
    }
    if (role === 'inventory') {
      return menuItems.filter(item => 
        ['/dashboard/products', '/dashboard/inventory', '/dashboard/suppliers'].includes(item.path)
      );
    }
    if (role === 'customer') {
      return menuItems.filter(item => 
        ['/dashboard', '/dashboard/products', '/dashboard/settings'].includes(item.path)
      );
    }
    return menuItems;
  };

  const filteredItems = getFilteredMenuItems();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (onMenuToggle) onMenuToggle(!isOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={handleToggle}
        className="fixed top-5 right-5 z-[100] md:hidden p-2.5 bg-slate-900 border border-white/10 rounded-xl text-white shadow-lg cursor-pointer"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          onClick={handleToggle}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar shell */}
      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col w-64 bg-[var(--background)] border-r border-[var(--border)] shadow-[4px_0_15px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_15px_rgba(0,0,0,0.4)] transition-all duration-300 md:translate-x-0 ${
          lang === 'ar'
            ? 'right-0 border-l border-r-0 ' + (isOpen ? 'translate-x-0' : 'translate-x-full')
            : 'left-0 ' + (isOpen ? 'translate-x-0' : '-translate-x-full')
        }`}
      >
        {/* Logo / Header */}
        <div className="h-20 flex items-center px-6 border-b border-[var(--border)] gap-2">
          <Sparkles className="text-[var(--primary)] animate-pulse" size={24} />
          <span className="text-lg font-black tracking-wider text-[var(--foreground)]">
            STORE-MO
          </span>
          <span className="text-[9px] text-[var(--primary)] font-bold skeuo-inset rounded-md px-2 py-1 ml-auto uppercase tracking-wide">
            {user?.role || 'SaaS'}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'skeuo-inset text-[var(--primary)] font-bold'
                    : 'text-slate-400 hover:text-[var(--foreground)] hover:bg-white/5 dark:hover:bg-white/1 shadow-[1px_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.5)] dark:hover:shadow-[3px_3px_8px_rgba(0,0,0,0.3),-3px_-3px_8px_rgba(255,255,255,0.02)]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[var(--primary)]' : 'text-slate-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile / Log out footer */}
        <div className="p-4 border-t border-[var(--border)] space-y-4">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl skeuo-inset">
            <div className="h-9 w-9 rounded-full bg-[var(--card)] shadow-[2px_2px_5px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.4),-2px_-2px_5px_rgba(255,255,255,0.02)] border border-[var(--card-border)] flex items-center justify-center font-bold text-[var(--primary)] text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-[var(--foreground)]">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.tenantName || 'Cairo Branch'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 skeuo-inset hover:text-red-600 hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] transition cursor-pointer"
          >
            <LogOut size={14} />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
