import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'BDT'): string {
  if (currency === 'BDT') {
    return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, fmt);
  } catch {
    return '';
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return prefix ? `${prefix}-${timestamp}${random}` : `${timestamp}${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getAttendanceColor(rate: number): string {
  if (rate >= 90) return 'text-green-600';
  if (rate >= 75) return 'text-yellow-600';
  return 'text-red-600';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-gray-100 text-gray-800',
    partial: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-400 line-through',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const BANGLADESH_DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura',
  'Brahmanbaria', 'Chandpur', 'Chapainawabganj', 'Chattogram', 'Chuadanga',
  'Cox\'s Bazar', 'Cumilla', 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni',
  'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore',
  'Jhalokathi', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna',
  'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat',
  'Madaripur', 'Magura', 'Manikganj', 'Meherpur', 'Moulvibazar',
  'Munshiganj', 'Mymensingh', 'Naogaon', 'Narail', 'Narayanganj',
  'Narsingdi', 'Natore', 'Netrokona', 'Nilphamari', 'Noakhali',
  'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari',
  'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur',
  'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet', 'Tangail',
  'Thakurgaon',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const RELIGIONS = ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'];

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
