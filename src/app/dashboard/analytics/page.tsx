'use client';
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { formatCurrency, MONTHS } from '@/utils';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, AlertCircle, Download, Calendar } from 'lucide-react';

const currentYear = new Date().getFullYear();

// Monthly data
const MONTHLY = MONTHS.map((m, i) => ({
  month: m.slice(0, 3),
  revenue:  350000 + Math.sin(i * 0.5) * 80000 + i * 15000,
  expenses: 220000 + Math.cos(i * 0.4) * 40000 + i * 8000,
  fees:     280000 + Math.sin(i * 0.6) * 60000 + i * 12000,
  payroll:  180000 + i * 2000,
})).map(r => ({ ...r, net: r.revenue - r.expenses }));

// Fee collection by type
const FEE_TYPES = [
  { name: 'Tuition',   value: 685000, color: '#3b82f6' },
  { name: 'Exam',      value: 87000,  color: '#8b5cf6' },
  { name: 'Transport', value: 156000, color: '#10b981' },
  { name: 'Library',   value: 32000,  color: '#f59e0b' },
  { name: 'Hostel',    value: 220000, color: '#ef4444' },
  { name: 'Other',     value: 44000,  color: '#6b7280' },
];

// Payment methods
const PAY_METHODS = [
  { method: 'Cash',         count: 342, amount: 580000, color: '#10b981' },
  { method: 'bKash',        count: 198, amount: 445000, color: '#ec4899' },
  { method: 'Nagad',        count: 124, amount: 267000, color: '#f97316' },
  { method: 'Bank Transfer',count: 56,  amount: 385000, color: '#3b82f6' },
  { method: 'SSLCommerz',   count: 34,  amount: 182000, color: '#8b5cf6' },
];

// Expense categories
const EXPENSE_CATS = [
  { name: 'Payroll',      amount: 1920000, pct: 58 },
  { name: 'Utilities',    amount: 124000,  pct: 4 },
  { name: 'Maintenance',  amount: 245000,  pct: 7 },
  { name: 'Supplies',     amount: 98000,   pct: 3 },
  { name: 'Events',       amount: 156000,  pct: 5 },
  { name: 'Equipment',    amount: 380000,  pct: 12 },
  { name: 'Other',        amount: 356000,  pct: 11 },
];

const RANGE_OPTIONS = ['This Month', 'Last Month', 'This Quarter', 'This Year'];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-elevated text-xs">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-500">{p.name}</span>
          </span>
          <span className="font-semibold text-gray-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [range, setRange] = useState('This Year');

  const totalRevenue = MONTHLY.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = MONTHLY.reduce((s, m) => s + m.expenses, 0);
  const netSurplus = totalRevenue - totalExpenses;
  const totalFeeTypes = FEE_TYPES.reduce((s, f) => s + f.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Finance Analytics"
        subtitle="Deep insights into revenue, expenses, and financial performance"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {RANGE_OPTIONS.map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-2 text-xs font-medium transition-colors ${range === r ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {r}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue" value={totalRevenue} format="currency" icon={TrendingUp}
          iconColor="text-green-600" iconBg="bg-green-50" trend={14} trendLabel="vs last year" />
        <StatsCard title="Total Expenses" value={totalExpenses} format="currency" icon={TrendingDown}
          iconColor="text-red-600" iconBg="bg-red-50" trend={8} trendLabel="vs last year" />
        <StatsCard title="Net Surplus" value={netSurplus} format="currency" icon={DollarSign}
          iconColor="text-blue-600" iconBg="bg-blue-50" trend={22} trendLabel="YoY growth" />
        <StatsCard title="Collection Rate" value="87.3%" icon={CreditCard}
          iconColor="text-purple-600" iconBg="bg-purple-50" trend={3.2} trendLabel="vs last month" />
      </div>

      {/* Revenue vs Expenses chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="section-title">Revenue vs Expenses — {currentYear}</h3>
            <p className="section-subtitle">Monthly financial performance overview</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {[
              { label: 'Revenue',  color: '#3b82f6' },
              { label: 'Expenses', color: '#ef4444' },
              { label: 'Net',      color: '#10b981' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-gray-500">{l.label}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="card-body pt-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MONTHLY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                {[
                  { id: 'revGrad', color: '#3b82f6' },
                  { id: 'expGrad', color: '#ef4444' },
                  { id: 'netGrad', color: '#10b981' },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: '#3b82f6' }} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2}
                fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: '#ef4444' }} />
              <Area type="monotone" dataKey="net" name="Net" stroke="#10b981" strokeWidth={2}
                fill="url(#netGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} strokeDasharray="5 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Fee breakdown + Payment methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fee type breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="section-title">Fee Collection by Type</h3>
              <p className="section-subtitle">Total: {formatCurrency(totalFeeTypes)}</p>
            </div>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={FEE_TYPES} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                    paddingAngle={3} dataKey="value">
                    {FEE_TYPES.map((f, i) => <Cell key={i} fill={f.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [formatCurrency(v), '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {FEE_TYPES.map(f => (
                  <div key={f.name} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: f.color }} />
                    <span className="text-xs text-gray-600 flex-1">{f.name}</span>
                    <span className="text-xs font-semibold text-gray-900 tabular-nums">{formatCurrency(f.value)}</span>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {Math.round((f.value / totalFeeTypes) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment method breakdown */}
        <div className="card">
          <div className="card-header">
            <h3 className="section-title">Payment Methods</h3>
          </div>
          <div className="card-body space-y-3">
            {PAY_METHODS.map(p => {
              const totalAmount = PAY_METHODS.reduce((s, m) => s + m.amount, 0);
              const pct = Math.round((p.amount / totalAmount) * 100);
              return (
                <div key={p.method}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-sm font-medium text-gray-700">{p.method}</span>
                      <span className="text-xs text-gray-400">{p.count} txns</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                      <span className="text-xs text-gray-400 ml-2">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Expense breakdown + Monthly comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense categories */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="section-title">Expense Breakdown</h3>
              <p className="section-subtitle">By category · {currentYear}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-5">Category</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Share</th>
                  <th className="pr-5 w-32">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {EXPENSE_CATS.map(e => (
                  <tr key={e.name}>
                    <td className="pl-5 text-sm font-medium text-gray-800">{e.name}</td>
                    <td className="text-right text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(e.amount)}</td>
                    <td className="text-right text-sm text-gray-500">{e.pct}%</td>
                    <td className="pr-5">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${e.pct}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50">
                  <td className="pl-5 py-3 text-sm font-bold text-gray-900">Total</td>
                  <td className="text-right py-3 pr-4 text-sm font-bold text-gray-900">
                    {formatCurrency(EXPENSE_CATS.reduce((s, e) => s + e.amount, 0))}
                  </td>
                  <td className="text-right py-3 pr-4 text-sm text-gray-400">100%</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Monthly payroll trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="section-title">Fee Collection Trend</h3>
              <p className="section-subtitle">Monthly fees collected vs payroll</p>
            </div>
          </div>
          <div className="card-body pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MONTHLY.slice(0, 8)} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Bar dataKey="fees" name="Fees Collected" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="payroll" name="Payroll" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Outstanding summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Outstanding', value: 245500, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', subtitle: '47 unpaid invoices' },
          { label: 'Overdue (30+ days)', value: 85000, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', subtitle: '14 invoices overdue' },
          { label: 'Collected This Month', value: 854000, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', subtitle: '87% collection rate' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{formatCurrency(s.value)}</p>
                <p className="text-xs text-gray-400 mt-1">{s.subtitle}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
