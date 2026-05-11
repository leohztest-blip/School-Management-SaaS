'use client';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils';
import { Package, AlertTriangle, TrendingDown, Plus, Edit, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface Item {
  id: string; code: string; name: string; category: string;
  unit: string; stock: number; min_stock: number; unit_cost: number; location: string;
}

const ITEMS: Item[] = [
  { id:'i1', code:'STY-001', name:'A4 Paper (Ream)',          category:'Stationery', unit:'Ream', stock:45,  min_stock:20, unit_cost:350,  location:'Store A' },
  { id:'i2', code:'STY-002', name:'Ball Pen (Box)',            category:'Stationery', unit:'Box',  stock:12,  min_stock:15, unit_cost:120,  location:'Store A' },
  { id:'i3', code:'CLN-001', name:'Liquid Soap (Litre)',       category:'Cleaning',   unit:'Ltr',  stock:28,  min_stock:10, unit_cost:180,  location:'Store B' },
  { id:'i4', code:'CLN-002', name:'Toilet Cleaner',            category:'Cleaning',   unit:'Btl',  stock:8,   min_stock:12, unit_cost:95,   location:'Store B' },
  { id:'i5', code:'LAB-001', name:'Beakers (Set)',             category:'Lab',        unit:'Set',  stock:6,   min_stock:5,  unit_cost:1200, location:'Lab Store' },
  { id:'i6', code:'LAB-002', name:'Bunsen Burner',             category:'Lab',        unit:'Pcs',  stock:4,   min_stock:4,  unit_cost:850,  location:'Lab Store' },
  { id:'i7', code:'SPT-001', name:'Cricket Bat',               category:'Sports',     unit:'Pcs',  stock:8,   min_stock:6,  unit_cost:1500, location:'Sports Room' },
  { id:'i8', code:'SPT-002', name:'Football',                  category:'Sports',     unit:'Pcs',  stock:3,   min_stock:5,  unit_cost:800,  location:'Sports Room' },
  { id:'i9', code:'ELC-001', name:'LED Bulb 20W',              category:'Electrical', unit:'Pcs',  stock:22,  min_stock:10, unit_cost:220,  location:'Maintenance' },
  { id:'i10',code:'ELC-002', name:'Extension Cable 10m',       category:'Electrical', unit:'Pcs',  stock:5,   min_stock:3,  unit_cost:450,  location:'Maintenance' },
];

const CATEGORIES = ['All', 'Stationery', 'Cleaning', 'Lab', 'Sports', 'Electrical'];
const CAT_COLORS: Record<string, string> = {
  Stationery: 'pill pill-blue', Cleaning: 'pill pill-green', Lab: 'pill pill-purple',
  Sports: 'pill pill-amber', Electrical: 'pill pill-cyan',
};

export default function InventoryPage() {
  const [cat, setCat] = useState('All');
  const filtered = cat === 'All' ? ITEMS : ITEMS.filter(i => i.category === cat);
  const lowStock = ITEMS.filter(i => i.stock <= i.min_stock);
  const totalValue = ITEMS.reduce((s, i) => s + i.stock * i.unit_cost, 0);

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => <span className="font-mono text-xs font-semibold text-gray-500">{row.original.code}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Item',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.name}</p>
          <p className="text-xs text-gray-400">{row.original.location}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className={CAT_COLORS[row.original.category] || 'pill pill-gray'}>{row.original.category}</span>,
    },
    {
      id: 'stock_status',
      header: 'Stock',
      cell: ({ row }) => {
        const low = row.original.stock <= row.original.min_stock;
        return (
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${low ? 'text-red-600' : 'text-gray-900'}`}>
                {row.original.stock}
              </span>
              <span className="text-xs text-gray-400">{row.original.unit}</span>
              {low && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
            </div>
            <div className="mt-1 h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${low ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min((row.original.stock / (row.original.min_stock * 2)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">Min: {row.original.min_stock} {row.original.unit}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'unit_cost',
      header: 'Unit Cost',
      cell: ({ row }) => <span className="text-sm text-gray-700 tabular-nums">{formatCurrency(row.original.unit_cost)}</span>,
    },
    {
      id: 'total_value',
      header: 'Total Value',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900 tabular-nums">
          {formatCurrency(row.original.stock * row.original.unit_cost)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" title="Stock In"><ArrowDownCircle className="h-3.5 w-3.5 text-green-500" /></Button>
          <Button variant="ghost" size="icon-sm" title="Stock Out"><ArrowUpCircle className="h-3.5 w-3.5 text-red-400" /></Button>
          <Button variant="ghost" size="icon-sm"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Inventory"
        subtitle="Track school supplies, equipment, and stock levels"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Inventory' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Stock Report</Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Item</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Items" value={ITEMS.length} icon={Package} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Total Value" value={totalValue} format="currency" icon={Package} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Low Stock" value={lowStock.length} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" subtitle="Items below minimum" />
        <StatsCard title="Categories" value={CATEGORIES.length - 1} icon={TrendingDown} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Low Stock Alert — {lowStock.length} items need restocking</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStock.map(i => (
                  <span key={i.id} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    {i.name} ({i.stock} {i.unit})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cat === c ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {c}
            <span className="ml-1.5 text-xs opacity-70">
              ({c === 'All' ? ITEMS.length : ITEMS.filter(i => i.category === c).length})
            </span>
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} searchPlaceholder="Search items by name, code..." pageSize={10} />
    </div>
  );
}
