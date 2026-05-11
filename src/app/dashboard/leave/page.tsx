'use client';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils';
import { CheckCircle, XCircle, Clock, Calendar, Plus, Eye, Filter } from 'lucide-react';
import type { LeaveRequest } from '@/types/phase2';

const LEAVE_TYPE_LABELS: Record<string, string> = {
  casual: 'Casual', sick: 'Sick', annual: 'Annual', maternity: 'Maternity',
  paternity: 'Paternity', unpaid: 'Unpaid', compensatory: 'Compensatory', emergency: 'Emergency',
};

const STATUS_CONFIG: Record<string, { variant: 'success' | 'warning' | 'danger' | 'default' | 'primary'; label: string }> = {
  pending:   { variant: 'warning', label: 'Pending' },
  approved:  { variant: 'success', label: 'Approved' },
  rejected:  { variant: 'danger',  label: 'Rejected' },
  cancelled: { variant: 'default', label: 'Cancelled' },
  withdrawn: { variant: 'default', label: 'Withdrawn' },
};

// Mock data
const mockLeaves: any[] = [
  { id: '1', school_id: 's1', staff_id: 'st1', leave_type: 'sick', start_date: '2024-01-15', end_date: '2024-01-17', days: 3, half_day: false, reason: 'Fever and cold', status: 'approved', created_at: '2024-01-13T08:00:00', updated_at: '', reviewed_at: '2024-01-14T10:00:00', reviewed_by: 'admin', staff: { full_name: 'Abdul Karim', staff_id: 'TCH-001', designation: 'Math Teacher' } },
  { id: '2', school_id: 's1', staff_id: 'st2', leave_type: 'casual', start_date: '2024-01-18', end_date: '2024-01-18', days: 1, half_day: false, reason: 'Personal work', status: 'pending', created_at: '2024-01-16T09:00:00', updated_at: '', staff: { full_name: 'Rashida Begum', staff_id: 'TCH-002', designation: 'English Teacher' } },
  { id: '3', school_id: 's1', staff_id: 'st3', leave_type: 'annual', start_date: '2024-01-20', end_date: '2024-01-25', days: 6, half_day: false, reason: 'Family vacation', status: 'pending', created_at: '2024-01-14T11:00:00', updated_at: '', staff: { full_name: 'Nasir Uddin', staff_id: 'TCH-003', designation: 'Science Teacher' } },
  { id: '4', school_id: 's1', staff_id: 'st4', leave_type: 'sick', start_date: '2024-01-10', end_date: '2024-01-11', days: 2, half_day: false, reason: 'Medical appointment', status: 'rejected', review_note: 'Insufficient notice period', created_at: '2024-01-09T07:00:00', updated_at: '', staff: { full_name: 'Momtaz Khatun', staff_id: 'TCH-004', designation: 'Bangla Teacher' } },
];

const leaveBalances = [
  { staff_id: 'st1', name: 'Abdul Karim', casual: { allocated: 12, used: 3, remaining: 9 }, sick: { allocated: 14, used: 5, remaining: 9 }, annual: { allocated: 18, used: 0, remaining: 18 } },
  { staff_id: 'st2', name: 'Rashida Begum', casual: { allocated: 12, used: 6, remaining: 6 }, sick: { allocated: 14, used: 2, remaining: 12 }, annual: { allocated: 18, used: 5, remaining: 13 } },
];

