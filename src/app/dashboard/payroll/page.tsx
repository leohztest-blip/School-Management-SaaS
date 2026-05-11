'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { formatCurrency, MONTHS } from '@/utils';
import { DollarSign, Users, CheckCircle, Clock, Download, Printer, FileText, ChevronDown, X } from 'lucide-react';

interface PayEntry {
  id: string; emp_number: string; name: string; role: string; department: string;
  type: 'Government' | 'School'; basic: number; house: number; medical: number;
  transport: number; other_allow: number; tax: number; pf: number; other_ded: number;
  status: 'paid' | 'pending' | 'processing'; paid_date?: string;
}

const ENTRIES: PayEntry[] = [
  { id:'p1',emp_number:'EMP001',name:'Abdul Karim Rahman',  role:'Math Teacher',   department:'Science', type:'School',    basic:35000,house:7000,medical:1500,transport:1000,other_allow:0,  tax:2100,pf:1750,other_ded:0,  status:'paid',      paid_date:'2024-01-25' },
  { id:'p2',emp_number:'EMP002',name:'Rashida Begum',       role:'English Teacher',department:'Arts',    type:'Government',basic:28000,house:5600,medical:1500,transport:1000,other_allow:0,  tax:1400,pf:1400,other_ded:0,  status:'pending' },
  { id:'p3',emp_number:'EMP003',name:'Nasir Uddin Ahmed',   role:'Science Teacher',department:'Science', type:'School',    basic:32000,house:6400,medical:1500,transport:1000,other_allow:500,tax:1920,pf:1600,other_ded:0,  status:'paid',      paid_date:'2024-01-25' },
  { id:'p4',emp_number:'EMP004',name:'Momtaz Khatun',       role:'Bangla Teacher', department:'Arts',    type:'Government',basic:30000,house:6000,medical:1500,transport:1000,other_allow:0,  tax:1650,pf:1500,other_ded:200,status:'pending' },
  { id:'p5',emp_number:'EMP005',name:'Iqbal Hossain',       role:'ICT Teacher',    department:'Science', type:'School',    basic:25000,house:5000,medical:1500,transport:1000,other_allow:0,  tax:1000,pf:1250,other_ded:0,  status:'processing' },
  { id:'p6',emp_number:'EMP006',name:'Roksana Akter',       role:'Accountant',     department:'Admin',   type:'School',    basic:22000,house:4400,medical:1500,transport:1000,other_allow:0,  tax:800, pf:1100,other_ded:0,  status:'paid',      paid_date:'2024-01-25' },
];

function gross(e: PayEntry) { return e.basic + e.house + e.medical + e.transport + e.other_allow; }
function deductions(e: PayEntry) { return e.tax + e.pf + e.other_ded; }
function net(e: PayEntry) { return gross(e) - deductions(e); }

const STATUS: Record<string,{label:string;cls:string}> = {
  paid:       { label:'Paid',       cls:'pill pill-green' },
  pending:    { label:'Pending',    cls:'pill pill-amber' },
  processing: { label:'Processing', cls:'pill pill-blue' },
};

