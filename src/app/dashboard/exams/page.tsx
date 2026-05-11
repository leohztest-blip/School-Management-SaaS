'use client';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils';
import { Award, BookOpen, CheckCircle, Clock, Plus, Eye, Edit, FileText } from 'lucide-react';

interface ExamRow {
  id: string;
  name: string;
  type: string;
  class: string;
  start_date: string;
  end_date: string;
  subjects: number;
  result_published: boolean;
}

const mockExams: ExamRow[] = [
  { id: '1', name: 'First Term Examination 2024', type: 'mid_term', class: 'All Classes',
    start_date: '2024-03-10', end_date: '2024-03-20', subjects: 8, result_published: true },
  { id: '2', name: 'Second Unit Test', type: 'unit_test', class: 'Class IX & X',
    start_date: '2024-04-15', end_date: '2024-04-18', subjects: 5, result_published: false },
  { id: '3', name: 'Annual Examination 2024', type: 'final', class: 'All Classes',
    start_date: '2024-11-01', end_date: '2024-11-15', subjects: 10, result_published: false },
  { id: '4', name: 'SSC Mock Test', type: 'ssc', class: 'Class X',
    start_date: '2024-01-20', end_date: '2024-01-28', subjects: 10, result_published: true },
];

const examTypeLabels: Record<string, string> = {
  unit_test: 'Unit Test', mid_term: 'Mid Term', final: 'Final',
  ssc: 'SSC Mock', hsc: 'HSC Mock', jsc: 'JSC', psc: 'PSC',
};

const columns: ColumnDef<ExamRow>[] = [
  {
    accessorKey: 'name',
    header: 'Exam Name',
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-gray-900 text-sm">{row.original.name}</p>
        <p className="text-xs text-gray-400">{row.original.class}</p>
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="primary">{examTypeLabels[row.original.type] || row.original.type}</Badge>
    ),
  },
  {
    accessorKey: 'start_date',
    header: 'Start Date',
    cell: ({ row }) => <span className="text-sm text-gray-600">{formatDate(row.original.start_date)}</span>,
  },
  {
    accessorKey: 'end_date',
    header: 'End Date',
    cell: ({ row }) => <span className="text-sm text-gray-600">{formatDate(row.original.end_date)}</span>,
  },
  {
    accessorKey: 'subjects',
    header: 'Subjects',
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.subjects} subjects</span>
    ),
  },
  {
    accessorKey: 'result_published',
    header: 'Result',
    cell: ({ row }) => (
      row.original.result_published
        ? <Badge variant="success">Published</Badge>
        : <Badge variant="default">Pending</Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5 text-gray-400" /></Button>
        <Button variant="ghost" size="icon-sm"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
        <Button variant="ghost" size="icon-sm"><FileText className="h-3.5 w-3.5 text-blue-400" /></Button>
      </div>
    ),
  },
];

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        subtitle="Manage exam schedules, results, and grading"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Exams' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Result Sheet</Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Create Exam</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Exams" value={12} icon={Award} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Active Subjects" value={42} icon={BookOpen} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Results Published" value={8} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Pending" value={4} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <DataTable
        columns={columns}
        data={mockExams}
        searchPlaceholder="Search exams..."
        pageSize={10}
      />
    </div>
  );
}
