'use client';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/utils';
import type { Payment } from '@/types';
import {
  DollarSign, TrendingUp, CreditCard, Smartphone,
  Download, Filter, Eye, Printer, RefreshCw,
} from 'lucide-react';

type PaymentRow = {
  id: string;
  payment_number: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  transaction_id?: string;
  is_verified: boolean;
  student_name: string;
  student_id_code: string;
  invoice_number: string;
  collected_by?: string;
};

const PAYMENT_METHOD_ICONS: Record<string, { label: string; color: string; bg: string }> = {
  cash:       { label: 'Cash',       color: 'text-green-700', bg: 'bg-green-50' },
  bkash:      { label: 'bKash',      color: 'text-pink-700',  bg: 'bg-pink-50'  },
  nagad:      { label: 'Nagad',      color: 'text-orange-700',bg: 'bg-orange-50'},
  rocket:     { label: 'Rocket',     color: 'text-purple-700',bg: 'bg-purple-50'},
  sslcommerz: { label: 'SSLCommerz', color: 'text-blue-700',  bg: 'bg-blue-50'  },
  bank_transfer:{ label: 'Bank',     color: 'text-indigo-700',bg: 'bg-indigo-50'},
  cheque:     { label: 'Cheque',     color: 'text-gray-700',  bg: 'bg-gray-100' },
};

const mockPayments: PaymentRow[] = Array.from({ length: 45 }, (_, i) => {
  const methods = Object.keys(PAYMENT_METHOD_ICONS);
  const names = ['Arif Hossain', 'Fatema Khatun', 'Rakib Ahmed', 'Sadia Islam', 'Mehedi Hasan',
    'Nusrat Jahan', 'Tanvir Alam', 'Riya Akter', 'Sabbir Khan', 'Mitu Begum'];
  return {
    id: `p-${i + 1}`,
    payment_number: `PAY-2024-${String(i + 1).padStart(5, '0')}`,
    amount: [5500, 2750, 11000, 800, 1200][i % 5],
    payment_method: methods[i % methods.length],
    payment_date: new Date(2024, 0, 15 - (i % 15)).toISOString(),
    transaction_id: i % 3 !== 0 ? `TXN${Math.random().toString(36).substr(2, 10).toUpperCase()}` : undefined,
    is_verified: i % 5 !== 3,
    student_name: names[i % 10],
    student_id_code: `STU-${String(i + 1).padStart(4, '0')}`,
    invoice_number: `INV-2024-${String(i + 1).padStart(4, '0')}`,
    collected_by: 'Accounts Office',
  };
});

const columns: ColumnDef<PaymentRow>[] = [
  {
    accessorKey: 'payment_number',
    header: 'Receipt No.',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
        {row.original.payment_number}
      </span>
    ),
  },
  {
    id: 'student',
    header: 'Student',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={row.original.student_name} size="sm" />
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.student_name}</p>
          <p className="text-xs text-gray-400">{row.original.student_id_code}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'invoice_number',
    header: 'Invoice',
    cell: ({ row }) => (
      <span className="text-xs text-gray-500 font-mono">{row.original.invoice_number}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="text-sm font-bold text-gray-900">{formatCurrency(row.original.amount)}</span>
    ),
  },
  {
    accessorKey: 'payment_method',
    header: 'Method',
    cell: ({ row }) => {
      const cfg = PAYMENT_METHOD_ICONS[row.original.payment_method] || { label: row.original.payment_method, color: 'text-gray-700', bg: 'bg-gray-100' };
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      );
    },
  },
  {
    accessorKey: 'payment_date',
    header: 'Date & Time',
    cell: ({ row }) => (
      <span className="text-xs text-gray-500">{formatDateTime(row.original.payment_date)}</span>
    ),
  },
  {
    accessorKey: 'transaction_id',
    header: 'Txn ID',
    cell: ({ row }) => (
      <span className="text-xs font-mono text-gray-400">
        {row.original.transaction_id || '–'}
      </span>
    ),
  },
  {
    accessorKey: 'is_verified',
    header: 'Verified',
    cell: ({ row }) => (
      <Badge variant={row.original.is_verified ? 'success' : 'warning'}>
        {row.original.is_verified ? 'Verified' : 'Pending'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm" title="View Receipt">
          <Eye className="h-3.5 w-3.5 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon-sm" title="Print Receipt">
          <Printer className="h-3.5 w-3.5 text-gray-400" />
        </Button>
      </div>
    ),
  },
];

const totalCollected = mockPayments.reduce((s, p) => s + p.amount, 0);
const byMethod = Object.entries(PAYMENT_METHOD_ICONS).map(([key, cfg]) => ({
  method: cfg.label,
  count: mockPayments.filter((p) => p.payment_method === key).length,
  amount: mockPayments.filter((p) => p.payment_method === key).reduce((s, p) => s + p.amount, 0),
  color: cfg.color,
  bg: cfg.bg,
})).filter((m) => m.count > 0);

export default function PaymentsPage() {
  const [activeMethod, setActiveMethod] = useState<string | null>(null);

  const filteredPayments = activeMethod
    ? mockPayments.filter((p) => p.payment_method === activeMethod)
    : mockPayments;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Transactions"
        subtitle="Complete payment history and collection records"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Payments' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Collected"
          value={totalCollected}
          format="currency"
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend={12}
          trendLabel="this month"
        />
        <StatsCard
          title="Transactions"
          value={mockPayments.length}
          icon={CreditCard}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatsCard
          title="Digital Payments"
          value={mockPayments.filter((p) => p.payment_method !== 'cash').length}
          icon={Smartphone}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          subtitle={`${Math.round((mockPayments.filter((p) => p.payment_method !== 'cash').length / mockPayments.length) * 100)}% of total`}
        />
        <StatsCard
          title="Unverified"
          value={mockPayments.filter((p) => !p.is_verified).length}
          icon={TrendingUp}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Payment method breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveMethod(null)}
          className={`p-3 rounded-xl border-2 text-center transition-all
            ${!activeMethod ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
        >
          <p className="text-sm font-bold text-gray-900">{mockPayments.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">All</p>
        </button>
        {byMethod.map((m) => (
          <button
            key={m.method}
            onClick={() => setActiveMethod(
              Object.entries(PAYMENT_METHOD_ICONS).find(([, v]) => v.label === m.method)?.[0] || null
            )}
            className={`p-3 rounded-xl border-2 text-center transition-all
              ${activeMethod && PAYMENT_METHOD_ICONS[activeMethod]?.label === m.method
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-gray-200'}`}
          >
            <p className={`text-sm font-bold ${m.color}`}>{m.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{m.method}</p>
            <p className="text-xs text-gray-400">{formatCurrency(m.amount)}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPayments}
        searchPlaceholder="Search by receipt, student, transaction ID..."
        pageSize={15}
        toolbar={
          <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
            Date Range
          </Button>
        }
      />
    </div>
  );
}
