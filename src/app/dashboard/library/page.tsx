'use client';
import { useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/shared/page-header';
import { StatsCard } from '@/components/shared/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils';
import { BookOpen, BookMarked, AlertCircle, Plus, Eye, RotateCcw, Search } from 'lucide-react';
import type { Book, BookIssue } from '@/types/phase2';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'primary'> = {
  available: 'success', issued: 'primary', reserved: 'warning',
  lost: 'danger', damaged: 'warning', maintenance: 'default',
};

const mockBooks: any[] = [
  { id: 'b1', school_id: 's1', title: 'Advanced Mathematics for Class X', author: 'NCTB', isbn: '978-984-0000-01-1', publisher: 'NCTB Bangladesh', total_copies: 25, available_copies: 18, rack_number: 'A-01', language: 'Bangla', year_published: 2023, category: { name: 'Mathematics' }, created_at: '', updated_at: '' },
  { id: 'b2', school_id: 's1', title: 'English for Today (Class X)', author: 'NCTB', isbn: '978-984-0000-02-8', publisher: 'NCTB Bangladesh', total_copies: 30, available_copies: 22, rack_number: 'A-02', language: 'English', year_published: 2023, category: { name: 'English' }, created_at: '', updated_at: '' },
  { id: 'b3', school_id: 's1', title: 'Physics - Class XI & XII', author: 'Dr. M. A. Ali', isbn: '978-984-0000-03-5', publisher: 'Hasan Book House', total_copies: 15, available_copies: 3, rack_number: 'B-04', language: 'Bangla', year_published: 2022, category: { name: 'Science' }, created_at: '', updated_at: '' },
  { id: 'b4', school_id: 's1', title: 'Oxford English Dictionary', author: 'Oxford Press', isbn: '978-0-19-861126-8', publisher: 'Oxford University Press', total_copies: 5, available_copies: 5, rack_number: 'C-01', language: 'English', year_published: 2020, category: { name: 'Reference' }, created_at: '', updated_at: '' },
  { id: 'b5', school_id: 's1', title: 'Bangla Sohityo (Class IX)', author: 'NCTB', isbn: '978-984-0000-04-2', publisher: 'NCTB Bangladesh', total_copies: 28, available_copies: 0, rack_number: 'A-03', language: 'Bangla', year_published: 2023, category: { name: 'Bangla' }, created_at: '', updated_at: '' },
];

const mockIssues: any[] = [
  { id: 'i1', school_id: 's1', book_id: 'b1', borrower_type: 'student', borrower_id: 'st1', issued_date: '2024-01-10', due_date: '2024-01-24', fine_amount: 0, fine_paid: false, status: 'issued', created_at: '', updated_at: '', book: { title: 'Advanced Mathematics for Class X' }, borrower_name: 'Arif Hossain' },
  { id: 'i2', school_id: 's1', book_id: 'b3', borrower_type: 'student', borrower_id: 'st2', issued_date: '2024-01-05', due_date: '2024-01-19', fine_amount: 20, fine_paid: false, status: 'issued', created_at: '', updated_at: '', book: { title: 'Physics - Class XI & XII' }, borrower_name: 'Fatema Khatun' },
  { id: 'i3', school_id: 's1', book_id: 'b2', borrower_type: 'staff', borrower_id: 'staff1', issued_date: '2024-01-08', due_date: '2024-01-22', returned_date: '2024-01-20', fine_amount: 0, fine_paid: false, status: 'available', created_at: '', updated_at: '', book: { title: 'English for Today (Class X)' }, borrower_name: 'Abdul Karim (Staff)' },
];

const bookColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'title',
    header: 'Book',
    cell: ({ row }) => (
      <div className="flex gap-3 items-start">
        <div className="h-12 w-9 bg-blue-50 rounded border border-blue-100 flex items-center justify-center shrink-0">
          <BookOpen className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 leading-snug">{row.original.title}</p>
          <p className="text-xs text-gray-400">{row.original.author} · {row.original.year_published}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'isbn',
    header: 'ISBN',
    cell: ({ row }) => <span className="text-xs font-mono text-gray-500">{row.original.isbn || '—'}</span>,
  },
  {
    id: 'category',
    header: 'Category',
    cell: ({ row }) => <Badge variant="default">{row.original.category?.name || '—'}</Badge>,
  },
  {
    accessorKey: 'rack_number',
    header: 'Rack',
    cell: ({ row }) => <span className="text-sm font-mono text-gray-600">{row.original.rack_number || '—'}</span>,
  },
  {
    id: 'copies',
    header: 'Copies',
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="text-green-600 font-semibold">{row.original.available_copies}</span>
        <span className="text-gray-400"> / {row.original.total_copies}</span>
      </div>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const avail = row.original.available_copies;
      const total = row.original.total_copies;
      if (avail === 0) return <Badge variant="danger">All Issued</Badge>;
      if (avail < total * 0.2) return <Badge variant="warning">Low Stock</Badge>;
      return <Badge variant="success">Available</Badge>;
    },
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm"><Eye className="h-3.5 w-3.5 text-gray-400" /></Button>
        <Button variant="default" size="sm" className="text-xs h-7">Issue</Button>
      </div>
    ),
  },
];

