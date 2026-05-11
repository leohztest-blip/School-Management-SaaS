'use client';
import { useState, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/shared/stats-card';
import { formatDate } from '@/utils';
import type { Student } from '@/types';
import {
  Plus, Download, Upload, Filter, Eye, Edit, Trash2,
  GraduationCap, UserCheck, UserX, Award,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';

// Mock data
const mockStudents: Student[] = Array.from({ length: 50 }, (_, i) => ({
  id: `s-${i + 1}`,
  school_id: 'school-1',
  student_id: `STU-${String(i + 1).padStart(4, '0')}`,
  roll_number: String(i + 1),
  full_name: ['Arif Hossain', 'Fatema Khatun', 'Rakib Ahmed', 'Sadia Islam', 'Mehedi Hasan',
    'Nusrat Jahan', 'Tanvir Alam', 'Riya Akter', 'Sabbir Khan', 'Mitu Begum'][i % 10],
  gender: i % 2 === 0 ? 'male' : 'female',
  date_of_birth: '2008-03-15',
  nationality: 'Bangladeshi',
  class_id: `class-${(i % 5) + 1}`,
  section_id: `section-${(i % 3) + 1}`,
  is_active: i % 10 !== 7,
  is_scholarship: i % 8 === 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  class: { id: `class-${(i % 5) + 1}`, name: `Class ${['VI', 'VII', 'VIII', 'IX', 'X'][i % 5]}`,
    school_id: 'school-1', is_active: true, created_at: '', updated_at: '' },
  section: { id: `section-${(i % 3) + 1}`, name: ['A', 'B', 'C'][i % 3], class_id: `class-${(i % 5) + 1}`,
    school_id: 'school-1', max_students: 50, is_active: true, created_at: '', updated_at: '' },
}));

const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'full_name',
    header: 'Student',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.full_name} size="sm" />
        <div>
          <p className="font-medium text-gray-900 text-sm">{row.original.full_name}</p>
          <p className="text-xs text-gray-400">{row.original.student_id}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'class_section',
    header: 'Class / Section',
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-medium text-gray-700">{row.original.class?.name}</span>
        <span className="text-gray-400"> · Sec {row.original.section?.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'roll_number',
    header: 'Roll',
    cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.roll_number || '–'}</span>,
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => (
      <Badge variant={row.original.gender === 'male' ? 'primary' : 'purple'} className="capitalize">
        {row.original.gender}
      </Badge>
    ),
  },
  {
    id: 'scholarship',
    header: 'Scholarship',
    cell: ({ row }) =>
      row.original.is_scholarship ? (
        <Badge variant="warning">Scholarship</Badge>
      ) : null,
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
    cell: ({ row }) => (
      <div className="flex items-center gap-1 justify-end">
        <Link href={`/dashboard/students/${row.original.id}`}>
          <Button variant="ghost" size="icon-sm">
            <Eye className="h-3.5 w-3.5 text-gray-400" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon-sm">
          <Edit className="h-3.5 w-3.5 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </Button>
      </div>
    ),
  },
];

export default function StudentsPage() {
  const [view, setView] = useState<'table' | 'cards'>('table');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="Manage all enrolled students"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>
              Import
            </Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
              Export
            </Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add Student
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={218} icon={GraduationCap} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Active" value={205} icon={UserCheck} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Inactive" value={13} icon={UserX} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatsCard title="Scholarship" value={27} icon={Award} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
        <Button variant="ghost" size="sm" leftIcon={<Filter className="h-3.5 w-3.5" />} className="text-xs">
          All Classes
        </Button>
        {['VI', 'VII', 'VIII', 'IX', 'X'].map((cls) => (
          <button
            key={cls}
            className="text-xs px-3 py-1.5 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            Class {cls}
          </button>
        ))}
        <div className="ml-auto flex gap-1">
          <Button variant={view === 'table' ? 'secondary' : 'ghost'} size="sm" className="text-xs" onClick={() => setView('table')}>
            Table
          </Button>
          <Button variant={view === 'cards' ? 'secondary' : 'ghost'} size="sm" className="text-xs" onClick={() => setView('cards')}>
            Cards
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={mockStudents}
        searchPlaceholder="Search by name, ID, phone..."
        pageSize={15}
        toolbar={
          <Button variant="outline" size="sm" leftIcon={<MoreVertical className="h-4 w-4" />}>
            Bulk Actions
          </Button>
        }
      />
    </div>
  );
}
