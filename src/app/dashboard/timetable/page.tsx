'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { label: 'Period 1', time: '08:00 – 08:45' },
  { label: 'Period 2', time: '08:45 – 09:30' },
  { label: 'Break',   time: '09:30 – 09:45', isBreak: true },
  { label: 'Period 3', time: '09:45 – 10:30' },
  { label: 'Period 4', time: '10:30 – 11:15' },
  { label: 'Break',   time: '11:15 – 11:30', isBreak: true },
  { label: 'Period 5', time: '11:30 – 12:15' },
  { label: 'Period 6', time: '12:15 – 01:00' },
  { label: 'Lunch',   time: '01:00 – 01:45', isBreak: true },
  { label: 'Period 7', time: '01:45 – 02:30' },
  { label: 'Period 8', time: '02:30 – 03:15' },
];

// Timetable data: [dayIndex][periodIndex] = { subject, teacher, room, color }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TIMETABLE: Record<string, any> = {
  'Class X-A': {
    0: { // Sunday
      0: { subject: 'Mathematics',  teacher: 'Mr. Karim',   room: '301', color: 'bg-blue-50   text-blue-700   border-blue-200' },
      1: { subject: 'Physics',      teacher: 'Mr. Nasir',   room: '301', color: 'bg-purple-50  text-purple-700  border-purple-200' },
      3: { subject: 'English',      teacher: 'Ms. Rashida', room: '301', color: 'bg-green-50   text-green-700   border-green-200' },
      4: { subject: 'Chemistry',    teacher: 'Ms. Mitu',    room: 'Lab', color: 'bg-amber-50   text-amber-700   border-amber-200' },
      6: { subject: 'ICT',          teacher: 'Mr. Iqbal',   room: 'Lab', color: 'bg-cyan-50    text-cyan-700    border-cyan-200' },
      7: { subject: 'Bangla',       teacher: 'Ms. Momtaz',  room: '301', color: 'bg-red-50     text-red-700     border-red-200' },
      9: { subject: 'Biology',      teacher: 'Ms. Parveen', room: 'Lab', color: 'bg-teal-50    text-teal-700    border-teal-200' },
      10:{ subject: 'Social Studies',teacher:'Mr. Faruk',   room: '301', color: 'bg-indigo-50  text-indigo-700  border-indigo-200' },
    },
    1: { // Monday
      0: { subject: 'Physics',      teacher: 'Mr. Nasir',   room: '301', color: 'bg-purple-50  text-purple-700  border-purple-200' },
      1: { subject: 'Bangla',       teacher: 'Ms. Momtaz',  room: '301', color: 'bg-red-50     text-red-700     border-red-200' },
      3: { subject: 'Mathematics',  teacher: 'Mr. Karim',   room: '301', color: 'bg-blue-50   text-blue-700   border-blue-200' },
      4: { subject: 'ICT',          teacher: 'Mr. Iqbal',   room: 'Lab', color: 'bg-cyan-50    text-cyan-700    border-cyan-200' },
      6: { subject: 'English',      teacher: 'Ms. Rashida', room: '301', color: 'bg-green-50   text-green-700   border-green-200' },
      7: { subject: 'Chemistry',    teacher: 'Ms. Mitu',    room: 'Lab', color: 'bg-amber-50   text-amber-700   border-amber-200' },
      9: { subject: 'Social Studies',teacher:'Mr. Faruk',   room: '301', color: 'bg-indigo-50  text-indigo-700  border-indigo-200' },
      10:{ subject: 'Biology',      teacher: 'Ms. Parveen', room: 'Lab', color: 'bg-teal-50    text-teal-700    border-teal-200' },
    },
    2: { // Tuesday
      0: { subject: 'English',      teacher: 'Ms. Rashida', room: '301', color: 'bg-green-50   text-green-700   border-green-200' },
      1: { subject: 'Mathematics',  teacher: 'Mr. Karim',   room: '301', color: 'bg-blue-50   text-blue-700   border-blue-200' },
      3: { subject: 'Biology',      teacher: 'Ms. Parveen', room: 'Lab', color: 'bg-teal-50    text-teal-700    border-teal-200' },
      4: { subject: 'Bangla',       teacher: 'Ms. Momtaz',  room: '301', color: 'bg-red-50     text-red-700     border-red-200' },
      6: { subject: 'Physics',      teacher: 'Mr. Nasir',   room: '301', color: 'bg-purple-50  text-purple-700  border-purple-200' },
      7: { subject: 'ICT',          teacher: 'Mr. Iqbal',   room: 'Lab', color: 'bg-cyan-50    text-cyan-700    border-cyan-200' },
      9: { subject: 'Chemistry',    teacher: 'Ms. Mitu',    room: 'Lab', color: 'bg-amber-50   text-amber-700   border-amber-200' },
      10:{ subject: 'Social Studies',teacher:'Mr. Faruk',   room: '301', color: 'bg-indigo-50  text-indigo-700  border-indigo-200' },
    },
  },
};

