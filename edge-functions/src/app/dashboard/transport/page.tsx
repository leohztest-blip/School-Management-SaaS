'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Bus, MapPin, Users, AlertTriangle, Edit, Eye, Navigation } from 'lucide-react';

const mockRoutes = [
  { id: 'r1', name: 'Dhanmondi Route', monthly_fee: 1200, stops: 8, students: 42, vehicle: 'Dhaka Metro-Ba 11-5678', driver: 'Rahim Driver', is_active: true },
  { id: 'r2', name: 'Mirpur Route', monthly_fee: 1400, stops: 10, students: 38, vehicle: 'Dhaka Metro-Ba 11-9012', driver: 'Kamal Driver', is_active: true },
  { id: 'r3', name: 'Gulshan Route', monthly_fee: 1600, stops: 7, students: 30, vehicle: 'Dhaka Metro-Ba 11-3456', driver: 'Salam Driver', is_active: true },
  { id: 'r4', name: 'Uttara Route', monthly_fee: 1800, stops: 12, students: 25, vehicle: 'Dhaka Metro-Ba 11-7890', driver: 'Jalil Driver', is_active: false },
];

const mockVehicles = [
  { id: 'v1', reg: 'Dhaka Metro-Ba 11-5678', type: 'Bus', make: 'Tata', capacity: 52, route: 'Dhanmondi Route', driver: 'Rahim', insurance_expiry: '2024-12-31', fitness_expiry: '2024-06-30', status: 'active' },
  { id: 'v2', reg: 'Dhaka Metro-Ba 11-9012', type: 'Bus', make: 'Ashok Leyland', capacity: 45, route: 'Mirpur Route', driver: 'Kamal', insurance_expiry: '2024-09-15', fitness_expiry: '2024-08-20', status: 'active' },
  { id: 'v3', reg: 'Dhaka Metro-Ba 11-3456', type: 'Minibus', make: 'Toyota', capacity: 28, route: 'Gulshan Route', driver: 'Salam', insurance_expiry: '2025-03-01', fitness_expiry: '2025-01-10', status: 'maintenance' },
  { id: 'v4', reg: 'Dhaka Metro-Ba 11-7890', type: 'Bus', make: 'Tata', capacity: 52, route: 'Uttara Route', driver: 'Jalil', insurance_expiry: '2024-07-20', fitness_expiry: '2024-04-15', status: 'active' },
];

const STOPS_SAMPLE = ['School Gate', 'Dhanmondi 15', 'Dhanmondi 8', 'Kalabagan', 'New Market', 'Azimpur', 'Palashi', 'Nilkhet'];

export default function TransportPage() {
  const [activeTab, setActiveTab] = useState<'routes' | 'vehicles' | 'students'>('routes');

  const totalStudents = mockRoutes.reduce((s, r) => s + r.students, 0);
  const activeRoutes = mockRoutes.filter(r => r.is_active).length;
  const maintenanceVehicles = mockVehicles.filter(v => v.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transport"
        subtitle="Manage school buses, routes, and student transport"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Transport' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<Bus className="h-4 w-4" />}>Add Vehicle</Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Route</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Active Routes" value={activeRoutes} icon={Navigation} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Total Vehicles" value={mockVehicles.length} icon={Bus} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Students Using Transport" value={totalStudents} icon={Users} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Under Maintenance" value={maintenanceVehicles} icon={AlertTriangle} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['routes', 'vehicles', 'students'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockRoutes.map(route => (
            <div key={route.id} className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow
              ${!route.is_active ? 'opacity-60 border-gray-100' : 'border-gray-100'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Bus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{route.name}</h3>
                    <p className="text-xs text-gray-400">{route.vehicle} · {route.driver}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={route.is_active ? 'success' : 'default'}>
                    {route.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="ghost" size="icon-sm"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-gray-900">{route.students}</p>
                  <p className="text-xs text-gray-400">Students</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-gray-900">{route.stops}</p>
                  <p className="text-xs text-gray-400">Stops</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-blue-700">৳{route.monthly_fee}</p>
                  <p className="text-xs text-gray-400">Per Month</p>
                </div>
              </div>

              {/* Stop preview */}
              <div className="flex items-center gap-1 text-xs text-gray-400 overflow-hidden">
                {STOPS_SAMPLE.slice(0, route.stops).map((stop, i) => (
                  <span key={stop} className="flex items-center gap-1 shrink-0">
                    {i > 0 && <span className="text-gray-300">→</span>}
                    <span className={i === 0 || i === route.stops - 1 ? 'text-blue-600 font-medium' : ''}>{stop}</span>
                  </span>
                )).slice(0, 5)}
                {route.stops > 5 && <span className="text-gray-400">+{route.stops - 5} more</span>}
              </div>

              <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
                View Details & Students
              </Button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route / Driver</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurance Expiry</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fitness Expiry</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockVehicles.map(v => {
                const insExpired = new Date(v.insurance_expiry) < new Date();
                const fitExpired = new Date(v.fitness_expiry) < new Date();
                return (
                  <tr key={v.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Bus className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-xs">{v.reg}</p>
                          <p className="text-xs text-gray-400">{v.make} {v.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-700">{v.route}</p>
                      <p className="text-xs text-gray-400">{v.driver}</p>
                    </td>
                    <td className="px-5 py-3 text-center text-sm font-semibold text-gray-800">{v.capacity}</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${insExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {v.insurance_expiry} {insExpired && '⚠️'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${fitExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {v.fitness_expiry} {fitExpired && '⚠️'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={v.status === 'active' ? 'success' : v.status === 'maintenance' ? 'warning' : 'default'}>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Button variant="ghost" size="icon-sm"><Edit className="h-3.5 w-3.5 text-gray-400" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <input placeholder="Search student name or ID..." className="w-full h-9 pl-4 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>Assign Transport</Button>
          </div>
          <p className="text-sm text-gray-500 text-center py-8">
            Select a route from the Routes tab to view enrolled students, or use the search above to find a specific student's transport assignment.
          </p>
        </div>
      )}
    </div>
  );
}
