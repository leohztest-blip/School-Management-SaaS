'use client';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, MONTHS } from '@/utils';
import { Building2, Users, DollarSign, TrendingUp, TrendingDown, Activity, Download } from 'lucide-react';

// Mock platform-wide data
const mrrTrend = MONTHS.slice(0, 8).map((m, i) => ({
  month: m.slice(0, 3),
  mrr: 450000 + i * 85000 + Math.random() * 20000,
  new_schools: 12 + i * 3,
  churned: 2 + Math.floor(Math.random() * 3),
}));

const planDistribution = [
  { name: 'Free', value: 145, color: '#94a3b8' },
  { name: 'Starter', value: 820, color: '#60a5fa' },
  { name: 'Professional', value: 980, color: '#3b82f6' },
  { name: 'Enterprise', value: 210, color: '#1d4ed8' },
];

const topSchools = [
  { name: 'Dhaka Model School', district: 'Dhaka', students: 2840, plan: 'enterprise', mrr: 5999 },
  { name: 'Chittagong Grammar', district: 'Chattogram', students: 1920, plan: 'professional', mrr: 2499 },
  { name: 'Sylhet International', district: 'Sylhet', students: 1540, plan: 'professional', mrr: 2499 },
  { name: 'Rajshahi Collegiate', district: 'Rajshahi', students: 1280, plan: 'professional', mrr: 2499 },
  { name: 'Khulna Ideal School', district: 'Khulna', students: 890, plan: 'starter', mrr: 999 },
];

const recentSignups = [
  { name: 'Bogura Public School', district: 'Bogura', plan: 'starter', date: '2024-01-15', status: 'trial' },
  { name: 'Comilla Model School', district: 'Cumilla', plan: 'professional', date: '2024-01-14', status: 'active' },
  { name: 'Mymensingh Zilla School', district: 'Mymensingh', plan: 'starter', date: '2024-01-13', status: 'trial' },
  { name: 'Rangpur Cadet College', district: 'Rangpur', plan: 'enterprise', date: '2024-01-12', status: 'active' },
];

const PLAN_COLORS: Record<string, 'default' | 'primary' | 'success' | 'purple'> = {
  free: 'default', starter: 'primary', professional: 'success', enterprise: 'purple',
};

export default function AdminAnalyticsPage() {
  const totalSchools = planDistribution.reduce((s, p) => s + p.value, 0);
  const currentMRR = mrrTrend[mrrTrend.length - 1]?.mrr || 0;
  const prevMRR = mrrTrend[mrrTrend.length - 2]?.mrr || 1;
  const mrrGrowth = Math.round(((currentMRR - prevMRR) / prevMRR) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        subtitle="Real-time metrics across all schools on Shiksha ERP"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Analytics' }]}
        actions={
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
            Export Report
          </Button>
        }
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Schools"
          value={totalSchools}
          icon={Building2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend={8}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Total Students"
          value={2480000}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          trend={12}
          trendLabel="MoM growth"
        />
        <StatsCard
          title="Monthly Recurring Revenue"
          value={currentMRR}
          format="currency"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend={mrrGrowth}
          trendLabel="MoM growth"
        />
        <StatsCard
          title="Active This Month"
          value={Math.floor(totalSchools * 0.91)}
          icon={Activity}
          iconColor="text-cyan-600"
          iconBg="bg-cyan-50"
          subtitle="91% platform activity rate"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Annual Recurring Revenue</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(currentMRR * 12)}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600">+{mrrGrowth}% MoM</span>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Avg Revenue per School</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(currentMRR / totalSchools)}</p>
          <p className="text-xs text-gray-400 mt-1">per school / month</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">New Schools (MTD)</p>
          <p className="text-xl font-bold text-gray-900">{mrrTrend[mrrTrend.length - 1]?.new_schools}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600">+22% vs last month</span>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Churn Rate</p>
          <p className="text-xl font-bold text-gray-900">1.8%</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-600">Improved by 0.3%</span>
          </div>
        </div>
      </div>

      {/* MRR Chart + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">MRR Growth</h3>
              <p className="text-xs text-gray-400 mt-0.5">Monthly Recurring Revenue Trend</p>
            </div>
            <div className="flex gap-2">
              {['3M', '6M', '1Y'].map(p => (
                <button key={p} className={`text-xs px-2.5 py-1 rounded-lg border transition-colors
                  ${p === '6M' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={mrrTrend}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), 'MRR']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="mrr" name="MRR" stroke="#3b82f6" strokeWidth={2.5}
                fill="url(#mrrGrad)" dot={{ fill: '#3b82f6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">Plan Distribution</h3>
            <p className="text-xs text-gray-400 mt-0.5">{totalSchools} active schools</p>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                paddingAngle={3} dataKey="value">
                {planDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {planDistribution.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-gray-600">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{p.value}</span>
                  <span className="text-gray-400">({Math.round((p.value / totalSchools) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Signups Chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">New School Signups vs Churns</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mrrTrend} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="new_schools" name="New Schools" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="churned" name="Churned" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom: Top Schools + Recent Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Top Schools by Students</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {topSchools.map((s, i) => (
              <div key={s.name} className="flex items-center gap-4 px-5 py-3">
                <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.district}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{s.students.toLocaleString()} students</p>
                  <Badge variant={PLAN_COLORS[s.plan] || 'default'} className="capitalize text-xs">{s.plan}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Recent Signups</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSignups.map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-5 py-3">
                <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.district} · {s.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={PLAN_COLORS[s.plan] || 'default'} className="capitalize text-xs">{s.plan}</Badge>
                  <Badge variant={s.status === 'active' ? 'success' : 'warning'} className="text-xs">{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <Button variant="ghost" size="sm" className="w-full text-xs text-blue-600">View All Schools →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
