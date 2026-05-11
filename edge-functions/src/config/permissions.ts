import type { Permission, RolePermissions, UserRole } from '@/types';

export const ROLE_PERMISSIONS: RolePermissions = {
  super_admin: [
    'students:read', 'students:write', 'students:delete',
    'teachers:read', 'teachers:write', 'teachers:delete',
    'attendance:read', 'attendance:write',
    'fees:read', 'fees:write', 'fees:delete',
    'payments:read', 'payments:write',
    'payroll:read', 'payroll:write', 'payroll:approve',
    'reports:read', 'reports:export',
    'settings:read', 'settings:write',
    'schools:read', 'schools:write',
    'exams:read', 'exams:write',
    'notifications:read', 'notifications:write',
  ],
  school_owner: [
    'students:read', 'students:write', 'students:delete',
    'teachers:read', 'teachers:write', 'teachers:delete',
    'attendance:read', 'attendance:write',
    'fees:read', 'fees:write', 'fees:delete',
    'payments:read', 'payments:write',
    'payroll:read', 'payroll:write', 'payroll:approve',
    'reports:read', 'reports:export',
    'settings:read', 'settings:write',
    'schools:read', 'schools:write',
    'exams:read', 'exams:write',
    'notifications:read', 'notifications:write',
  ],
  school_admin: [
    'students:read', 'students:write',
    'teachers:read', 'teachers:write',
    'attendance:read', 'attendance:write',
    'fees:read', 'fees:write',
    'payments:read', 'payments:write',
    'payroll:read', 'payroll:write',
    'reports:read', 'reports:export',
    'settings:read', 'settings:write',
    'exams:read', 'exams:write',
    'notifications:read', 'notifications:write',
  ],
  principal: [
    'students:read', 'students:write',
    'teachers:read', 'teachers:write',
    'attendance:read', 'attendance:write',
    'fees:read',
    'payments:read',
    'payroll:read',
    'reports:read', 'reports:export',
    'settings:read',
    'exams:read', 'exams:write',
    'notifications:read', 'notifications:write',
  ],
  teacher: [
    'students:read',
    'attendance:read', 'attendance:write',
    'exams:read', 'exams:write',
    'reports:read',
    'notifications:read',
  ],
  accountant: [
    'students:read',
    'fees:read', 'fees:write',
    'payments:read', 'payments:write',
    'payroll:read', 'payroll:write',
    'reports:read', 'reports:export',
    'notifications:read',
  ],
  staff: [
    'students:read',
    'attendance:read',
    'reports:read',
    'notifications:read',
  ],
  guardian: [
    'students:read',
    'attendance:read',
    'fees:read',
    'payments:read',
    'reports:read',
    'notifications:read',
  ],
  student: [
    'attendance:read',
    'fees:read',
    'payments:read',
    'reports:read',
    'notifications:read',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  school_owner: 'School Owner',
  school_admin: 'School Admin',
  principal: 'Principal',
  teacher: 'Teacher',
  accountant: 'Accountant',
  staff: 'Staff',
  guardian: 'Guardian',
  student: 'Student',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-800',
  school_owner: 'bg-blue-100 text-blue-800',
  school_admin: 'bg-indigo-100 text-indigo-800',
  principal: 'bg-cyan-100 text-cyan-800',
  teacher: 'bg-green-100 text-green-800',
  accountant: 'bg-yellow-100 text-yellow-800',
  staff: 'bg-orange-100 text-orange-800',
  guardian: 'bg-pink-100 text-pink-800',
  student: 'bg-gray-100 text-gray-800',
};
