'use client';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/utils';
import { ROLE_LABELS, ROLE_COLORS } from '@/config/permissions';
import type { Staff, UserRole } from '@/types';
import { Users, GraduationCap, Briefcase, Plus, Download, Eye, Edit } from 'lucide-react';

const mockStaff: Staff[] = Array.from({ length: 25 }, (_, i) => ({
  id: `staff-${i + 1}`,
  school_id: 'school-1',
  staff_id: `TCH-${String(i + 1).padStart(3, '0')}`,
  full_name: ['Abdul Karim', 'Rashida Begum', 'Nasir Uddin', 'Momtaz Khatun', 'Iqbal Hossain',
    'Roksana Akter', 'Faruk Ahmed', 'Sultana Parveen', 'Mohibul Islam', 'Dilruba Khanam'][i % 10],
  role: (['teacher', 'teacher', 'teacher', 'accountant', 'staff', 'principal'][i % 6]) as UserRole,
  designation: ['Mathematics Teacher', 'English Teacher', 'Science Teacher', 'Accountant', 'Office Staff', 'Principal'][i % 6],
  department: ['Science', 'Arts', 'Commerce'][i % 3],
  phone: `017${String(Math.floor(10000000 + Math.random() * 90000000))}`,
  email: `staff${i + 1}@school.edu.bd`,
  joining_date: '2022-01-15',
  employment_type: i % 4 === 0 ? 'part_time' : 'full_time',
  qualification: ['M.Sc', 'B.Ed', 'MBA', 'M.A'][i % 4],
  experience_years: (i % 15) + 1,
  salary: [25000, 30000, 35000, 28000, 20000][i % 5],
  is_active: i % 8 !== 6,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const columns: ColumnDef<Staff>[] = [
  {
    accessorKey: 'full_name',
    header: 'Staff Member',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.full_name} size="sm" />
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.full_name}</p>
          <p className="text-xs text-gray-400">{row.original.staff_id} · {row.original.phone}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'designation',
    header: 'Designation',
    cell: ({ row }) => (
      <div>
        <p className="text-sm text-gray-700">{row.original.designation}</p>
        <p className="text-xs text-gray-400">{row.original.department}</p>
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[row.original.role]}`}>
        {ROLE_LABELS[row.original.role]}
      </span>
    ),
  },
  {
    accessorKey: 'qualification',
    header: 'Qualification',
    cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.qualification}</span>,
  },
  {
    accessorKey: 'experience_years',
    header: 'Exp.',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.experience_years} yrs</span>
    ),
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-gray-800">
        {row.original.salary ? formatCurrency(row.original.salary) : '–'}
      </span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'success' : 'default'}>
        {row.original.is_active ? 'Active' : 'Inactive'}
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

export default function StaffPage() {
  const teachers = mockStaff.filter((s) => s.role === 'teacher');
  const others = mockStaff.filter((s) => s.role !== 'teacher');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers & Staff"
        subtitle="Manage teaching and non-teaching staff"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Staff' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Staff</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Staff" value={mockStaff.length} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Teachers" value={teachers.length} icon={GraduationCap} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Non-Teaching" value={others.length} icon={Briefcase} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Part-time" value={mockStaff.filter((s) => s.employment_type === 'part_time').length}
          icon={Users} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <DataTable
        columns={columns}
        data={mockStaff}
        searchPlaceholder="Search by name, ID, designation..."
        pageSize={12}
      />
    </div>
  );
}
