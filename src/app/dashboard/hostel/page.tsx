'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils';
import { Home, Users, DoorOpen, AlertCircle, Plus, Eye, Edit } from 'lucide-react';

const HOSTELS = [
  {
    id: 'h1', name: 'Boys Hostel — Block A', gender: 'male', capacity: 120, occupied: 98,
    monthly_fee: 4500, warden: 'Mr. Hasan Ali', floors: 4,
    rooms: [
      { number: '101', type: 'double',   capacity: 2, occupied: 2, status: 'occupied',  students: ['Arif Hossain', 'Rakib Ahmed'] },
      { number: '102', type: 'double',   capacity: 2, occupied: 1, status: 'available', students: ['Tanvir Alam'] },
      { number: '103', type: 'triple',   capacity: 3, occupied: 3, status: 'occupied',  students: ['Mehedi Hasan', 'Sabbir Khan', 'Omar Faruk'] },
      { number: '104', type: 'single',   capacity: 1, occupied: 0, status: 'available', students: [] },
      { number: '105', type: 'double',   capacity: 2, occupied: 2, status: 'occupied',  students: ['Riaz Hossain', 'Sakib Ahmed'] },
      { number: '201', type: 'double',   capacity: 2, occupied: 0, status: 'maintenance', students: [] },
      { number: '202', type: 'triple',   capacity: 3, occupied: 3, status: 'occupied',  students: ['Farhan Ahmed', 'Nayeem Islam', 'Riad Hasan'] },
      { number: '203', type: 'double',   capacity: 2, occupied: 2, status: 'occupied',  students: ['Arafat Khan', 'Imran Hossain'] },
    ],
  },
  {
    id: 'h2', name: 'Girls Hostel — Block B', gender: 'female', capacity: 80, occupied: 65,
    monthly_fee: 4500, warden: 'Ms. Sultana Begum', floors: 3,
    rooms: [
      { number: '101', type: 'double', capacity: 2, occupied: 2, status: 'occupied',  students: ['Fatema Khatun', 'Sadia Islam'] },
      { number: '102', type: 'double', capacity: 2, occupied: 2, status: 'occupied',  students: ['Nusrat Jahan', 'Riya Akter'] },
      { number: '103', type: 'triple', capacity: 3, occupied: 2, status: 'available', students: ['Tania Akter', 'Meghna Das'] },
      { number: '104', type: 'single', capacity: 1, occupied: 1, status: 'occupied',  students: ['Dilruba Khanam'] },
    ],
  },
];

const ROOM_TYPE_LABELS: Record<string, string> = { single: 'Single', double: 'Double', triple: 'Triple', dormitory: 'Dorm' };
const ROOM_STATUS_COLORS: Record<string, string> = {
  occupied:    'bg-blue-50   text-blue-700   border-blue-200',
  available:   'bg-green-50  text-green-700  border-green-200',
  maintenance: 'bg-amber-50  text-amber-700  border-amber-200',
  reserved:    'bg-purple-50 text-purple-700 border-purple-200',
};
const ROOM_STATUS_PILLS: Record<string, string> = {
  occupied: 'pill pill-blue', available: 'pill pill-green', maintenance: 'pill pill-amber', reserved: 'pill pill-purple',
};

export default function HostelPage() {
  const [selected, setSelected] = useState(HOSTELS[0].id);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const hostel = HOSTELS.find(h => h.id === selected)!;
  const available = hostel.rooms.filter(r => r.status === 'available' && r.occupied < r.capacity).length;
  const totalCapacity = hostel.rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = hostel.rooms.reduce((s, r) => s + r.occupied, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Hostel Management"
        subtitle="Manage dormitories, room allocations, and residents"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Hostel' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Add Hostel</Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Allocate Room</Button>
          </div>
        }
      />

      {/* Hostel tabs */}
      <div className="flex gap-3">
        {HOSTELS.map(h => (
          <button
            key={h.id}
            onClick={() => setSelected(h.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              selected === h.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${h.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${selected === h.id ? 'text-blue-700' : 'text-gray-900'}`}>{h.name}</p>
              <p className="text-xs text-gray-400">{h.occupied}/{h.capacity} occupied · Warden: {h.warden}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Capacity" value={totalCapacity} icon={Home} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Occupied" value={totalOccupied} icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50"
          subtitle={`${Math.round((totalOccupied/totalCapacity)*100)}% occupancy rate`} />
        <StatsCard title="Available Rooms" value={available} icon={DoorOpen} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Monthly Revenue" value={hostel.monthly_fee * hostel.occupied}
          format="currency" icon={AlertCircle} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      {/* Room grid */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="section-title">{hostel.name}</h3>
            <p className="section-subtitle">Floor-wise room overview · {hostel.rooms.length} rooms</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              {[['occupied','bg-blue-500'],['available','bg-green-500'],['maintenance','bg-amber-400']].map(([s,c]) => (
                <span key={s} className="flex items-center gap-1 ml-3">
                  <span className={`h-2.5 w-2.5 rounded-sm ${c}`} />
                  <span className="text-gray-500 capitalize">{s}</span>
                </span>
              ))}
            </div>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['grid','list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${view === v ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {hostel.rooms.map(room => (
                <div
                  key={room.number}
                  className={`rounded-xl border-2 p-3 cursor-pointer hover:shadow-sm transition-all group ${ROOM_STATUS_COLORS[room.status]}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-bold">{room.number}</p>
                    <span className="text-[10px] font-medium opacity-70">{ROOM_TYPE_LABELS[room.type]}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: room.capacity }).map((_, i) => (
                      <div key={i} className={`h-2 flex-1 rounded-full ${i < room.occupied ? 'bg-current opacity-60' : 'bg-current opacity-15'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] opacity-70">{room.occupied}/{room.capacity} students</p>
                  {room.students.length > 0 && (
                    <div className="mt-1.5 space-y-0.5 hidden group-hover:block">
                      {room.students.map(s => (
                        <p key={s} className="text-[10px] font-medium truncate">{s}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-5">Room No.</th>
                  <th>Type</th>
                  <th className="text-center">Capacity</th>
                  <th className="text-center">Occupied</th>
                  <th>Residents</th>
                  <th>Status</th>
                  <th className="text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hostel.rooms.map(room => (
                  <tr key={room.number}>
                    <td className="pl-5"><span className="font-mono text-sm font-bold text-gray-900">{room.number}</span></td>
                    <td><span className="pill pill-gray capitalize">{ROOM_TYPE_LABELS[room.type]}</span></td>
                    <td className="text-center text-sm font-medium text-gray-700">{room.capacity}</td>
                    <td className="text-center text-sm font-medium text-gray-700">{room.occupied}</td>
                    <td>
                      {room.students.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {room.students.map(s => <span key={s} className="text-xs text-gray-600">{s}</span>)}
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td><span className={ROOM_STATUS_PILLS[room.status]}>{room.status}</span></td>
                    <td className="text-right pr-5">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5 text-gray-400" /></Button>
                        <Button variant="ghost" size="icon-sm"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