function PayslipModal({ e, month, year, onClose }: { e: PayEntry; month: number; year: number; onClose: () => void }) {
  const g = gross(e), d = deductions(e), n = net(e);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-modal animate-slide-up" onClick={ev => ev.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-900 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">EMPLOYEE PAYSLIP</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 h-8 px-3 bg-gray-100 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 cursor-pointer">
              {MONTHS[month-1]} {year} (Draft) <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-1" />
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()}>⎙ PRINT</Button>
            <Button size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>PDF</Button>
            <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Payslip body */}
        <div className="px-8 py-6">
          {/* School + title */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dhaka Model School</h1>
            </div>
            <div className="text-right">
              <div className="inline-block border-2 border-gray-800 px-4 py-0.5 mb-1">
                <span className="text-xs font-bold tracking-widest uppercase">PAYSLIP</span>
              </div>
              <p className="text-sm font-bold text-gray-900">{MONTHS[month-1]} {year}</p>
              <p className="text-xs text-gray-500">Period: 01–{new Date(year, month, 0).getDate()} {MONTHS[month-1]} {year}</p>
            </div>
          </div>
          <hr className="border-gray-300 mb-5" />

          {/* Employee info */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-3 bg-gray-50 rounded-xl p-4 mb-5">
            {[
              { label: 'EMPLOYEE NAME', value: e.name },
              { label: 'EMPLOYEE NO.', value: e.emp_number },
              { label: 'ROLE / POSITION', value: e.role },
              { label: 'DEPARTMENT', value: e.department },
              { label: 'NATIONAL ID', value: '—' },
              { label: 'PAYMENT STATUS', value: e.status === 'paid' ? `✓ Paid on ${e.paid_date}` : 'Pending', highlight: e.status === 'paid' },
            ].map(f => (
              <div key={f.label}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{f.label}</p>
                <p className={`text-sm font-medium mt-0.5 ${f.highlight ? 'text-green-600' : 'text-gray-900'}`}>{f.value}</p>
              </div>
            ))}
          </div>

          {/* Earnings */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">■ EARNINGS</span>
            </div>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[['Basic Salary', e.basic],['House Allowance', e.house],['Medical Allowance', e.medical],['Transport Allowance', e.transport],...(e.other_allow?[['Other Allowance', e.other_allow]]:[])].map(([l,v]) => (
                  <tr key={l as string}><td className="px-4 py-2.5 text-gray-700">{l}</td><td className="px-4 py-2.5 text-right font-mono">{(v as number).toFixed(2)}</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#0f172a]">
                  <td className="px-4 py-2.5 text-sm font-bold text-white uppercase tracking-wide">Gross Earnings</td>
                  <td className="px-4 py-2.5 text-right font-bold text-white font-mono">{g.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deductions */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">■ DEDUCTIONS</span>
            </div>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-red-50 border-b border-red-100">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Rate</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[['Income Tax (PAYE)','Progressive',e.tax],['Provident Fund','5% of Basic',e.pf],...(e.other_ded?[['Other Deductions','—',e.other_ded]]:[])].map(([l,r,v]) => (
                  <tr key={l as string}>
                    <td className="px-4 py-2.5 text-gray-700">{l}</td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">{r}</td>
                    <td className="px-4 py-2.5 text-right text-red-600 font-mono">{(v as number).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Net salary box */}
          <div className="bg-[#0f172a] rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-xs uppercase tracking-widest font-medium">Net Salary (Take Home)</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(n)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Type: <span className="text-white font-semibold">{e.type}</span></p>
              {e.paid_date && <p className="text-green-400 text-sm font-semibold mt-1">Paid: {e.paid_date}</p>}
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-8 grid grid-cols-3 gap-6 text-center">
            {['Employee', 'HR / Principal', 'Accounts'].map(s => (
              <div key={s}><div className="h-10 border-b border-dashed border-gray-300" /><p className="text-xs text-gray-400 mt-2">{s}</p></div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-300 mt-5 pt-4 border-t border-gray-100">Generated by Shiksha ERP — Computer generated slip</p>
        </div>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filter, setFilter] = useState<'All'|'School'|'Government'>('All');
  const [payslip, setPayslip] = useState<PayEntry | null>(null);

  const rows = ENTRIES.filter(e => filter === 'All' || e.type === filter);
  const totalNet = rows.reduce((s, e) => s + net(e), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Payroll" subtitle="Process and manage employee salaries"
        breadcrumbs={[{label:'Dashboard',href:'/dashboard'},{label:'Payroll'}]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>EXPORT</Button>
            <Button variant="outline" size="sm">BACKUP</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Payable" value={totalNet} format="currency" icon={DollarSign} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Employees" value={rows.length} icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Processed" value={rows.filter(e=>e.status==='paid').length} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Pending" value={rows.filter(e=>e.status==='pending').length} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="form-select h-9 w-36 text-sm">
              {MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}
            </select>
            <select value={year} onChange={e=>setYear(Number(e.target.value))} className="form-select h-9 w-24 text-sm">
              {[now.getFullYear(), now.getFullYear()-1].map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="success" size="sm" leftIcon={<CheckCircle className="h-4 w-4" />}>Process Payroll</Button>
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>Print All Slips</Button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-100">
          {(['All','School','Government'] as const).map(t=>(
            <button key={t} onClick={()=>setFilter(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${filter===t ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'All' ? 'All Employees' : `${t} Employed`}
              <span className="ml-1.5 text-xs text-gray-400">({ENTRIES.filter(e=>t==='All'||e.type===t).length})</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="pl-5">EMP #</th>
                <th>Employee</th>
                <th>Role / Dept</th>
                <th className="text-right">Basic</th>
                <th className="text-right">Gross</th>
                <th className="text-right">Deductions</th>
                <th className="text-right">Net Salary</th>
                <th className="text-center">Type</th>
                <th className="text-center">Payslip</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(e => {
                const g = gross(e), d = deductions(e), n = net(e);
                const sc = STATUS[e.status];
                return (
                  <tr key={e.id}>
                    <td className="pl-5"><span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{e.emp_number}</span></td>
                    <td>
                      <p className="text-sm font-semibold text-gray-900">{e.name}</p>
                      <span className={sc.cls}>{sc.label}</span>
                    </td>
                    <td><p className="text-sm text-gray-700">{e.role}</p><p className="text-xs text-gray-400">{e.department}</p></td>
                    <td className="text-right text-sm text-gray-600">{formatCurrency(e.basic)}</td>
                    <td className="text-right text-sm font-medium text-gray-900">{formatCurrency(g)}</td>
                    <td className="text-right text-sm text-red-600">-{formatCurrency(d)}</td>
                    <td className="text-right text-sm font-bold text-gray-900">{formatCurrency(n)}</td>
                    <td className="text-center">
                      <div className="inline-flex items-center gap-1 h-7 px-3 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer hover:border-gray-300 transition-colors">
                        {e.type}<ChevronDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="text-center">
                      <Button variant="outline" size="sm" className="h-7 text-xs border-blue-200 text-blue-700 hover:bg-blue-50" onClick={()=>setPayslip(e)} leftIcon={<FileText className="h-3 w-3" />}>
                        VIEW PAYSLIP
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td colSpan={4} className="pl-5 py-3 text-sm font-semibold text-gray-700">Totals ({rows.length})</td>
                <td className="text-right py-3 pr-4 text-sm font-bold">{formatCurrency(rows.reduce((s,e)=>s+gross(e),0))}</td>
                <td className="text-right py-3 pr-4 text-sm font-bold text-red-600">-{formatCurrency(rows.reduce((s,e)=>s+deductions(e),0))}</td>
                <td className="text-right py-3 pr-4 text-sm font-bold text-gray-900">{formatCurrency(totalNet)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {payslip && <PayslipModal e={payslip} month={month} year={year} onClose={()=>setPayslip(null)} />}
    </div>
  );
}