const columns: ColumnDef<any>[] = [
  {
    id: 'employee',
    header: 'Employee',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.staff?.full_name || ''} size="sm" />
        <div>
          <p className="text-sm font-medium text-gray-900">{row.original.staff?.full_name}</p>
          <p className="text-xs text-gray-400">{row.original.staff?.staff_id} · {row.original.staff?.designation}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'leave_type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="primary">{LEAVE_TYPE_LABELS[row.original.leave_type] || row.original.leave_type}</Badge>
    ),
  },
  {
    id: 'period',
    header: 'Period',
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="text-gray-800 font-medium">{formatDate(row.original.start_date)}</span>
        {row.original.start_date !== row.original.end_date && (
          <span className="text-gray-400"> → {formatDate(row.original.end_date)}</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'days',
    header: 'Days',
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-gray-800">{row.original.days}</span>
    ),
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row }) => (
      <span className="text-sm text-gray-500 max-w-xs truncate block">{row.original.reason}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status];
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      <div className="flex gap-1">
        {row.original.status === 'pending' && (
          <>
            <Button variant="ghost" size="icon-sm" title="Approve" className="hover:bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon-sm" title="Reject" className="hover:bg-red-50">
              <XCircle className="h-4 w-4 text-red-400" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon-sm">
          <Eye className="h-3.5 w-3.5 text-gray-400" />
        </Button>
      </div>
    ),
  },
];

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'balances' | 'policies'>('requests');

  const pending = mockLeaves.filter(l => l.status === 'pending').length;
  const approved = mockLeaves.filter(l => l.status === 'approved').length;
  const rejected = mockLeaves.filter(l => l.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle="Manage staff leave requests and balances"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Leave' }]}
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
            Apply Leave
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Pending Requests" value={pending} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Approved" value={approved} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Rejected" value={rejected} icon={XCircle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatsCard title="On Leave Today" value={2} icon={Calendar} iconColor="text-blue-600" iconBg="bg-blue-50" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['requests', 'balances', 'policies'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <DataTable
          columns={columns}
          data={mockLeaves}
          searchPlaceholder="Search by employee name..."
          pageSize={10}
          toolbar={
            <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>Filter</Button>
          }
        />
      )}

      {activeTab === 'balances' && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Leave Balances — 2024</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  {['Casual', 'Sick', 'Annual'].map(t => (
                    <th key={t} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" colSpan={3}>
                      {t}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-2 text-left text-xs font-medium text-gray-400" />
                  {['Casual', 'Sick', 'Annual'].map(t => (
                    ['Alloc', 'Used', 'Rem'].map(s => (
                      <th key={`${t}-${s}`} className="px-3 py-2 text-center text-xs text-gray-400">{s}</th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaveBalances.map((lb) => (
                  <tr key={lb.staff_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{lb.name}</p>
                    </td>
                    {([lb.casual, lb.sick, lb.annual] as any[]).map((bal, i) => (
                      <>
                        <td key={`${i}-a`} className="px-3 py-3 text-center text-gray-600">{bal.allocated}</td>
                        <td key={`${i}-u`} className="px-3 py-3 text-center text-gray-600">{bal.used}</td>
                        <td key={`${i}-r`} className="px-3 py-3 text-center font-semibold text-green-700">{bal.remaining}</td>
                      </>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Policy</Button>
          </div>
          <div className="grid gap-3">
            {[
              { type: 'Casual Leave', days: 12, carry: false, notice: 1, doc: false, applicable: 'All' },
              { type: 'Sick Leave', days: 14, carry: false, notice: 0, doc: true, applicable: 'All' },
              { type: 'Annual Leave', days: 18, carry: true, notice: 7, doc: false, applicable: 'All' },
              { type: 'Maternity Leave', days: 90, carry: false, notice: 30, doc: true, applicable: 'Female' },
              { type: 'Emergency Leave', days: 3, carry: false, notice: 0, doc: false, applicable: 'All' },
            ].map((p) => (
              <div key={p.type} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-5 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="text-sm font-semibold text-gray-900">{p.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Days/Year</p>
                    <p className="text-sm font-bold text-blue-700">{p.days} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Notice Required</p>
                    <p className="text-sm text-gray-700">{p.notice} day{p.notice !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Carry Forward</p>
                    <p className="text-sm text-gray-700">{p.carry ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Applicable</p>
                    <p className="text-sm text-gray-700">{p.applicable}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