const CLASSES = ['Class X-A', 'Class X-B', 'Class IX-A', 'Class IX-B', 'Class VIII-A'];

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState('Class X-A');
  const schedule = TIMETABLE[selectedClass] || TIMETABLE['Class X-A'];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Timetable"
        subtitle="Manage class schedules and period assignments"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Timetable' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />}>Print</Button>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export</Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Edit Schedule</Button>
          </div>
        }
      />

      {/* Class selector */}
      <div className="card p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Class:</label>
          <div className="flex flex-wrap gap-1.5">
            {CLASSES.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedClass === cls
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable grid */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <div>
            <h3 className="section-title">{selectedClass} — Weekly Schedule</h3>
            <p className="text-xs text-gray-400 mt-0.5">Academic Year 2024 · 8 periods per day</p>
          </div>
          <Button variant="ghost" size="sm" leftIcon={<Edit className="h-4 w-4" />}>Edit Timetable</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="w-28 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Period / Time</th>
                {DAYS.map(day => (
                  <th key={day} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[130px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {PERIODS.map((period, periodIdx) => (
                <tr key={periodIdx} className={period.isBreak ? 'bg-gray-50/80' : 'hover:bg-blue-50/20 transition-colors'}>
                  {/* Period label */}
                  <td className="px-4 py-2.5 border-r border-gray-100">
                    {period.isBreak ? (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{period.label}</p>
                        <p className="text-xs text-gray-300 mt-0.5">{period.time}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-gray-700">{period.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{period.time}</p>
                      </div>
                    )}
                  </td>

                  {/* Day cells */}
                  {DAYS.map((_, dayIdx) => {
                    const cell = schedule[dayIdx]?.[periodIdx];
                    if (period.isBreak) {
                      return (
                        <td key={dayIdx} className="px-3 py-2 text-center text-xs text-gray-300 font-medium">
                          — {period.label} —
                        </td>
                      );
                    }
                    return (
                      <td key={dayIdx} className="px-3 py-2">
                        {cell ? (
                          <div className={`rounded-lg border px-2.5 py-2 cursor-pointer hover:shadow-sm transition-all ${cell.color}`}>
                            <p className="font-semibold text-xs leading-tight truncate">{cell.subject}</p>
                            <p className="text-[10px] opacity-70 mt-0.5 truncate">{cell.teacher}</p>
                            <p className="text-[10px] opacity-60 font-mono">Room {cell.room}</p>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-gray-200 px-2.5 py-2 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors group">
                            <Plus className="h-3 w-3 text-gray-300 group-hover:text-blue-400 mx-auto" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="card-footer">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-gray-500">Subjects:</span>
            {[
              { name: 'Mathematics', color: 'bg-blue-100 text-blue-700' },
              { name: 'Physics',     color: 'bg-purple-100 text-purple-700' },
              { name: 'Chemistry',   color: 'bg-amber-100 text-amber-700' },
              { name: 'Biology',     color: 'bg-teal-100 text-teal-700' },
              { name: 'English',     color: 'bg-green-100 text-green-700' },
              { name: 'Bangla',      color: 'bg-red-100 text-red-700' },
              { name: 'ICT',         color: 'bg-cyan-100 text-cyan-700' },
            ].map(s => (
              <span key={s.name} className={`text-xs font-medium px-2 py-0.5 rounded ${s.color}`}>{s.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
