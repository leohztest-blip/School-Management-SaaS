'use client';
import React, { useState } from 'react';
import { cn, formatDate } from '@/utils';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { Menu, Bell, Search, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, school } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <header className={cn('fixed right-0 top-0 z-30 h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm transition-[left] duration-300', sidebarCollapsed ? 'left-0 lg:left-[74px]' : 'left-0 lg:left-[272px]')}>
      <div className="flex h-full items-center gap-3 px-4 sm:px-6">
        <button aria-label="Open sidebar" onClick={toggleSidebar} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 lg:hidden"><Menu className="h-5 w-5" /></button>
        <div className="hidden flex-1 max-w-md sm:block"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input aria-label="Search" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Search students, invoices, attendance..." /></div></div>
        <div className="hidden md:block"><p className="text-xs text-slate-500">{formatDate(new Date().toISOString())}</p><p className="text-sm font-semibold text-slate-800">{school?.name || 'Shiksha ERP Dashboard'}</p></div>
        <div className="ml-auto flex items-center gap-2">
          <button aria-label="Notifications" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" /></button>
          <button onClick={() => setOpen(!open)} aria-label="User menu" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5"><Avatar name={user?.profile?.full_name || 'Admin'} size="sm" /><div className="hidden md:block text-left"><p className="text-xs font-semibold">{user?.profile?.full_name || 'Administrator'}</p><p className="text-[11px] text-slate-500 capitalize">{user?.role?.replace(/_/g, ' ')}</p></div><ChevronDown className="h-4 w-4 text-slate-400" /></button>
        </div>
      </div>
      {open && <div className="absolute right-4 top-14 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">Profile</button><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50">Settings</button></div>}
    </header>
  );
}
