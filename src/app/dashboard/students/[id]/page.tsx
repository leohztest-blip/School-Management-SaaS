'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge, AttendanceBadge, PaymentStatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/utils';
import {
  Edit, Phone, Mail, MapPin, Calendar, Award,
  BookOpen, UserCheck, DollarSign, FileText,
  GraduationCap, ChevronRight, Printer,
} from 'lucide-react';

// Mock student data
const student = {
  id: 'STU-0001',
  full_name: 'Arif Hossain',
  full_name_bn: 'আরিফ হোসেন',
  student_id: 'STU-0001',
  roll_number: '01',
  gender: 'male',
  date_of_birth: '2008-03-15',
  blood_group: 'B+',
  religion: 'Islam',
  nationality: 'Bangladeshi',
  photo_url: null,
  class: { name: 'Class X' },
  section: { name: 'A' },
  academic_year: { name: '2024' },
  admission_date: '2020-01-10',
  admission_number: 'ADM-2020-001',
  district: 'Dhaka',
  address: '123, Dhanmondi R/A, Dhaka-1205',
  is_active: true,
  is_scholarship: false,
  guardian: {
    full_name: 'Hossain Ali',
    relation: 'Father',
    phone: '01712345678',
    email: 'hossain.ali@email.com',
    occupation: 'Business',
    address: '123, Dhanmondi R/A, Dhaka-1205',
  },
};

const attendance = { present: 142, absent: 8, late: 3, excused: 2, total: 155, rate: 91.6 };

const invoices = [
  { month: 'January 2024', amount: 5500, paid: 5500, status: 'paid', date: '2024-01-10' },
  { month: 'February 2024', amount: 5500, paid: 5500, status: 'paid', date: '2024-02-08' },
  { month: 'March 2024', amount: 5500, paid: 2750, status: 'partial', date: '2024-03-12' },
  { month: 'April 2024', amount: 5500, paid: 0, status: 'overdue', date: null },
];

const results = [
  { exam: 'First Term 2024', bangla: 82, english: 78, math: 91, science: 85, social: 79, gpa: 4.2 },
  { exam: 'Second Term 2024', bangla: 88, english: 83, math: 95, science: 90, social: 84, gpa: 4.7 },
];

