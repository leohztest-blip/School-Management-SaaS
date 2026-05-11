'use client';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission, hasAnyPermission } from '@/config/permissions';
import type { Permission, UserRole } from '@/types';

// ── Permission Hooks ──────────────────────────────────────────

export function usePermission(permission: Permission): boolean {
  const { user } = useAuthStore();
  if (!user?.role) return false;
  return hasPermission(user.role, permission);
}

export function useAnyPermission(permissions: Permission[]): boolean {
  const { user } = useAuthStore();
  if (!user?.role) return false;
  return hasAnyPermission(user.role, permissions);
}

export function useRole(): UserRole | null {
  const { user } = useAuthStore();
  return user?.role || null;
}

export function useIsRole(role: UserRole | UserRole[]): boolean {
  const { user } = useAuthStore();
  if (!user?.role) return false;
  if (Array.isArray(role)) return role.includes(user.role);
  return user.role === role;
}

export function useIsSuperAdmin(): boolean {
  return useIsRole('super_admin');
}

export function useIsSchoolAdmin(): boolean {
  return useIsRole(['super_admin', 'school_owner', 'school_admin']);
}

export function useSchoolId(): string | null {
  const { user } = useAuthStore();
  return user?.school_id || null;
}

// ── Permission Guard Component ────────────────────────────────

interface CanProps {
  do: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ do: permission, fallback = null, children }: CanProps) {
  const allowed = usePermission(permission);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

interface RoleGuardProps {
  roles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const isAllowed = useIsRole(roles);
  if (!isAllowed) return <>{fallback}</>;
  return <>{children}</>;
}
