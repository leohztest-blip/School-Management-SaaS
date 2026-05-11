'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/utils';
import { Bell, Plus, Send, Users, Megaphone, BookOpen, DollarSign, CheckCircle, Filter } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'alert', title: 'School Closed Tomorrow', body: 'Dear students and parents, our school will remain closed tomorrow due to national holiday. Classes will resume on Monday.', audience: 'All', sent_at: '2024-01-15T10:00:00', is_sms: true, is_email: true, read_count: 185 },
  { id: 2, type: 'payment', title: 'Fee Due Reminder', body: 'This is a reminder that January 2024 tuition fees are due on January 15. Please make payment to avoid late fees.', audience: 'Guardians', sent_at: '2024-01-13T09:00:00', is_sms: true, is_email: false, read_count: 120 },
  { id: 3, type: 'exam', title: 'Final Exam Schedule Released', body: 'The annual examination schedule for 2024 has been published. Please check the notice board or school website for details.', audience: 'All', sent_at: '2024-01-10T14:30:00', is_sms: false, is_email: true, read_count: 210 },
  { id: 4, type: 'attendance', title: 'Low Attendance Warning', body: 'Student Mehedi Hasan (Class X-A) attendance has dropped below 75%. Please contact the school office.', audience: 'Guardian', sent_at: '2024-01-09T11:00:00', is_sms: true, is_email: false, read_count: 1 },
  { id: 5, type: 'info', title: 'Parent-Teacher Meeting', body: 'A Parent-Teacher meeting is scheduled for January 20, 2024 from 10 AM to 2 PM. All parents are requested to attend.', audience: 'Guardians', sent_at: '2024-01-08T16:00:00', is_sms: true, is_email: true, read_count: 145 },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  alert: { icon: Megaphone, color: 'text-red-600', bg: 'bg-red-50' },
  payment: { icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
  exam: { icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
  attendance: { icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  info: { icon: Bell, color: 'text-green-600', bg: 'bg-green-50' },
};

export default function NotificationsPage() {
  const [showCompose, setShowCompose] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notices & Notifications"
        subtitle="Send and manage school announcements"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Notifications' }]}
        actions={
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowCompose(true)}>
            New Notice
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            {['All', 'SMS', 'Email', 'Push'].map((f) => (
              <button key={f} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mockNotifications.map((notif) => {
              const cfg = typeConfig[notif.type] || typeConfig.info;
              const Icon = cfg.icon;
              return (
                <div key={notif.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    <div className={`h-10 w-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                        <span className="text-xs text-gray-400 shrink-0">{formatDateTime(notif.sent_at)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{notif.body}</p>
                      <div className="flex items-center gap-3 mt-2.5">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Users className="h-3 w-3" /> {notif.audience}
                        </span>
                        {notif.is_sms && <Badge variant="default" className="text-xs">SMS</Badge>}
                        {notif.is_email && <Badge variant="primary" className="text-xs">Email</Badge>}
                        <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                          <CheckCircle className="h-3 w-3 text-green-500" /> {notif.read_count} read
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compose Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Compose Notice</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Title</label>
                <input
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notice title..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Send To</label>
                <select className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All (Students + Parents)</option>
                  <option>All Students</option>
                  <option>All Guardians</option>
                  <option>All Teachers</option>
                  <option>Class X only</option>
                  <option>Specific Students</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={5}
                  placeholder="Write your notice here..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Send via</label>
                <div className="flex gap-3">
                  {[
                    { id: 'push', label: 'App' },
                    { id: 'sms', label: 'SMS' },
                    { id: 'email', label: 'Email' },
                  ].map((c) => (
                    <label key={c.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" defaultChecked={c.id === 'push'} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600" />
                      <span className="text-xs text-gray-600">{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Schedule (optional)</label>
                <input type="datetime-local" className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <Button className="w-full" leftIcon={<Send className="h-4 w-4" />}>
                Send Notice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
