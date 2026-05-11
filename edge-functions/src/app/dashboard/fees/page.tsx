'use client';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { Badge, PaymentStatusBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatCurrency, formatDate } from '@/utils';
import type { Invoice } from '@/types';
import {
  DollarSign, TrendingUp, AlertCircle, Clock,
  Plus, Filter, Eye, Printer, Send, Download,
} from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InvoiceWithStudent = any & {
  student?: { full_name: string; student_id: string; class?: { name: string }; section?: { name: string } };
};

const mockInvoices = Array.from({ length: 40 }, (_, i) => ({
  id: `inv-${i + 1}`,
  school_id: 'school-1',
  student_id: `s-${i + 1}`,
  invoice_number: `INV-2024-${String(i + 1).padStart(4, '0')}`,
  issue_date: '2024-01-01',
  due_date: '2024-01-15',
  subtotal: 5500,
  discount: i % 8 === 0 ? 550 : 0,
  total: i % 8 === 0 ? 4950 : 5500,
  paid_amount: i % 5 === 0 ? 0 : i % 7 === 0 ? 2750 : 5500,
  balance: i % 5 === 0 ? 5500 : i % 7 === 0 ? 2750 : 0,
  status: (i % 5 === 0 ? 'overdue' : i % 7 === 0 ? 'partial' : 'paid') as Invoice['status'],
  month: 1,
  year: 2024,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  student: {
    full_name: ['Arif Hossain', 'Fatema Khatun', 'Rakib Ahmed', 'Sadia Islam', 'Mehedi Hasan',
      'Nusrat Jahan', 'Tanvir Alam', 'Riya Akter', 'Sabbir Khan', 'Mitu Begum'][i % 10],
    student_id: `STU-${String(i + 1).padStart(4, '0')}`,
    class: { name: `Class ${['VI', 'VII', 'VIII', 'IX', 'X'][i % 5]}` },
    section: { name: ['A', 'B', 'C'][i % 3] },
  },
}));

const columns: ColumnDef<InvoiceWithStudent>[] = [
  {
    accessorKey: 'invoice_number',
    header: 'Invoice',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
        {row.original.invoice_number}
      </span>
    ),
  },
  {
    id: 'student',
    header: 'Student',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={row.original.student?.full_name || ''} size="sm" />
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.student?.full_name}</p>
          <p className="text-xs text-gray-400">
            {row.original.student?.student_id} · {row.original.student?.class?.name} {row.original.student?.section?.name}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => <span className="font-semibold text-gray-800 text-sm">{formatCurrency(row.original.total)}</span>,
  },
  {
    accessorKey: 'paid_amount',
    header: 'Paid',
    cell: ({ row }) => <span className="text-sm text-green-700 font-medium">{formatCurrency(row.original.paid_amount)}</span>,
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => (
      <span className={`text-sm font-semibold ${row.original.balance > 0 ? 'text-red-600' : 'text-gray-400'}`}>
        {row.original.balance > 0 ? formatCurrency(row.original.balance) : '–'}
      </span>
    ),
  },
  {
    accessorKey: 'due_date',
    header: 'Due Date',
    cell: ({ row }) => <span className="text-xs text-gray-500">{formatDate(row.original.due_date)}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" title="View">
          <Eye className="h-3.5 w-3.5 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon-sm" title="Print Receipt">
          <Printer className="h-3.5 w-3.5 text-gray-400" />
        </Button>
        {row.original.status !== 'paid' && (
          <Button variant="ghost" size="icon-sm" title="Send Reminder">
            <Send className="h-3.5 w-3.5 text-blue-400" />
          </Button>
        )}
      </div>
    ),
  },
];

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState<'invoices' | 'structures' | 'collect'>('invoices');

  const tabs = [
    { id: 'invoices', label: 'Invoices' },
    { id: 'structures', label: 'Fee Structures' },
    { id: 'collect', label: 'Collect Payment' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management"
        subtitle="Track invoices, collect payments, manage fee structures"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Fees' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Generate Invoice
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Monthly Collection" value={854000} format="currency" icon={DollarSign}
          iconColor="text-blue-600" iconBg="bg-blue-50" trend={12} trendLabel="vs last month" />
        <StatsCard title="Total Outstanding" value={245500} format="currency" icon={AlertCircle}
          iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Overdue Amount" value={85000} format="currency" icon={Clock}
          iconColor="text-red-600" iconBg="bg-red-50" />
        <StatsCard title="Collection Rate" value="89%" icon={TrendingUp}
          iconColor="text-green-600" iconBg="bg-green-50" trend={3} trendLabel="this month" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'invoices' && (
        <DataTable
          columns={columns}
          data={mockInvoices}
          searchPlaceholder="Search by invoice number, student..."
          pageSize={12}
          toolbar={
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
              Filters
            </Button>
          }
        />
      )}

      {activeTab === 'structures' && <FeeStructuresPanel />}
      {activeTab === 'collect' && <CollectPaymentPanel />}
    </div>
  );
}

function FeeStructuresPanel() {
  const structures = [
    { name: 'Monthly Tuition Fee', type: 'tuition', class: 'All Classes', amount: 5500, frequency: 'Monthly', mandatory: true },
    { name: 'Admission Fee', type: 'admission', class: 'All Classes', amount: 15000, frequency: 'One-time', mandatory: true },
    { name: 'Exam Fee (Half-yearly)', type: 'exam', class: 'Class IX, X', amount: 800, frequency: 'Half-yearly', mandatory: true },
    { name: 'Library Fee', type: 'library', class: 'All Classes', amount: 500, frequency: 'Yearly', mandatory: false },
    { name: 'Transport Fee', type: 'transport', class: 'All Classes', amount: 1200, frequency: 'Monthly', mandatory: false },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{structures.length} fee structures configured</p>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Fee Structure</Button>
      </div>
      <div className="grid gap-3">
        {structures.map((s, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm
              ${s.type === 'tuition' ? 'bg-blue-500' : s.type === 'exam' ? 'bg-purple-500' : s.type === 'transport' ? 'bg-green-500' : 'bg-amber-500'}`}>
              {s.type[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{s.name}</p>
              <p className="text-xs text-gray-400">{s.class} · {s.frequency}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{formatCurrency(s.amount)}</p>
              {s.mandatory && <Badge variant="primary" className="text-xs">Mandatory</Badge>}
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectPaymentPanel() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-lg">
      <h3 className="font-semibold text-gray-900 mb-4">Collect Payment</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Search Student</label>
          <input placeholder="Enter student name or ID..." className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Invoice</label>
          <select className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Select invoice...</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Amount (৳)</label>
          <input type="number" placeholder="0.00" className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {['Cash', 'bKash', 'Nagad', 'Rocket', 'Bank', 'SSL'].map((m) => (
              <button key={m} className="h-9 border border-gray-200 rounded-lg text-sm hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {m}
              </button>
            ))}
          </div>
        </div>
        <Button className="w-full" leftIcon={<DollarSign className="h-4 w-4" />}>
          Collect & Print Receipt
        </Button>
      </div>
    </div>
  );
}
