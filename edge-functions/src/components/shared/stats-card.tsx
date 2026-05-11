'use client';
import { cn, formatCurrency } from '@/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: number; // percentage change
  trendLabel?: string;
  format?: 'number' | 'currency' | 'percent';
  className?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  trend,
  trendLabel,
  format = 'number',
  className,
  loading,
}: StatsCardProps) {
  const formattedValue =
    format === 'currency'
      ? formatCurrency(Number(value))
      : format === 'percent'
      ? `${value}%`
      : Number(value).toLocaleString();

  const trendPositive = trend && trend > 0;
  const trendNeutral = trend === 0;

  if (loading) {
    return (
      <div className={cn('bg-white rounded-xl border border-gray-100 p-5 shadow-sm', className)}>
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-10 w-10 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-8 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'group bg-white rounded-xl border border-gray-100 p-5 shadow-sm',
      'hover:shadow-md hover:border-gray-200 transition-all duration-200',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{formattedValue}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className={cn(
            'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
            trendNeutral ? 'bg-gray-100 text-gray-600' :
            trendPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}>
            {trendNeutral ? <Minus className="h-3 w-3" /> :
             trendPositive ? <TrendingUp className="h-3 w-3" /> :
             <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend || 0)}%
          </div>
          {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