const tabs = ['Profile', 'Attendance', 'Fees', 'Results', 'Documents'];

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('Profile');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Profile"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Students', href: '/dashboard/students' },
          { label: student.full_name },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>
              Print ID Card
            </Button>
            <Button size="sm" leftIcon={<Edit className="h-4 w-4" />}>
              Edit Student
            </Button>
          </div>
        }
      />

      {/* Header card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-700" />
        <div className="px-6 pb-5">
          <div className="flex items-end gap-5 -mt-10 mb-5">
            <div className="h-20 w-20 rounded-2xl border-4 border-white shadow-sm overflow-hidden bg-blue-100 flex items-center justify-center">
              <span className="text-3xl font-bold text-blue-600">
                {student.full_name.charAt(0)}
              </span>
            </div>
            <div className="pb-1 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">{student.full_name}</h2>
                <span className="text-gray-400 text-sm">{student.full_name_bn}</span>
                <Badge variant={student.is_active ? 'success' : 'default'}>
                  {student.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {student.is_scholarship && <Badge variant="warning">Scholarship</Badge>}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {student.class.name} — Section {student.section.name}
                </span>
                <span>Roll: {student.roll_number}</span>
                <span>ID: {student.student_id}</span>
              </div>
            </div>
            <div className="hidden sm:flex gap-3 pb-1">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{attendance.rate}%</p>
                <p className="text-xs text-gray-400">Attendance</p>
              </div>
              <div className="h-10 w-px bg-gray-100" />
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">4.5</p>
                <p className="text-xs text-gray-400">Last GPA</p>
              </div>
              <div className="h-10 w-px bg-gray-100" />
              <div className="text-center">
                <p className="text-lg font-bold text-red-500">{formatCurrency(5500)}</p>
                <p className="text-xs text-gray-400">Due</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
                  ${activeTab === tab
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'Profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Personal Info */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Full Name', value: student.full_name },
                { label: 'Name (Bangla)', value: student.full_name_bn },
                { label: 'Date of Birth', value: formatDate(student.date_of_birth) },
                { label: 'Gender', value: student.gender === 'male' ? 'Male' : 'Female' },
                { label: 'Blood Group', value: student.blood_group },
                { label: 'Religion', value: student.religion },
                { label: 'Nationality', value: student.nationality },
                { label: 'District', value: student.district },
                { label: 'Admission Date', value: formatDate(student.admission_date) },
                { label: 'Admission No.', value: student.admission_number },
              ].map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-gray-400 mb-0.5">{field.label}</p>
                  <p className="text-sm font-medium text-gray-800">{field.value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-0.5">Address</p>
              <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" /> {student.address}
              </p>
            </div>
          </div>

          {/* Guardian Info */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Guardian</h3>
                <Badge variant="primary">{student.guardian.relation}</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={student.guardian.full_name} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900">{student.guardian.full_name}</p>
                    <p className="text-xs text-gray-400">{student.guardian.occupation}</p>
                  </div>
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <a href={`tel:${student.guardian.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {student.guardian.phone}
                  </a>
                  <a href={`mailto:${student.guardian.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {student.guardian.email}
                  </a>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    {student.guardian.address}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Attendance Rate', value: `${attendance.rate}%`, color: 'text-green-600' },
                  { label: 'Present Days', value: `${attendance.present}/${attendance.total}`, color: 'text-blue-600' },
                  { label: 'Fees Paid', value: formatCurrency(11000), color: 'text-green-600' },
                  { label: 'Fees Due', value: formatCurrency(8250), color: 'text-red-600' },
                  { label: 'Last GPA', value: '4.5 / 5.0', color: 'text-purple-600' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{s.label}</span>
                    <span className={`font-semibold ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Attendance' && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900">Attendance Record</h3>
            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-green-600">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Present: {attendance.present}
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Absent: {attendance.absent}
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Late: {attendance.late}
              </span>
            </div>
          </div>

          {/* Calendar-style view placeholder */}
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2; // offset for month start
              if (day < 0 || day >= 30) return <div key={i} />;
              const status = day % 7 === 0 || day % 7 === 6 ? 'weekend' :
                day === 5 || day === 18 ? 'absent' :
                day === 12 ? 'late' : 'present';
              return (
                <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium
                  ${status === 'weekend' ? 'text-gray-300' :
                    status === 'present' ? 'bg-green-100 text-green-700' :
                    status === 'absent' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'}`}>
                  {day + 1}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-3">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-100" /> Present</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-100" /> Absent</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-100" /> Late</span>
          </div>
        </div>
      )}

      {activeTab === 'Fees' && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Fee History</h3>
            <Button size="sm" leftIcon={<DollarSign className="h-4 w-4" />}>Collect Payment</Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800">{inv.month}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{formatCurrency(inv.amount)}</td>
                  <td className="px-5 py-3 text-right text-green-700 font-medium">{formatCurrency(inv.paid)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={inv.amount - inv.paid > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                      {formatCurrency(inv.amount - inv.paid)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <PaymentStatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-3 text-gray-400">{inv.date ? formatDate(inv.date) : '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t border-gray-100">
                <td className="px-5 py-3 font-semibold text-gray-800">Total</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-800">{formatCurrency(invoices.reduce((s, i) => s + i.amount, 0))}</td>
                <td className="px-5 py-3 text-right font-semibold text-green-700">{formatCurrency(invoices.reduce((s, i) => s + i.paid, 0))}</td>
                <td className="px-5 py-3 text-right font-semibold text-red-600">{formatCurrency(invoices.reduce((s, i) => s + (i.amount - i.paid), 0))}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {activeTab === 'Results' && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Exam Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Bangla</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">English</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Math</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Science</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Social</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-800">{r.exam}</td>
                    {[r.bangla, r.english, r.math, r.science, r.social].map((mark, j) => (
                      <td key={j} className="px-5 py-3 text-center">
                        <span className={`font-semibold ${mark >= 80 ? 'text-green-600' : mark >= 60 ? 'text-blue-600' : 'text-red-500'}`}>
                          {mark}
                        </span>
                      </td>
                    ))}
                    <td className="px-5 py-3 text-center">
                      <span className="font-bold text-purple-600">{r.gpa}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Documents' && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Documents</h3>
            <Button size="sm" leftIcon={<FileText className="h-4 w-4" />}>Upload Document</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['Birth Certificate', 'Previous School TC', 'Passport Photo', 'NID of Guardian'].map((doc) => (
              <div key={doc} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 cursor-pointer group transition-colors">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{doc}</p>
                <p className="text-xs text-gray-400 mt-0.5">PDF · 245 KB</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
