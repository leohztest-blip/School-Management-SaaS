'use client';
import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/components/shared/page-header';
import { formatCurrency, formatDate } from '@/utils';
import { GraduationCap, Users, UserCheck, DollarSign, TrendingUp, TrendingDown, AlertCircle, Clock, ArrowRight, Plus, Bell, CheckCircle, Calendar, BarChart2 } from 'lucide-react';

const weekTrend = ['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => ({ day: d, present: 138 + Math.floor(Math.random()*15), absent: 5 + Math.floor(Math.random()*10) }));
const revenueWeek = ['Mon','Tue','Wed','Thu','Fri','Sat'].map(d => ({ day: d, amount: 45000 + Math.floor(Math.random()*80000) }));
const recentPayments = [
  { name:'Arif Hossain',  id:'STU-001', class:'X-A', amount:5500, method:'bKash', time:'10 min ago', status:'paid' },
  { name:'Fatema Khatun', id:'STU-002', class:'X-B', amount:5500, method:'Cash',  time:'25 min ago', status:'paid' },
  { name:'Rakib Ahmed',   id:'STU-003', class:'IX-A',amount:2750, method:'Nagad', time:'1 hr ago',   status:'partial' },
  { name:'Sadia Islam',   id:'STU-004', class:'IX-B',amount:5500, method:'Bank',  time:'2 hr ago',   status:'paid' },
  { name:'Mehedi Hasan',  id:'STU-005', class:'VIII',amount:0,    method:'—',     time:'—',          status:'overdue' },
];
const activities = [
  { icon:DollarSign,    bg:'bg-green-50 text-green-600',   msg:'৳5,500 collected — Arif Hossain', time:'10 min ago' },
  { icon:UserCheck,     bg:'bg-blue-50 text-blue-600',     msg:'Attendance marked — Class X-A (48/50)', time:'45 min ago' },
  { icon:GraduationCap, bg:'bg-purple-50 text-purple-600', msg:'New student enrolled — Nusrat Jahan', time:'1 hr ago' },
  { icon:AlertCircle,   bg:'bg-amber-50 text-amber-600',   msg:'14 fee invoices overdue this month', time:'2 hr ago' },
];
const quickStats = [
  { label:'Total Students',   value:'218',    change:'+4',   trend:'up',   icon:GraduationCap, color:'text-blue-600',    bg:'bg-blue-50',    bl:'border-l-blue-500' },
  { label:'Present Today',    value:'94.5%',  change:'+2.1%',trend:'up',   icon:UserCheck,     color:'text-green-600',   bg:'bg-green-50',   bl:'border-l-green-500' },
  { label:'Monthly Revenue',  value:'৳8.54L', change:'+12%', trend:'up',   icon:DollarSign,    color:'text-emerald-600', bg:'bg-emerald-50', bl:'border-l-emerald-500' },
  { label:'Outstanding Fees', value:'৳2.45L', change:'-8%',  trend:'down', icon:AlertCircle,   color:'text-red-600',     bg:'bg-red-50',     bl:'border-l-red-500' },
  { label:'Staff on Leave',   value:'3',      change:'',     trend:'flat', icon:Users,         color:'text-amber-600',   bg:'bg-amber-50',   bl:'border-l-amber-500' },
  { label:'Overdue Invoices', value:'12',     change:'+2',   trend:'down', icon:Clock,         color:'text-orange-600',  bg:'bg-orange-50',  bl:'border-l-orange-500' },
];
const STATUS_PILLS: Record<string,string> = { paid:'pill pill-green', partial:'pill pill-amber', overdue:'pill pill-red', pending:'pill pill-gray' };

export default function DashboardPage() {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17) return 'Good evening';
    return 'Good morning';
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting}, Principal 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            <span className="mx-2 text-gray-200">·</span>Dhaka Model School &amp; College
          </p>
        </div>
        <button className="hidden md:flex items-center gap-2 h-9 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />Quick Action
        </button>
      </div>

      {/* 6 metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {quickStats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`card border-l-4 ${s.bl} p-4 hover:shadow-elevated transition-shadow`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-tight">{s.label}</p>
                <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              {s.change && (
                <p className={`mt-1.5 text-xs font-medium flex items-center gap-1 ${s.trend==='up'?'text-green-600':'text-red-500'}`}>
                  {s.trend==='up'?<TrendingUp className="h-3 w-3"/>:<TrendingDown className="h-3 w-3"/>}
                  {s.change} <span className="text-gray-400 font-normal">vs last month</span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="card-header">
            <div><h3 className="section-title">Attendance This Week</h3><p className="section-subtitle">Daily present/absent</p></div>
            <a href="/dashboard/attendance" className="text-xs text-blue-600 font-medium flex items-center gap-1">Mark Today <ArrowRight className="h-3 w-3"/></a>
          </div>
          <div className="card-body pt-2">
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={weekTrend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false}/>
                <XAxis dataKey="day" tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{borderRadius:'10px',border:'1px solid #e2e8f0',fontSize:'12px'}}/>
                <Bar dataKey="present" name="Present" fill="#22c55e" radius={[3,3,0,0]}/>
                <Bar dataKey="absent"  name="Absent"  fill="#f87171" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div><h3 className="section-title">Fee Collection</h3><p className="section-subtitle">This week</p></div>
          </div>
          <div className="card-body pt-1">
            <p className="text-xl font-bold text-gray-900 mb-0.5">{formatCurrency(revenueWeek.reduce((s,r)=>s+r.amount,0))}</p>
            <p className="text-xs text-green-600 flex items-center gap-1 mb-3"><TrendingUp className="h-3 w-3"/>+18% vs last week</p>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={revenueWeek}>
                <defs>
                  <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{fontSize:10,fill:'#94a3b8'}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={(v:any)=>[formatCurrency(v),'Collected']} contentStyle={{borderRadius:'8px',border:'1px solid #e2e8f0',fontSize:'11px'}}/>
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#rG)" dot={false} activeDot={{r:3,fill:'#3b82f6'}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom: payments + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="card-header">
            <h3 className="section-title">Recent Payments</h3>
            <a href="/dashboard/payments" className="text-xs text-blue-600 font-medium flex items-center gap-1">View all<ArrowRight className="h-3 w-3"/></a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.map((p,i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-sm font-bold text-blue-600">{p.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.id} · Class {p.class}</p>
                </div>
                <div className="hidden sm:block text-right mr-3">
                  <p className="text-xs text-gray-400">{p.method}</p>
                  <p className="text-xs text-gray-300">{p.time}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{p.amount > 0 ? formatCurrency(p.amount) : '—'}</p>
                  <span className={STATUS_PILLS[p.status]}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card-footer">
            <a href="/dashboard/fees" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Collect new payment →</a>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="card-header"><h3 className="section-title">Activity Feed</h3></div>
            <div className="divide-y divide-gray-50">
              {activities.map((a,i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <div className={`h-8 w-8 rounded-lg ${a.bg} flex items-center justify-center shrink-0`}>
                    <a.icon className="h-4 w-4"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">{a.msg}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label:'Mark Attendance', icon:UserCheck,    href:'/dashboard/attendance', c:'text-green-600 bg-green-50 hover:bg-green-100' },
          { label:'Collect Fee',     icon:DollarSign,   href:'/dashboard/fees',       c:'text-blue-600 bg-blue-50 hover:bg-blue-100' },
          { label:'Add Student',     icon:GraduationCap,href:'/dashboard/students',   c:'text-purple-600 bg-purple-50 hover:bg-purple-100' },
          { label:'Send Notice',     icon:Bell,         href:'/dashboard/notifications', c:'text-amber-600 bg-amber-50 hover:bg-amber-100' },
          { label:'Analytics',       icon:BarChart2,    href:'/dashboard/analytics',  c:'text-cyan-600 bg-cyan-50 hover:bg-cyan-100' },
          { label:'Run Payroll',     icon:CheckCircle,  href:'/dashboard/payroll',    c:'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
        ].map(a => {
          const Icon = a.icon;
          return (
            <a key={a.label} href={a.href} className={`flex flex-col items-center gap-2 p-4 rounded-xl ${a.c} transition-colors text-center`}>
              <Icon className="h-5 w-5"/>
              <span className="text-xs font-semibold leading-tight">{a.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
