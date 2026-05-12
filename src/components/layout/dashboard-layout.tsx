'use client';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <Navbar />
      <main className={cn('min-h-screen pt-16 transition-all duration-300', sidebarCollapsed ? 'ml-0 lg:ml-[74px]' : 'ml-0 lg:ml-[272px]')}>
        <div className="mx-auto w-full max-w-[1480px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
