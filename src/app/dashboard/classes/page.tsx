'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Plus, Edit, Trash2, Eye, Clock3, School } from 'lucide-react';

const mockClasses = [
  {
    id: '1',
    className: 'Class 1-A',
    section: 'A',
    teacher: 'Ayesha Rahman',
    studentCount: 32,
    subjects: ['Mathematics', 'English', 'Science'],
    room: 'Room 201',
    schedule: 'Sun-Thu, 8:00 AM - 1:30 PM',
  },
  {
    id: '2',
    className: 'Class 2-B',
    section: 'B',
    teacher: 'John Smith',
    studentCount: 30,
    subjects: ['Mathematics', 'English', 'Science', 'Bangla'],
    room: 'Room 204',
    schedule: 'Sun-Thu, 8:00 AM - 1:30 PM',
  },
  {
    id: '3',
    className: 'Class 3-C',
    section: 'C',
    teacher: 'Fatima Akter',
    studentCount: 34,
    subjects: ['Mathematics', 'English', 'Social Studies', 'Science'],
    room: 'Room 301',
    schedule: 'Sun-Thu, 8:30 AM - 2:00 PM',
  },
  {
    id: '4',
    className: 'Class 4-D',
    section: 'D',
    teacher: 'Karim Hasan',
    studentCount: 29,
    subjects: ['Mathematics', 'English', 'Science', 'Bangla'],
    room: 'Room 305',
    schedule: 'Sun-Thu, 8:30 AM - 2:00 PM',
  },
];

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Sections"
        subtitle="Manage classes, sections, subjects, and student capacity"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Classes & Sections' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<BookOpen className="h-4 w-4" />}>
              Export
            </Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add Class
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockClasses.map((cls) => (
          <section key={cls.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <School className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{cls.className}</h3>
                  <p className="text-xs text-gray-500">Class Teacher: {cls.teacher}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon-sm" aria-label="Edit class"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
                <Button variant="ghost" size="icon-sm" aria-label="Delete class"><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Student Count</p>
                <p className="text-lg font-bold text-gray-900">{cls.studentCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Room</p>
                <p className="text-lg font-bold text-gray-900">{cls.room}</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {cls.subjects.map((subject) => (
                  <Badge key={subject} variant="outline">{subject}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Capacity: {cls.studentCount}/40</div>
              <div className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{cls.schedule}</div>
            </div>

            <Button variant="outline" size="sm" className="w-full" leftIcon={<Eye className="h-3.5 w-3.5" />}>
              View Details
            </Button>
          </section>
        ))}
      </div>
    </div>
  );
}
