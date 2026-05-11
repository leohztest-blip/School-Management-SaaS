'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { hasPermission } from '@/config/permissions';
import type { Permission } from '@/types';
import {
  LayoutDashboard, GraduationCap, Users, BookOpen, ClipboardList,
  DollarSign, CreditCard, Briefcase, BarChart2, Bell, Settings,
  Building2, LogOut, UserCheck, Award, Layers, CalendarDays,
  Bus, Home, Package, Zap, TrendingUp, ChevronDown, Shield,
  Library, Key,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  permission?: Permission;
  badge?: string | number;
}

interface NavSection { title: string; items: NavItem[] }

const SCHOOL_NAV: NavSection[] = [
  {
    title: 'ACADEMICS',
    items: [
      { label: 'Dashboard',        href: '/dashboard',              icon: LayoutDashboard },
      { label: 'Students',         href: '/dashboard/students',     icon: GraduationCap,  permission: 'students:read' },
      { label: 'Staff',            href: '/dashboard/staff',        icon: Users,          permission: 'teachers:read' },
      { label: 'Classes',          href: '/dashboard/classes',      icon: Layers,         permission: 'students:read' },
      { label: 'Attendance',       href: '/dashboard/attendance',   icon: UserCheck,      permission: 'attendance:read' },
      { label: 'Grades & Results', href: '/dashboard/grades',        icon: Award,          permission: 'exams:read' },
      { label: 'Timetable',        href: '/dashboard/timetable',    icon: CalendarDays,   permission: 'students:read' },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { label: 'Fees & Billing',  href: '/dashboard/fees',         icon: DollarSign,     permission: 'fees:read' },
      { label: 'Payments',        href: '/dashboard/payments',     icon: CreditCard,     permission: 'payments:read' },
      { label: 'Expenses',        href: '/dashboard/expenses',     icon: TrendingUp,     permission: 'fees:read' },
      { label: 'Payroll',         href: '/dashboard/payroll',      icon: Briefcase,      permission: 'payroll:read' },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { label: 'Library',         href: '/dashboard/library',      icon: Library,        permission: 'students:read' },
      { label: 'Transport',       href: '/dashboard/transport',    icon: Bus,            permission: 'students:read' },
      { label: 'Hostel',          href: '/dashboard/hostel',       icon: Home,           permission: 'students:read' },
      { label: 'Reports',         href: '/dashboard/reports',      icon: BarChart2,      permission: 'reports:read' },
      { label: 'Notices',         href: '/dashboard/notices',icon: Bell,           permission: 'notifications:read' },
      { label: 'Settings',        href: '/dashboard/settings',     icon: Settings,       permission: 'settings:read' },
    ],
  },
];

const SUPER_ADMIN_NAV: NavSection[] = [
  {
    title: 'PLATFORM',
    items: [
      { label: 'Dashboard',       href: '/admin/schools',          icon: LayoutDashboard },
      { label: 'Schools',         href: '/admin/schools',          icon: Building2 },
      { label: 'Analytics',       href: '/admin/analytics',        icon: BarChart2 },
      { label: 'Subscriptions',   href: '/dashboard/payments',     icon: CreditCard },
      { label: 'Support',         href: '/dashboard/notifications', icon: Shield },
      { label: 'Settings',        href: '/dashboard/settings',     icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, school, logout } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore();

  const isSuperAdmin = user?.role === 'super_admin';
  const navSections = isSuperAdmin ? SUPER_ADMIN_NAV : SCHOOL_NAV;

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={cn(
        'fixed left-0 top-0 z-30 h-full flex flex-col bg-[#0f172a] border-r border-[#1e293b]',
        'transition-[width] duration-250 ease-in-out',
        sidebarCollapsed ? 'w-16' : 'w-60',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-[#1e293b] shrink-0 px-3',
          sidebarCollapsed ? 'justify-center' : 'gap-2.5'
        )}>
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">Shiksha ERP</p>
              {school?.name && (
                <p className="text-slate-400 text-[11px] truncate mt-0.5">{school.name}</p>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-none py-3 px-2 space-y-0.5">
          {navSections.map(section => {
            const visible = section.items.filter(i =>
              !i.permission || !user?.role || hasPermission(user.role, i.permission)
            );
            if (!visible.length) return null;
            return (
              <div key={section.title}>
                {!sidebarCollapsed && (
                  <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    {section.title}
                  </p>
                )}
                {sidebarCollapsed && <div className="h-2" />}
                {visible.map(item => (
                  <NavLink key={item.href} item={item} pathname={pathname} collapsed={sidebarCollapsed} />
                ))}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-[#1e293b] p-3 shrink-0">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.profile?.full_name?.charAt(0) || 'A'}
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{user?.profile?.full_name || 'Admin'}</p>
                  <p className="text-slate-400 text-[11px] capitalize truncate">{user?.role?.replace(/_/g, ' ')}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-slate-500 hover:text-white transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function NavLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const Icon = item.icon;
  const isActive = item.href
    ? (item.href === '/dashboard' || item.href === '/admin'
        ? pathname === item.href
        : pathname.startsWith(item.href))
    : false;

  return (
    <Link
      href={item.href || '#'}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative group',
        collapsed && 'justify-center px-0',
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none">
          {item.badge}
        </span>
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 z-50 hidden group-hover:flex">
          <div className="bg-gray-900 text-white text-xs font-medium rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg border border-white/10">
            {item.label}
          </div>
        </div>
      )}
    </Link>
  );
}
