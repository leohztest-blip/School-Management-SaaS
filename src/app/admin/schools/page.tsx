'use client';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/utils';
import type { School } from '@/types';
import { Building2, Users, DollarSign, TrendingUp, Eye, Edit, Shield } from 'lucide-react';

const mockSchools = Array.from({ length: 15 }, (_, i) => ({
  id: `school-${i + 1}`,
  name: ['Dhaka Model School', 'Chittagong Grammar School', 'Sylhet Public School',
    'Rajshahi Collegiate School', 'Khulna Zilla School', 'Barisal Government School'][i % 6],
  slug: `school-${i + 1}`,
  type: ['school', 'college', 'coaching'][i % 3] as School['type'],
  district: ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna'][i % 5],
  students: 100 + i * 50,
  plan: ['free', 'starter', 'professional', 'enterprise'][i % 4],
  is_active: i % 6 !== 4,
  is_verified: i % 3 !== 2,
  created_at: '2024-01-01T00:00:00',
  revenue: 25000 + i * 8000,
}));

const columns: ColumnDef<typeof mockSchools[0]>[] = [
  {
    accessorKey: 'name',
    header: 'School',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {row.original.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{row.original.name}</p>
          <p className="text-xs text-gray-400">{row.original.district} · {row.original.slug}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => <span className="capitalize text-sm text-gray-600">{row.original.type}</span>,
  },
  {
    accessorKey: 'students',
    header: 'Students',
    cell: ({ row }) => <span className="text-sm font-medium text-gray-800">{row.original.students.toLocaleString()}</span>,
  },
  {
    accessorKey: 'plan',
    header: 'Plan',
    cell: ({ row }) => {
      const colors: Record<string, 'default' | 'primary' | 'success' | 'purple'> = {
        free: 'default', starter: 'primary', professional: 'success', enterprise: 'purple',
      };
      return <Badge variant={colors[row.original.plan] || 'default'} className="capitalize">{row.original.plan}</Badge>;
    },
  },
  {
    accessorKey: 'revenue',
    header: 'MRR',
    cell: ({ row }) => <span className="text-sm font-semibold text-gray-800">{formatCurrency(row.original.revenue)}</span>,
  },
  {
    accessorKey: 'is_verified',
    header: 'Verified',
    cell: ({ row }) => (
      row.original.is_verified
        ? <Badge variant="success"><Shield className="h-3 w-3 mr-1 inline" />Verified</Badge>
        : <Badge variant="warning">Pending</Badge>
    ),
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'success' : 'danger'}>
        {row.original.is_active ? 'Active' : 'Suspended'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5 text-gray-400" /></Button>
        <Button variant="ghost" size="icon-sm"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
      </div>
    ),
  },
];

export default function AdminSchoolsPage() {
  const totalStudents = mockSchools.reduce((s, sc) => s + sc.students, 0);
  const totalRevenue = mockSchools.reduce((s, sc) => s + sc.revenue, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Schools"
        subtitle="Platform-wide school management"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Schools' }]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Schools" value={mockSchools.length} icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Total Students" value={totalStudents} icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Total MRR" value={totalRevenue} format="currency" icon={DollarSign} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Active Schools" value={mockSchools.filter((s) => s.is_active).length} icon={TrendingUp} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <DataTable
        columns={columns}
        data={mockSchools}
        searchPlaceholder="Search schools..."
        pageSize={12}
      />
    </div>
  );
}
