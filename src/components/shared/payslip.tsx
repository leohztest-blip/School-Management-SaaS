'use client';
import { formatCurrency, formatDate, MONTHS } from '@/utils';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { Payroll, Staff } from '@/types';

interface PayslipProps {
  payroll: Payroll & { staff?: Staff };
  schoolName: string;
  schoolAddress?: string;
  schoolLogo?: string;
}

export function Payslip({ payroll, schoolName, schoolAddress }: PayslipProps) {
  const { staff } = payroll;
  const monthName = MONTHS[payroll.month - 1];

  const earnings = [
    { label: 'Basic Salary', amount: payroll.basic_salary },
    { label: 'House Allowance', amount: payroll.house_allowance },
    { label: 'Medical Allowance', amount: payroll.medical_allowance },
    { label: 'Transport Allowance', amount: payroll.transport_allowance },
    { label: 'Other Allowance', amount: payroll.other_allowance },
  ].filter((e) => e.amount > 0);

  const deductions = [
    { label: 'Income Tax', amount: payroll.tax_deduction },
    { label: 'Provident Fund', amount: payroll.provident_fund },
    { label: 'Other Deduction', amount: payroll.other_deduction },
  ].filter((d) => d.amount > 0);

  return (
    <div>
      {/* Print button — hidden in print */}
      <div className="mb-4 print:hidden flex justify-end">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Printer className="h-4 w-4" />}
          onClick={() => window.print()}
        >
          Print Payslip
        </Button>
      </div>

      {/* Payslip document */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto print:border-none print:shadow-none print:rounded-none print:p-0">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              S
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">{schoolName}</h1>
              {schoolAddress && <p className="text-sm text-gray-500">{schoolAddress}</p>}
            </div>
          </div>
          <div className="mt-3 inline-flex items-center bg-gray-100 rounded-lg px-4 py-1.5">
            <p className="text-sm font-semibold text-gray-700">
              SALARY SLIP — {monthName.toUpperCase()} {payroll.year}
            </p>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-xl p-4">
          <div className="space-y-1.5">
            <div>
              <p className="text-xs text-gray-500">Employee Name</p>
              <p className="text-sm font-semibold text-gray-900">{staff?.full_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Employee ID</p>
              <p className="text-sm font-medium text-gray-700">{staff?.staff_id || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Designation</p>
              <p className="text-sm font-medium text-gray-700">{staff?.designation || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="text-sm font-medium text-gray-700">{staff?.department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Pay Period</p>
              <p className="text-sm font-medium text-gray-700">{monthName} {payroll.year}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Working Days / Present</p>
              <p className="text-sm font-medium text-gray-700">
                {payroll.working_days} / {payroll.present_days}
              </p>
            </div>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Earnings</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {earnings.map((e) => (
                    <tr key={e.label} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2 text-gray-600">{e.label}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50">
                    <td className="px-3 py-2 font-semibold text-green-800">Gross Salary</td>
                    <td className="px-3 py-2 text-right font-bold text-green-800">{formatCurrency(payroll.gross_salary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deductions</h3>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {deductions.map((d) => (
                    <tr key={d.label} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2 text-gray-600">{d.label}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">{formatCurrency(d.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-red-50">
                    <td className="px-3 py-2 font-semibold text-red-800">Total Deductions</td>
                    <td className="px-3 py-2 text-right font-bold text-red-800">{formatCurrency(payroll.total_deduction)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="bg-blue-600 text-white rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-sm">Net Salary (Take Home)</p>
            <p className="text-2xl font-bold mt-0.5">{formatCurrency(payroll.net_salary)}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs">Payment Method</p>
            <p className="font-semibold capitalize">{payroll.payment_method || 'Bank Transfer'}</p>
            {payroll.payment_date && (
              <p className="text-blue-200 text-xs mt-0.5">Paid: {formatDate(payroll.payment_date)}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="h-px w-24 bg-gray-300 mx-auto mb-2 mt-8" />
            <p className="text-xs text-gray-500">Employee Signature</p>
          </div>
          <div>
            <div className="h-px w-24 bg-gray-300 mx-auto mb-2 mt-8" />
            <p className="text-xs text-gray-500">HR / Principal</p>
          </div>
          <div>
            <div className="h-px w-24 bg-gray-300 mx-auto mb-2 mt-8" />
            <p className="text-xs text-gray-500">Accounts</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          This is a computer-generated payslip and does not require a physical signature. — Shiksha ERP
        </p>
      </div>
    </div>
  );
}
