'use client';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils';
import { ClipboardList, CheckCircle, Clock, XCircle, Eye, CheckSquare, Link } from 'lucide-react';
import type { AdmissionForm, AdmissionStatus } from '@/types/phase2';

const STATUS_CONFIG: Record<AdmissionStatus, { variant: 'success' | 'warning' | 'danger' | 'default' | 'primary' | 'cyan'; label: string }> = {
  draft:        { variant: 'default',  label: 'Draft' },
  submitted:    { variant: 'primary',  label: 'Submitted' },
  under_review: { variant: 'warning',  label: 'Under Review' },
  shortlisted:  { variant: 'cyan',     label: 'Shortlisted' },
  admitted:     { variant: 'success',  label: 'Admitted' },
  rejected:     { variant: 'danger',   label: 'Rejected' },
  waitlisted:   { variant: 'default',  label: 'Waitlisted' },
};

const mockForms: Partial<AdmissionForm & { class_name: string }>[] = [
  { id: 'af1', form_number: 'ADM-2024-001', applicant_name: 'Sakib Ahmed', applicant_name_bn: 'সাকিব আহমেদ', guardian_phone: '01712345678', class_id: 'cls-9', class_name: 'Class IX', previous_school: 'Motijheel Govt. High School', previous_gpa: 4.8, status: 'submitted', applied_at: '2024-01-10T09:00:00', admission_fee_paid: false },
  { id: 'af2', form_number: 'ADM-2024-002', applicant_name: 'Meghna Das', guardian_phone: '01812345679', class_id: 'cls-6', class_name: 'Class VI', previous_school: 'City International School', status: 'under_review', applied_at: '2024-01-11T11:00:00', admission_fee_paid: true },
  { id: 'af3', form_number: 'ADM-2024-003', applicant_name: 'Riaz Hossain', guardian_phone: '01912345670', class_id: 'cls-9', class_name: 'Class IX', previous_gpa: 4.5, status: 'shortlisted', applied_at: '2024-01-09T14:00:00', admission_fee_paid: true },
  { id: 'af4', form_number: 'ADM-2024-004', applicant_name: 'Tania Akter', guardian_phone: '01612345671', class_id: 'cls-10', class_name: 'Class X', previous_gpa: 3.9, status: 'admitted', applied_at: '2024-01-08T08:00:00', admission_fee_paid: true },
  { id: 'af5', form_number: 'ADM-2024-005', applicant_name: 'Omar Faruk', guardian_phone: '01512345672', class_id: 'cls-6', class_name: 'Class VI', status: 'rejected', applied_at: '2024-01-07T10:00:00', admission_fee_paid: false },
];

const columns: ColumnDef<typeof mockForms[0]>[] = [
  {
    accessorKey: 'form_number',
    header: 'Form No.',
    cell: ({ row }) => (
      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
        {row.original.form_number}
      </span>
    ),
  },
  {
    accessorKey: 'applicant_name',
    header: 'Applicant',
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-gray-900">{row.original.applicant_name}</p>
        {row.original.applicant_name_bn && <p className="text-xs text-gray-400">{row.original.applicant_name_bn}</p>}
      </div>
    ),
  },
  {
    id: 'class',
    header: 'Applying For',
    cell: ({ row }) => <Badge variant="primary">{row.original.class_name}</Badge>,
  },
  {
    accessorKey: 'previous_gpa',
    header: 'Previous GPA',
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-800">
        {row.original.previous_gpa ? `${row.original.previous_gpa} / 5.0` : '—'}
      </span>
    ),
  },
  {
    accessorKey: 'guardian_phone',
    header: 'Contact',
    cell: ({ row }) => <span className="text-sm text-gray-600">{row.original.guardian_phone}</span>,
  },
  {
    accessorKey: 'applied_at',
    header: 'Applied On',
    cell: ({ row }) => <span className="text-xs text-gray-500">{formatDate(row.original.applied_at || '')}</span>,
  },
  {
    accessorKey: 'admission_fee_paid',
    header: 'Fee Paid',
    cell: ({ row }) => (
      <Badge variant={row.original.admission_fee_paid ? 'success' : 'warning'}>
        {row.original.admission_fee_paid ? 'Paid' : 'Pending'}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status as AdmissionStatus];
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5 text-gray-400" /></Button>
        {row.original.status === 'shortlisted' && (
          <Button variant="ghost" size="icon-sm" className="hover:bg-green-50" title="Admit">
            <CheckSquare className="h-3.5 w-3.5 text-green-500" />
          </Button>
        )}
      </div>
    ),
  },
];

const statusCounts = Object.fromEntries(
  Object.keys(STATUS_CONFIG).map(s => [s, mockForms.filter(f => f.status === s).length])
);

export default function AdmissionPage() {
  const [activeTab, setActiveTab] = useState<'applications' | 'settings'>('applications');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Online Admissions"
        subtitle="Manage admission applications and enrollment"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Admission' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Link className="h-4 w-4" />}>
              Share Form Link
            </Button>
            <Button size="sm">Admission Settings</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard title="Total Applications" value={mockForms.length} icon={ClipboardList} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Pending Review" value={(statusCounts.submitted || 0) + (statusCounts.under_review || 0)} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Admitted" value={statusCounts.admitted || 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Rejected" value={statusCounts.rejected || 0} icon={XCircle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      {/* Pipeline view */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{statusCounts[status] || 0}</p>
            <Badge variant={cfg.variant} className="mt-1 text-xs">{cfg.label}</Badge>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['applications', 'settings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'applications' ? 'Applications' : 'Form Settings'}
          </button>
        ))}
      </div>

      {activeTab === 'applications' && (
        <DataTable
          columns={columns}
          data={mockForms as any[]}
          searchPlaceholder="Search by name, form number, phone..."
          pageSize={10}
        />
      )}

      {activeTab === 'settings' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm max-w-2xl space-y-5">
          <h3 className="font-semibold text-gray-900">Admission Form Configuration</h3>
          {[
            { label: 'Accept Applications', desc: 'Allow new admission applications', enabled: true },
            { label: 'Require Admission Fee', desc: 'Applicants must pay ৳500 to submit form', enabled: true },
            { label: 'Document Upload', desc: 'Require photo and birth certificate upload', enabled: true },
            { label: 'Auto-confirmation SMS', desc: 'Send SMS on form submission', enabled: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{s.label}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" defaultChecked={s.enabled} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Open Classes for Admission</label>
              <div className="flex flex-wrap gap-2">
                {['VI', 'VII', 'VIII', 'IX', 'X'].map(cls => (
                  <label key={cls} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked={cls !== 'X'} className="h-3.5 w-3.5 rounded" />
                    <span className="text-sm text-gray-600">Class {cls}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Admission Deadline</label>
              <input type="date" className="h-9 px-3 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="2024-02-28" />
            </div>
          </div>
          <Button>Save Settings</Button>
        </div>
      )}
    </div>
  );
}
