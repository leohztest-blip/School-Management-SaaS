'use client';
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';
import { useUIStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import { Avatar } from '@/components/ui/avatar';
import { Menu, Bell, Search, ChevronDown, Settings, LogOut, User, HelpCircle, X, Check } from 'lucide-react';

const MOCK_NOTIFS = [
  { id: 1, type: 'payment', title: 'Payment Received', body: '৳5,500 from Arif Hossain', time: '5 min ago', read: false },
  { id: 2, type: 'alert', title: 'Low Attendance', body: 'Class X-A below 75%', time: '1 hr ago', read: false },
  { id: 3, type: 'fee', title: 'Overdue Invoices', body: '12 invoices past due', time: '2 hr ago', read: true },
];

export function Navbar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user, school } = useAuthStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 right-0 z-20 h-16 bg-white border-b border-gray-100',
      'flex items-center gap-3 px-4 transition-[left] duration-250 ease-in-out left-0 lg:left-60',
      sidebarCollapsed && 'lg:left-16'
    )}>
      <button onClick={toggleSidebar} className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Search students, invoices, staff..." className="w-full h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        {school && (
          <div className="hidden md:flex items-center gap-2 h-8 px-3 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />{school.name}
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }} className="relative h-9 w-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Bell className="h-4.5 w-4.5" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 h-4 min-w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">{unread}</span>}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-100 shadow-modal z-50 overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-900">Notifications {unread > 0 && <span className="ml-1 text-xs text-gray-400">({unread} new)</span>}</p>
                <div className="flex items-center gap-2">
                  {unread > 0 && <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))} className="text-xs text-blue-600 font-medium">Mark all read</button>}
                  <button onClick={() => setNotifOpen(false)}><X className="h-4 w-4 text-gray-400 hover:text-gray-600" /></button>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {notifs.map(n => (
                  <div key={n.id} className={cn('flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors', !n.read && 'bg-blue-50/40')}>
                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', n.type === 'payment' ? 'bg-green-50 text-green-600' : n.type === 'alert' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500')}><Bell className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                    {!n.read && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }} className="flex items-center gap-2 h-9 pl-2 pr-3 rounded-lg hover:bg-gray-100 transition-colors">
            <Avatar name={user?.profile?.full_name || 'Admin'} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-none">{user?.profile?.full_name || 'Administrator'}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden md:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-modal z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-900">{user?.profile?.full_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{user?.profile?.email}</p>
              </div>
              {[{ icon: User, label: 'My Profile' }, { icon: Settings, label: 'Account Settings' }, { icon: HelpCircle, label: 'Help & Support' }].map(i => (
                <button key={i.label} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  <i.icon className="h-4 w-4 text-gray-400" />{i.label}
                </button>
              ))}
              <div className="border-t border-gray-50">
                <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" />Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
