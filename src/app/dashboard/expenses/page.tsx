'use client';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils';
import { TrendingDown, DollarSign, Plus, Download, Filter, Edit, Trash2, X, Check } from 'lucide-react';

interface Expense {
  id: string; date: string; category: string; title: string;
  amount: number; method: string; vendor?: string; approved: boolean; ref?: string;
}

const CATEGORIES = ['Utilities', 'Maintenance', 'Supplies', 'Events', 'Salaries', 'Equipment', 'Transport', 'Other'];
const MOCK: Expense[] = [
  { id:'e1', date:'2024-01-10', category:'Utilities',   title:'Electricity Bill — January',   amount:8500,  method:'Bank Transfer', vendor:'DESCO',                    approved:true,  ref:'UTIL-001' },
  { id:'e2', date:'2024-01-15', category:'Maintenance', title:'Classroom Paint & Repair',      amount:25000, method:'Cash',           vendor:'Local Contractor',         approved:true,  ref:'MAINT-002' },
  { id:'e3', date:'2024-01-20', category:'Supplies',    title:'Office Stationery & Printing',  amount:3200,  method:'Cash',           vendor:'Rahman Stationery',        approved:true,  ref:'SUP-003' },
  { id:'e4', date:'2024-01-05', category:'Utilities',   title:'Internet & Broadband',          amount:2500,  method:'Bank Transfer', vendor:'BTCL',                     approved:true,  ref:'UTIL-004' },
  { id:'e5', date:'2024-01-25', category:'Events',      title:'Annual Sports Day',             amount:15000, method:'Cash',           vendor:'Various',                  approved:false, ref:'EVT-005' },
  { id:'e6', date:'2024-01-28', category:'Equipment',   title:'Projector for Science Lab',     amount:45000, method:'Cheque',         vendor:'Tech Solutions BD',        approved:true,  ref:'EQP-006' },
  { id:'e7', date:'2024-01-18', category:'Utilities',   title:'Water Supply Bill',             amount:1200,  method:'Cash',           vendor:'WASA',                     approved:true,  ref:'UTIL-007' },
  { id:'e8', date:'2024-01-22', category:'Supplies',    title:'Chemistry Lab Chemicals',       amount:8800,  method:'Bank Transfer', vendor:'Science Depot',            approved:false, ref:'SUP-008' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Utilities: 'pill pill-blue', Maintenance: 'pill pill-amber', Supplies: 'pill pill-purple',
  Events: 'pill pill-cyan', Equipment: 'pill pill-green', Transport: 'pill pill-gray',
  Salaries: 'pill pill-red', Other: 'pill pill-gray',
};

function AddExpenseModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-modal animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Add Expense</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="form-label">Category *</label>
              <select className="form-select">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Title / Description *</label>
            <input className="form-input" placeholder="e.g. Electricity bill for January" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Amount (৳) *</label>
              <input type="number" className="form-input" placeholder="0.00" />
            </div>
            <div>
              <label className="form-label">Payment Method *</label>
              <select className="form-select">
                {['Cash','Bank Transfer','Cheque','bKash','Nagad'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Vendor / Payee</label>
              <input className="form-input" placeholder="Vendor name" />
            </div>
            <div>
              <label className="form-label">Reference / Invoice No.</label>
              <input className="form-input" placeholder="INV-XXXX" />
            </div>
          </div>
          <div>
            <label className="form-label">Receipt Upload</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
              <p className="text-sm text-gray-400">Click to upload receipt image or PDF</p>
              <p className="text-xs text-gray-300 mt-1">Max 5MB · PNG, JPG, PDF</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-50 bg-gray-50/50 rounded-b-2xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button leftIcon={<Check className="h-4 w-4" />}>Save Expense</Button>
        </div>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? MOCK : MOCK.filter(e => e.category === activeCategory);
  const total = MOCK.reduce((s, e) => s + e.amount, 0);
  const approved = MOCK.filter(e => e.approved).reduce((s, e) => s + e.amount, 0);
  const pending = MOCK.filter(e => !e.approved).reduce((s, e) => s + e.amount, 0);

  // Category breakdown
  const byCategory = CATEGORIES.map(cat => ({
    category: cat,
    amount: MOCK.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    count: MOCK.filter(e => e.category === cat).length,
  })).filter(c => c.count > 0);

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="text-sm text-gray-600 tabular-nums">{formatDate(row.original.date)}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className={CATEGORY_COLORS[row.original.category] || 'pill pill-gray'}>{row.original.category}</span>,
    },
    {
      accessorKey: 'title',
      header: 'Description',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.title}</p>
          {row.original.vendor && <p className="text-xs text-gray-400">{row.original.vendor}</p>}
        </div>
      ),
    },
    {
      accessorKey: 'ref',
      header: 'Reference',
      cell: ({ row }) => <span className="font-mono text-xs text-gray-500">{row.original.ref || '—'}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <span className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(row.original.amount)}</span>,
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.method}</span>,
    },
    {
      accessorKey: 'approved',
      header: 'Status',
      cell: ({ row }) => (
        row.original.approved
          ? <span className="pill pill-green">Approved</span>
          : <span className="pill pill-amber">Pending</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon-sm"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
          <Button variant="ghost" size="icon-sm"><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Expenses"
        subtitle="Track and manage school operating expenses"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Expenses' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>Add Expense</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Expenses" value={total} format="currency" icon={TrendingDown} iconColor="text-red-600" iconBg="bg-red-50" subtitle="This month" />
        <StatsCard title="Approved" value={approved} format="currency" icon={Check as any} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Pending Approval" value={pending} format="currency" icon={DollarSign} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Transactions" value={MOCK.length} icon={Filter} iconColor="text-blue-600" iconBg="bg-blue-50" />
      </div>

      {/* Category breakdown cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {byCategory.map(c => (
          <button
            key={c.category}
            onClick={() => setActiveCategory(activeCategory === c.category ? 'All' : c.category)}
            className={`card p-4 text-left hover:shadow-elevated transition-all ${activeCategory === c.category ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={CATEGORY_COLORS[c.category] || 'pill pill-gray'}>{c.category}</span>
              <span className="text-xs text-gray-400">{c.count} items</span>
            </div>
            <p className="text-base font-bold text-gray-900">{formatCurrency(c.amount)}</p>
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round((c.amount / total) * 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{Math.round((c.amount / total) * 100)}% of total</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="section-title">
            {activeCategory === 'All' ? 'All Expenses' : `${activeCategory} Expenses`}
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} records)</span>
          </h3>
          {activeCategory !== 'All' && (
            <Button variant="ghost" size="sm" onClick={() => setActiveCategory('All')}>
              <X className="h-4 w-4 mr-1" />Clear filter
            </Button>
          )}
        </div>
        <DataTable columns={columns} data={filtered} searchPlaceholder="Search expenses..." pageSize={10} />
      </div>

      {addOpen && <AddExpenseModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
