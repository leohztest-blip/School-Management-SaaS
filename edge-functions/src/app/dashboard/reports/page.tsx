'use client';
import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { formatCurrency, MONTHS } from '@/utils';
import { Download, Printer, BarChart2, Users, DollarSign, UserCheck, ChevronRight } from 'lucide-react';

const monthlyRevenue = MONTHS.map((m, i) => ({
  month: m.slice(0, 3),
  collected: 700000 + Math.random() * 300000,
  outstanding: 50000 + Math.random() * 100000,
  expenses: 400000 + Math.random() * 150000,
}));

const attendanceData = MONTHS.slice(0, 6).map((m) => ({
  month: m.slice(0, 3),
  rate: 85 + Math.random() * 12,
}));

const genderData = [
  { name: 'Male', value: 118, color: '#3b82f6' },
  { name: 'Female', value: 100, color: '#ec4899' },
];

const classWiseAttendance = [
  { class: 'VI', present: 46, absent: 2 },
  { class: 'VII', present: 49, absent: 3 },
  { class: 'VIII', present: 43, absent: 2 },
  { class: 'IX', present: 36, absent: 2 },
  { class: 'X', present: 32, absent: 3 },
];

const reportTypes = [
  { id: 'financial', label: 'Financial Summary', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'attendance', label: 'Attendance Report', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'student', label: 'Student Report', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'payroll', label: 'Payroll Report', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'fee', label: 'Fee Collection', icon: BarChart2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'result', label: 'Exam Results', icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('financial');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Comprehensive insights and exportable reports"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>
              Print
            </Button>
            <Button size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export PDF
            </Button>
          </div>
        }
      />

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {reportTypes.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center
                ${activeReport === r.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}
            >
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${r.bg}`}>
                <Icon className={`h-5 w-5 ${r.color}`} />
              </div>
              <span className={`text-xs font-medium leading-tight ${activeReport === r.id ? 'text-blue-700' : 'text-gray-600'}`}>
                {r.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
        <span className="text-sm text-gray-500 font-medium">Period:</span>
        {['This Month', 'Last Month', 'This Quarter', 'This Year', 'Custom'].map((p) => (
          <button
            key={p}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Financial Report */}
      {activeReport === 'financial' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Collected', value: 854000, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Outstanding', value: 245500, color: 'text-amber-700', bg: 'bg-amber-50' },
              { label: 'Total Expenses', value: 512000, color: 'text-red-700', bg: 'bg-red-50' },
              { label: 'Net Surplus', value: 342000, color: 'text-blue-700', bg: 'bg-blue-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{formatCurrency(s.value)}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Collection vs Expenses (2024)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyRevenue} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="collected" name="Collected" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" name="Outstanding" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fee breakdown table */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-semibold text-gray-900">Fee Collection Breakdown</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expected</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Collected</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pending</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { type: 'Tuition Fee', expected: 1199000, collected: 1045000, pending: 154000 },
                  { type: 'Exam Fee', expected: 174400, collected: 156000, pending: 18400 },
                  { type: 'Library Fee', expected: 109000, collected: 98000, pending: 11000 },
                  { type: 'Transport Fee', expected: 261600, collected: 228000, pending: 33600 },
                ].map((row) => (
                  <tr key={row.type} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-800">{row.type}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{formatCurrency(row.expected)}</td>
                    <td className="px-5 py-3 text-right text-green-700 font-medium">{formatCurrency(row.collected)}</td>
                    <td className="px-5 py-3 text-right text-red-600">{formatCurrency(row.pending)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-semibold ${(row.collected / row.expected) * 100 > 85 ? 'text-green-600' : 'text-amber-600'}`}>
                        {((row.collected / row.expected) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Report */}
      {activeReport === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Monthly Attendance Rate</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[75, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, 'Rate']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', r: 4 }} name="Attendance Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Class-wise Attendance (Today)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={classWiseAttendance} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="class" type="category" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="present" name="Present" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Student Report */}
      {activeReport === 'student' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Gender Distribution</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={4} dataKey="value">
                    {genderData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {genderData.map((g) => (
                  <div key={g.name}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-3 w-3 rounded-full" style={{ background: g.color }} />
                      <span className="text-sm text-gray-600">{g.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{g.value}</p>
                    <p className="text-xs text-gray-400">{((g.value / 218) * 100).toFixed(1)}% of total</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Enrollment by Class</h3>
            <div className="space-y-3">
              {classWiseAttendance.map((c) => {
                const total = c.present + c.absent;
                const pct = ((c.present / total) * 100).toFixed(0);
                return (
                  <div key={c.class} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-16">Class {c.class}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(total / 55) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 w-8 text-right">{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