const issueColumns: ColumnDef<any>[] = [
  {
    id: 'book',
    header: 'Book',
    cell: ({ row }) => (
      <p className="text-sm font-medium text-gray-900">{row.original.book?.title}</p>
    ),
  },
  {
    accessorKey: 'borrower_name',
    header: 'Borrower',
    cell: ({ row }) => (
      <div>
        <p className="text-sm text-gray-800">{row.original.borrower_name}</p>
        <Badge variant="default" className="text-xs mt-0.5">{row.original.borrower_type}</Badge>
      </div>
    ),
  },
  {
    accessorKey: 'issued_date',
    header: 'Issued',
    cell: ({ row }) => <span className="text-sm text-gray-600">{formatDate(row.original.issued_date)}</span>,
  },
  {
    accessorKey: 'due_date',
    header: 'Due Date',
    cell: ({ row }) => {
      const overdue = !row.original.returned_date && new Date(row.original.due_date) < new Date();
      return (
        <span className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
          {formatDate(row.original.due_date)}
          {overdue && ' ⚠️'}
        </span>
      );
    },
  },
  {
    accessorKey: 'fine_amount',
    header: 'Fine',
    cell: ({ row }) => (
      <span className={`text-sm font-semibold ${row.original.fine_amount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
        {row.original.fine_amount > 0 ? `৳${row.original.fine_amount}` : '—'}
      </span>
    ),
  },
  {
    id: 'return_status',
    header: 'Status',
    cell: ({ row }) => (
      row.original.returned_date
        ? <Badge variant="success">Returned</Badge>
        : <Badge variant="primary">Issued</Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => (
      !row.original.returned_date && (
        <Button variant="outline" size="sm" className="text-xs h-7" leftIcon={<RotateCcw className="h-3 w-3" />}>
          Return
        </Button>
      )
    ),
  },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'issues'>('books');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        subtitle="Manage books, issues, and returns"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Library' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" leftIcon={<BookMarked className="h-4 w-4" />}>
              Issue Book
            </Button>
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Add Book
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Books" value={mockBooks.reduce((s, b) => s + b.total_copies, 0)}
          icon={BookOpen} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatsCard title="Available" value={mockBooks.reduce((s, b) => s + b.available_copies, 0)}
          icon={BookOpen} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatsCard title="Currently Issued" value={mockIssues.filter(i => !i.returned_date).length}
          icon={BookMarked} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatsCard title="Overdue" value={mockIssues.filter(i => !i.returned_date && new Date(i.due_date) < new Date()).length}
          icon={AlertCircle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['books', 'issues'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'books' ? 'Book Catalog' : 'Issue Records'}
          </button>
        ))}
      </div>

      {activeTab === 'books' && (
        <DataTable columns={bookColumns} data={mockBooks} searchPlaceholder="Search books by title, author, ISBN..." pageSize={10} />
      )}
      {activeTab === 'issues' && (
        <DataTable columns={issueColumns} data={mockIssues} searchPlaceholder="Search by borrower or book..." pageSize={10} />
      )}
    </div>
  );
}
