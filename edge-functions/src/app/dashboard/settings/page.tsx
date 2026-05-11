'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { BANGLADESH_DISTRICTS } from '@/utils';
import {
  Building2, Palette, Bell, Shield, CreditCard,
  Globe, Users, Database, Save, Upload, Download, ChevronRight,
} from 'lucide-react';

const settingsSections = [
  { id: 'school', label: 'School Profile', icon: Building2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Access', icon: Shield },
  { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
  { id: 'academic', label: 'Academic Settings', icon: Globe },
  { id: 'roles', label: 'Roles & Permissions', icon: Users },
  { id: 'data', label: 'Data & Backup', icon: Database },
];

const inputClass = 'w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('school');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Configure your school's preferences and integrations"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]}
      />

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-52 shrink-0">
          <nav className="space-y-0.5 bg-white border border-gray-100 rounded-xl p-2 shadow-sm">
            {settingsSections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${activeSection === s.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            {activeSection === 'school' && <SchoolProfileSection onSave={handleSave} saving={saving} />}
            {activeSection === 'branding' && <BrandingSection onSave={handleSave} saving={saving} />}
            {activeSection === 'notifications' && <NotificationsSection onSave={handleSave} saving={saving} />}
            {activeSection === 'payment' && <PaymentGatewaysSection onSave={handleSave} saving={saving} />}
            {activeSection === 'academic' && <AcademicSection onSave={handleSave} saving={saving} />}
            {activeSection === 'security' && <SecuritySection />}
            {activeSection === 'roles' && <RolesSection />}
            {activeSection === 'data' && <DataSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function SchoolProfileSection({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div>
      <SectionHeader title="School Profile" subtitle="Basic information about your institution" />
      <div className="space-y-5">
        {/* Logo upload */}
        <div>
          <label className={labelClass}>School Logo</label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">S</div>
            <div>
              <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>Upload Logo</Button>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB. Recommended 200×200px</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>School Name *</label>
            <input className={inputClass} defaultValue="Dhaka Model School & College" />
          </div>
          <div>
            <label className={labelClass}>School Name (Bangla)</label>
            <input className={inputClass} placeholder="ঢাকা মডেল স্কুল অ্যান্ড কলেজ" />
          </div>
          <div>
            <label className={labelClass}>EIIN Number</label>
            <input className={inputClass} defaultValue="108459" placeholder="Enter EIIN" />
          </div>
          <div>
            <label className={labelClass}>Institution Type</label>
            <select className={inputClass}>
              <option>School</option>
              <option>College</option>
              <option>School & College</option>
              <option>Coaching Center</option>
              <option>Madrasa</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} defaultValue="02-1234567" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} defaultValue="info@dhakamsc.edu.bd" type="email" />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input className={inputClass} defaultValue="https://dhakamsc.edu.bd" />
          </div>
          <div>
            <label className={labelClass}>Established Year</label>
            <input className={inputClass} defaultValue="1985" type="number" />
          </div>
          <div>
            <label className={labelClass}>District</label>
            <select className={inputClass}>
              {BANGLADESH_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Principal Name</label>
            <input className={inputClass} defaultValue="Prof. Abdul Karim" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            defaultValue="123 Main Road, Dhanmondi, Dhaka-1205"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function BrandingSection({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const [primaryColor, setPrimaryColor] = useState('#1e40af');
  const [secondaryColor, setSecondaryColor] = useState('#3b82f6');

  return (
    <div>
      <SectionHeader title="Branding" subtitle="Customize your school's visual identity" />
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-12 rounded border border-gray-200 cursor-pointer p-0.5" />
              <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                className={`${inputClass} flex-1 font-mono uppercase`} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Secondary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-9 w-12 rounded border border-gray-200 cursor-pointer p-0.5" />
              <input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)}
                className={`${inputClass} flex-1 font-mono uppercase`} />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Preview</label>
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-center gap-3 p-3 rounded-lg text-white" style={{ background: primaryColor }}>
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">S</div>
              <span className="font-semibold">Your School Name</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: primaryColor }}>
                Primary Button
              </button>
              <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: secondaryColor }}>
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Custom Domain</label>
          <div className="flex items-center gap-2">
            <input className={`${inputClass} flex-1`} placeholder="school.yourdomain.com" />
            <Button variant="outline" size="sm">Verify</Button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Point your domain CNAME to: platform.shiksha-erp.com</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save Branding
          </Button>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const toggles = [
    { label: 'Attendance SMS to Guardian', desc: 'Send SMS when student is absent', enabled: true },
    { label: 'Fee Due Reminder', desc: 'Remind guardians 3 days before due date', enabled: true },
    { label: 'Exam Schedule', desc: 'Notify students of upcoming exams', enabled: true },
    { label: 'Result Published', desc: 'Notify when exam results are published', enabled: false },
    { label: 'New Notice', desc: 'Push notification for new school notices', enabled: true },
    { label: 'Payment Confirmation', desc: 'Send receipt after successful payment', enabled: true },
  ];

  return (
    <div>
      <SectionHeader title="Notification Settings" subtitle="Configure SMS, email, and push notifications" />
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>SMS Provider</label>
            <select className={inputClass}>
              <option>SSL Wireless</option>
              <option>Muthofun</option>
              <option>Twilio</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>SMS API Key</label>
            <input className={inputClass} type="password" placeholder="Enter SMS API key" />
          </div>
          <div>
            <label className={labelClass}>Sender ID</label>
            <input className={inputClass} defaultValue="SHIKSHA" maxLength={11} />
          </div>
          <div>
            <label className={labelClass}>SMS Balance</label>
            <div className="flex items-center gap-2">
              <input className={`${inputClass} flex-1`} readOnly value="1,245 SMS remaining" />
              <Button variant="outline" size="sm">Recharge</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Notification Events</h3>
          <div className="space-y-3">
            {toggles.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
                <label className="relative inline-flex cursor-pointer">
                  <input type="checkbox" defaultChecked={t.enabled} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save Notifications
          </Button>
        </div>
      </div>
    </div>
  );
}

function PaymentGatewaysSection({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const gateways = [
    { name: 'bKash', logo: '৳', color: 'bg-pink-500', enabled: true },
    { name: 'Nagad', logo: 'N', color: 'bg-orange-500', enabled: true },
    { name: 'Rocket', logo: 'R', color: 'bg-purple-500', enabled: false },
    { name: 'SSLCommerz', logo: 'S', color: 'bg-blue-500', enabled: true },
  ];

  return (
    <div>
      <SectionHeader title="Payment Gateways" subtitle="Configure payment methods for fee collection" />
      <div className="space-y-4">
        {gateways.map((g) => (
          <div key={g.name} className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-10 w-10 rounded-xl ${g.color} flex items-center justify-center text-white font-bold`}>
                {g.logo}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{g.name}</p>
                <p className="text-xs text-gray-400">Mobile banking integration</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" defaultChecked={g.enabled} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
            {g.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">App Key / Merchant ID</label>
                  <input className={inputClass} type="password" placeholder="Enter credentials" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">App Secret / API Key</label>
                  <input className={inputClass} type="password" placeholder="Enter secret" />
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <Button onClick={onSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save Gateway Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

function AcademicSection({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div>
      <SectionHeader title="Academic Settings" subtitle="Configure academic year, grading, and curriculum" />
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Academic Year Start Month</label>
            <select className={inputClass}>
              <option value="1">January</option>
              <option value="4">April</option>
              <option value="7">July</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Grading System</label>
            <select className={inputClass}>
              <option>GPA (5-point scale)</option>
              <option>Percentage</option>
              <option>Letter Grade</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Attendance Type</label>
            <select className={inputClass}>
              <option>Daily</option>
              <option>Period-wise</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Fee Due Day (of month)</label>
            <input type="number" min={1} max={31} defaultValue={10} className={inputClass} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Features</h3>
          {[
            { label: 'Bangla Date Support', desc: 'Show Bengali calendar alongside Gregorian' },
            { label: 'Board Registration', desc: 'Track SSC/HSC board registration numbers' },
            { label: 'Period-wise Attendance', desc: 'Mark attendance for each class period' },
            { label: 'SMS Alerts', desc: 'Send SMS for attendance and fee reminders' },
          ].map((f, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{f.label}</p>
                <p className="text-xs text-gray-400">{f.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} loading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save Academic Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div>
      <SectionHeader title="Security & Access" subtitle="Manage authentication and access control" />
      <div className="space-y-4">
        {[
          { label: 'Two-Factor Authentication', desc: 'Require 2FA for admin accounts', enabled: false },
          { label: 'IP Allowlist', desc: 'Restrict access to specific IP addresses', enabled: false },
          { label: 'Session Timeout', desc: 'Auto logout after 30 minutes of inactivity', enabled: true },
          { label: 'Audit Logging', desc: 'Log all admin actions for compliance', enabled: true },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-900">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
            </div>
            <label className="relative inline-flex cursor-pointer">
              <input type="checkbox" defaultChecked={s.enabled} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function RolesSection() {
  const roles = [
    { name: 'School Admin', members: 2, perms: 18 },
    { name: 'Principal', members: 1, perms: 14 },
    { name: 'Teacher', members: 18, perms: 6 },
    { name: 'Accountant', members: 2, perms: 8 },
    { name: 'Staff', members: 8, perms: 3 },
    { name: 'Guardian', members: 195, perms: 4 },
    { name: 'Student', members: 218, perms: 3 },
  ];

  return (
    <div>
      <SectionHeader title="Roles & Permissions" subtitle="View and manage role-based access control" />
      <div className="space-y-2">
        {roles.map((r) => (
          <div key={r.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-400">{r.members} members · {r.perms} permissions</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}

function DataSection() {
  return (
    <div>
      <SectionHeader title="Data & Backup" subtitle="Manage your school data and backups" />
      <div className="space-y-4">
        <div className="p-4 border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900">Export All Data</p>
              <p className="text-xs text-gray-400 mt-0.5">Download a complete backup of all school data</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>Export CSV</Button>
          </div>
        </div>
        <div className="p-4 border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Import Students</p>
              <p className="text-xs text-gray-400 mt-0.5">Bulk import students from Excel/CSV</p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>Import</Button>
          </div>
        </div>
        <div className="p-4 border border-red-100 bg-red-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-red-800">Danger Zone</p>
              <p className="text-xs text-red-500 mt-0.5">Permanently delete all data. Cannot be undone.</p>
            </div>
            <Button variant="destructive" size="sm">Reset Data</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
