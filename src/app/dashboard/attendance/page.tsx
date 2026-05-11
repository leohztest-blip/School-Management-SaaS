'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { Badge, AttendanceBadge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { formatDate } from '@/utils';
import { UserCheck, UserX, Clock, AlertCircle, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AttendanceStatus } from '@/types';

const mockStudents = Array.from({ length: 30 }, (_, i) => ({
  id: `s-${i + 1}`,
  name: ['Arif Hossain', 'Fatema Khatun', 'Rakib Ahmed', 'Sadia Islam', 'Mehedi Hasan',
    'Nusrat Jahan', 'Tanvir Alam', 'Riya Akter', 'Sabbir Khan', 'Mitu Begum'][i % 10],
  roll: i + 1,
  studentId: `STU-${String(i + 1).padStart(4, '0')}`,
  status: (i % 7 === 3 ? 'absent' : i % 9 === 0 ? 'late' : 'present') as AttendanceStatus,
}));

const classes = ['Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'];
const sections = ['A', 'B', 'C'];

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('Class X');
  const [selectedSection, setSelectedSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(mockStudents.map((s) => [s.id, s.status]))
  );
  const [saving, setSaving] = useState(false);

  const stats = Object.values(attendance).reduce(
    (acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }),
    {} as Record<AttendanceStatus, number>
  );

  const handleMarkAll = (status: AttendanceStatus) => {
    setAttendance(Object.fromEntries(mockStudents.map((s) => [s.id, status])));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Mark and manage daily student attendance"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Attendance' }]}
        actions={
          <Button size="sm" leftIcon={<Save className="h-4 w-4" />} loading={saving} onClick={handleSave}>
            Save Attendance
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Present" value={stats.present || 0} icon={UserCheck} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Absent" value={stats.absent || 0} icon={UserX} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatsCard title="Late" value={stats.late || 0} icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50" />
        <StatsCard title="Excused" value={stats.excused || 0} icon={AlertCircle} iconColor="text-blue-600" iconBg="bg-blue-50" />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={() => {
              const d = new Date(date); d.setDate(d.getDate() - 1);
              setDate(d.toISOString().split('T')[0]);
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button variant="outline" size="icon-sm" onClick={() => {
              const d = new Date(date); d.setDate(d.getDate() + 1);
              setDate(d.toISOString().split('T')[0]);
            }}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Class */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map((c) => <option key={c}>{c}</option>)}
          </select>

          {/* Section */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            {sections.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSection(s)}
                className={`px-4 h-9 text-sm font-medium transition-colors ${
                  selectedSection === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            <Button variant="success" size="sm" onClick={() => handleMarkAll('present')} className="text-xs">
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleMarkAll('absent')}>
              Mark All Absent
            </Button>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            <h3 className="font-semibold text-gray-900">{selectedClass} — Section {selectedSection}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(date)} · {mockStudents.length} students</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 inline-block" /> Present</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500 inline-block" /> Absent</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> Late</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
          {mockStudents.map((student) => {
            const status = attendance[student.id];
            return (
              <div key={student.id} className="bg-white p-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-6">{student.roll}</span>
                  <Avatar name={student.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.studentId}</p>
                  </div>
                  <div className="flex gap-1">
                    {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setAttendance((prev) => ({ ...prev, [student.id]: s }))}
                        className={`h-7 w-7 rounded-lg text-xs font-semibold transition-all ${
                          status === s
                            ? s === 'present' ? 'bg-green-500 text-white'
                              : s === 'absent' ? 'bg-red-500 text-white'
                              : s === 'late' ? 'bg-amber-400 text-white'
                              : 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={s}
                      >
                        {s === 'present' ? 'P' : s === 'absent' ? 'A' : s === 'late' ? 'L' : 'E'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
