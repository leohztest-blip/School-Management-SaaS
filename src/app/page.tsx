import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, School, LineChart } from 'lucide-react';

const highlights = [
  'Admissions, student records, and class workflows in one place',
  'Attendance, exams, and fee management with role-based access',
  'Production-ready Next.js + Supabase deployment for modern schools',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex max-w-6xl flex-col px-6 py-16 lg:py-24">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
          <School className="h-3.5 w-3.5" />
          Shiksha ERP • School Management SaaS
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Run your school operations with a unified, role-based ERP platform.
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
          Manage students, staff, classes, fees, attendance, exams, notices, and reports with a production-focused workflow built for school admins and educators.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Create account
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {highlights.map((text) => (
            <div key={text} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-400" />
              <p className="text-sm text-slate-200">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <ShieldCheck className="mb-3 h-5 w-5 text-blue-300" />
            <h2 className="text-lg font-semibold text-white">Role-based and secure</h2>
            <p className="mt-1 text-sm text-slate-300">Supports Super Admin, School Admin, Teacher, Student, Parent, and finance roles with scoped navigation and access patterns.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <LineChart className="mb-3 h-5 w-5 text-violet-300" />
            <h2 className="text-lg font-semibold text-white">Analytics-ready operations</h2>
            <p className="mt-1 text-sm text-slate-300">Track attendance, fees, academics, and operations from centralized dashboards and reports.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
