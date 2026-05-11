'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Plus, Edit, Trash2, Eye } from 'lucide-react';

const mockClasses = [
  { id: '1', name: 'Class VI', sections: ['A', 'B'], students: 88, teachers: 6, subjects: 8 },
  { id: '2', name: 'Class VII', sections: ['A', 'B'], students: 92, teachers: 7, subjects: 9 },
  { id: '3', name: 'Class VIII', sections: ['A', 'B'], students: 85, teachers: 7, subjects: 9 },
  { id: '4', name: 'Class IX', sections: ['A', 'B', 'C'], students: 78, teachers: 10, subjects: 11 },
  { id: '5', name: 'Class X', sections: ['A', 'B'], students: 68, teachers: 10, subjects: 11 },
];

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes & Sections"
        subtitle="Manage classes, sections, and subjects"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Classes' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<BookOpen className="h-4 w-4" />}>
              Manage Subjects
            </Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add Class
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockClasses.map((cls) => (
          <div key={cls.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{cls.name}</h3>
                  <p className="text-xs text-gray-400">{cls.sections.length} sections</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon-sm"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
                <Button variant="ghost" size="icon-sm"><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-gray-900">{cls.students}</p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-gray-900">{cls.teachers}</p>
                <p className="text-xs text-gray-400">Teachers</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-gray-900">{cls.subjects}</p>
                <p className="text-xs text-gray-400">Subjects</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {cls.sections.map((sec) => (
                <div key={sec} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-lg px-2.5 py-1 text-xs font-medium">
                  <Users className="h-3 w-3" />
                  Section {sec}
                  <span className="text-blue-400">·</span>
                  <span>{Math.floor(cls.students / cls.sections.length)}</span>
                </div>
              ))}
              <button className="bg-gray-50 text-gray-500 rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1">
                <Plus className="h-3 w-3" /> Section
              </button>
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs" leftIcon={<Eye className="h-3.5 w-3.5" />}>
              View Details
            </Button>
          </div>
        ))}

        {/* Add class card */}
        <button className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-3 hover:border-blue-300 hover:bg-blue-50/30 transition-all group min-h-[200px]">
          <div className="h-12 w-12 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-500 group-hover:text-blue-700 transition-colors">Add New Class</p>
            <p className="text-xs text-gray-400 mt-0.5">Create a class with sections</p>
          </div>
        </button>
      </div>

      {/* Subjects section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">Subjects</h3>
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Subject</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
          {['Bangla', 'English', 'Mathematics', 'General Science', 'Social Studies', 'Islam & Moral Education', 'ICT', 'Physical Education', 'Agriculture', 'BGS', 'Physics', 'Chemistry'].map((sub) => (
            <div key={sub} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors group">
              <span className="text-sm text-gray-700 font-medium">{sub}</span>
              <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
