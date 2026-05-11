'use client';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          'ml-0 lg:ml-64',
          sidebarCollapsed && 'lg:ml-[68px]'
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
