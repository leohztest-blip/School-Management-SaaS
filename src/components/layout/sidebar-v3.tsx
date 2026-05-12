'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { hasPermission } from '@/config/permissions';
import type { Permission } from '@/types';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen, CalendarDays, UserCheck, Award, DollarSign,
  Receipt, CreditCard, AlertTriangle, Wallet, Megaphone, Mail, CalendarClock, Shield, Settings,
  FileBarChart2, UserCog, LogOut, Building2, Sparkles
} from 'lucide-react';

interface NavItem { label: string; href: string; icon: React.ElementType; permission?: Permission; }
interface NavSection { title: string; items: NavItem[] }

const SCHOOL_NAV: NavSection[] = [
  { title: 'Academics', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/dashboard/students', icon: GraduationCap, permission: 'students:read' },
    { label: 'Admissions', href: '/dashboard/admission', icon: BookOpen, permission: 'students:write' },
    { label: 'Classes & Sections', href: '/dashboard/classes', icon: Users, permission: 'students:read' },
    { label: 'Routine / Timetable', href: '/dashboard/timetable', icon: CalendarDays, permission: 'students:read' },
    { label: 'Attendance', href: '/dashboard/attendance', icon: UserCheck, permission: 'attendance:read' },
    { label: 'Exams & Results', href: '/dashboard/exams', icon: Award, permission: 'exams:read' },
  ]},
  { title: 'Finance', items: [
    { label: 'Fee Collection', href: '/dashboard/fees', icon: DollarSign, permission: 'fees:read' },
    { label: 'Invoices', href: '/dashboard/payments', icon: Receipt, permission: 'payments:read' },
    { label: 'Payments', href: '/dashboard/payments', icon: CreditCard, permission: 'payments:read' },
    { label: 'Due Reports', href: '/dashboard/reports', icon: AlertTriangle, permission: 'reports:read' },
    { label: 'Expenses', href: '/dashboard/expenses', icon: Wallet, permission: 'fees:read' },
  ]},
  { title: 'Communication', items: [
    { label: 'Notices', href: '/dashboard/notices', icon: Megaphone, permission: 'notifications:read' },
    { label: 'SMS / Email', href: '/dashboard/notifications', icon: Mail, permission: 'notifications:read' },
    { label: 'Events', href: '/dashboard/notifications', icon: CalendarClock, permission: 'notifications:read' },
  ]},
  { title: 'Administration', items: [
    { label: 'Staff', href: '/dashboard/staff', icon: UserCog, permission: 'teachers:read' },
    { label: 'Roles & Permissions', href: '/dashboard/settings', icon: Shield, permission: 'settings:read' },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings, permission: 'settings:read' },
    { label: 'Reports', href: '/dashboard/reports', icon: FileBarChart2, permission: 'reports:read' },
  ]},
];

const SUPER_ADMIN_NAV: NavSection[] = [{ title: 'Platform', items: [
  { label: 'Schools', href: '/admin/schools', icon: Building2 },
  { label: 'Analytics', href: '/admin/analytics', icon: FileBarChart2 },
]}];

export function Sidebar() {
  const pathname = usePathname();
  const { user, school, logout } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen } = useUIStore();
  const navSections = user?.role === 'super_admin' ? SUPER_ADMIN_NAV : SCHOOL_NAV;

  return <>
    {sidebarOpen && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
    <aside className={cn('fixed top-0 left-0 z-50 h-screen border-r border-white/10 bg-gradient-to-b from-slate-950 via-[#101a38] to-slate-950 text-slate-200 transition-all duration-300', sidebarCollapsed ? 'w-[74px]' : 'w-[272px]', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
      <div className="flex h-16 items-center border-b border-white/10 px-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-900/40"><Sparkles className="h-4 w-4 text-white" /></div>
        {!sidebarCollapsed && <div className="ml-3 min-w-0"><p className="truncate text-sm font-semibold text-white">Shiksha ERP</p><p className="truncate text-xs text-slate-400">{school?.name || 'School ERP'}</p></div>}
      </div>
      <nav className="h-[calc(100vh-140px)] space-y-5 overflow-y-auto px-2 py-4 scrollbar-thin">
        {navSections.map((section) => {
          const items = section.items.filter((i) => !i.permission || !user?.role || hasPermission(user.role, i.permission));
          if (!items.length) return null;
          return <div key={section.title}>
            {!sidebarCollapsed && <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{section.title}</p>}
            <div className="space-y-1">{items.map((item) => <NavLink key={item.label} item={item} pathname={pathname} collapsed={sidebarCollapsed} />)}</div>
          </div>;
        })}
      </nav>
      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-slate-950/70 p-3">
        <div className={cn('flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5', sidebarCollapsed && 'justify-center')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-sm font-semibold text-indigo-200">{user?.profile?.full_name?.charAt(0) || 'A'}</div>
          {!sidebarCollapsed && <><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{user?.profile?.full_name || 'Admin'}</p><p className="truncate text-[11px] capitalize text-slate-400">{user?.role?.replace(/_/g, ' ')}</p></div><button onClick={logout} aria-label="Sign out" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"><LogOut className="h-4 w-4" /></button></>}
        </div>
      </div>
    </aside>
  </>;
}

function NavLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const Icon = item.icon;
  const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
  return <Link href={item.href} aria-current={isActive ? 'page' : undefined} className={cn('group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400', collapsed && 'justify-center px-0', isActive ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-blue-900/30' : 'text-slate-300 hover:bg-white/10 hover:text-white')} title={collapsed ? item.label : undefined}>
    {isActive && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-cyan-300" />}
    <Icon className="h-4 w-4 shrink-0" />{!collapsed && <span className="truncate">{item.label}</span>}
  </Link>;
}
