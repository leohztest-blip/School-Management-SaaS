'use client';
import { useState } from 'react';
import { formatDate, formatCurrency } from '@/utils';
import { Badge, AttendanceBadge, PaymentStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, UserCheck, DollarSign, Bell, BookOpen,
  Phone, Mail, MapPin, TrendingUp, AlertCircle, ChevronRight,
} from 'lucide-react';

const child = {
  name: 'Arif Hossain',
  student_id: 'STU-0001',
  class: 'Class X — Section A',
  roll: '01',
  photo: null,
  school: 'Dhaka Model School & College',
};

const attendanceSummary = { present: 142, absent: 8, late: 3, total: 153, rate: 92.8 };
const recentAttendance = [
  { date: '2024-01-15', status: 'present' }, { date: '2024-01-14', status: 'present' },
  { date: '2024-01-13', status: 'absent' }, { date: '2024-01-12', status: 'present' },
  { date: '2024-01-11', status: 'late' }, { date: '2024-01-10', status: 'present' },
];
const pendingFees = [
  { invoice: 'INV-2024-003', description: 'March Tuition', amount: 5500, due: '2024-03-10', status: 'partial', paid: 2750 },
  { invoice: 'INV-2024-004', description: 'April Tuition', amount: 5500, due: '2024-04-10', status: 'unpaid', paid: 0 },
];
const notifications = [
  { id: 1, type: 'alert', title: 'School Holiday', body: 'School closed on Feb 21 for Language Martyrs\' Day.', time: '2 days ago' },
  { id: 2, type: 'attendance', title: 'Absent Today', body: 'Arif Hossain was absent from school today.', time: '3 days ago' },
  { id: 3, type: 'exam', title: 'Exam Schedule', body: 'Annual exam starts from November 1. See schedule.', time: '1 week ago' },
];

export default function ParentPortalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'results' | 'notifications'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: UserCheck },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'results', label: 'Results', icon: TrendingUp },
    { id: 'notifications', label: 'Notices', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0f172a] px-4 pt-8 pb-16 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="max-w-lg mx-auto">
          <p className="text-white/40 text-xs mb-1">{child.school}</p>
          <h1 className="text-white text-xl font-bold">Parent Portal</h1>

          {/* Student card */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {child.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg leading-tight">{child.name}</p>
              <p className="text-white/60 text-sm">{child.class}</p>
              <p className="text-white/40 text-xs">ID: {child.student_id} · Roll: {child.roll}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${attendanceSummary.rate >= 85 ? 'text-green-400' : 'text-amber-400'}`}>
                {attendanceSummary.rate}%
              </div>
              <p className="text-white/40 text-xs">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-lg mx-auto -mt-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tab nav */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-none">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium shrink-0 border-b-2 transition-all
                    ${activeTab === tab.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-green-700">{attendanceSummary.present}</p>
                    <p className="text-xs text-green-600 mt-0.5">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-red-600">{attendanceSummary.absent}</p>
                    <p className="text-xs text-red-500 mt-0.5">Absent</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-700">{formatCurrency(pendingFees.reduce((s, f) => s + f.amount - f.paid, 0))}</p>
                    <p className="text-xs text-blue-600 mt-0.5">Due Fees</p>
                  </div>
                </div>

                {/* Pending fee alert */}
                {pendingFees.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Fees Due</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          {formatCurrency(pendingFees.reduce((s, f) => s + f.amount - f.paid, 0))} is outstanding across {pendingFees.length} invoices
                        </p>
                        <Button size="sm" className="mt-2 h-7 text-xs bg-amber-600 hover:bg-amber-700">
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent attendance */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Last 6 Days</p>
                  <div className="flex gap-2">
                    {recentAttendance.map((a, i) => (
                      <div key={i} className="flex-1 text-center">
                        <div className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold
                          ${a.status === 'present' ? 'bg-green-100 text-green-700' :
                            a.status === 'absent' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {a.status === 'present' ? 'P' : a.status === 'absent' ? 'A' : 'L'}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{new Date(a.date).getDate()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest notice */}
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1.5">Latest Notice</p>
                  <p className="text-sm font-semibold text-gray-900">{notifications[0].title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{notifications[0].body}</p>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Present', value: attendanceSummary.present, color: 'text-green-700 bg-green-50' },
                    { label: 'Absent', value: attendanceSummary.absent, color: 'text-red-600 bg-red-50' },
                    { label: 'Late', value: attendanceSummary.late, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Rate', value: `${attendanceSummary.rate}%`, color: 'text-blue-700 bg-blue-50' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-2.5 text-center ${s.color}`}>
                      <p className="text-lg font-bold">{s.value}</p>
                      <p className="text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">Recent Records</p>
                  {recentAttendance.map((a, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-700">{formatDate(a.date)}</span>
                      <AttendanceBadge status={a.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="space-y-3">
                {pendingFees.map(fee => (
                  <div key={fee.invoice} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{fee.description}</p>
                        <p className="text-xs text-gray-400">{fee.invoice} · Due: {formatDate(fee.due)}</p>
                      </div>
                      <PaymentStatusBadge status={fee.status} />
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">Total: <strong>{formatCurrency(fee.amount)}</strong></span>
                      <span className="text-green-600">Paid: <strong>{formatCurrency(fee.paid)}</strong></span>
                      <span className="text-red-600">Due: <strong>{formatCurrency(fee.amount - fee.paid)}</strong></span>
                    </div>
                    {fee.status !== 'paid' && (
                      <Button size="sm" className="w-full h-8 text-xs" leftIcon={<DollarSign className="h-3.5 w-3.5" />}>
                        Pay {formatCurrency(fee.amount - fee.paid)} via bKash / Nagad
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-3">
                {notifications.map(n => (
                  <div key={n.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0
                        ${n.type === 'alert' ? 'bg-red-50' : n.type === 'attendance' ? 'bg-amber-50' : 'bg-blue-50'}`}>
                        <Bell className={`h-4 w-4 ${n.type === 'alert' ? 'text-red-500' : n.type === 'attendance' ? 'text-amber-500' : 'text-blue-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">First Term 2024</p>
                    <p className="text-xs text-blue-600">Result Published</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-700">4.5</p>
                    <p className="text-xs text-blue-500">GPA / 5.0</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[['Bangla', 88, 'A+'], ['English', 78, 'A'], ['Mathematics', 95, 'A+'], ['Science', 85, 'A+'], ['Social Studies', 79, 'A']].map(([sub, marks, grade]) => (
                    <div key={sub as string} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-700">{sub}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-800">{marks}/100</span>
                        <Badge variant="success" className="text-xs">{grade}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* School contact */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-800">School Contact</p>
          <a href="tel:02-9112345" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            02-9112345
          </a>
          <a href="mailto:info@dhakamsc.edu.bd" className="flex items-center gap-3 text-sm text-gray-600 hover:text-blue-600">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            info@dhakamsc.edu.bd
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 pb-4">Powered by Shiksha ERP</p>
      </div>
    </div>
  );
}
