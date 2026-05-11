'use client';
import { formatCurrency, formatDate, formatDateTime } from '@/utils';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import type { Invoice, Payment, Student } from '@/types';

interface ReceiptProps {
  invoice: Invoice;
  payment: Payment;
  student: Student;
  schoolName: string;
  schoolAddress?: string;
  schoolPhone?: string;
}

export function FeeReceipt({ invoice, payment, student, schoolName, schoolAddress, schoolPhone }: ReceiptProps) {
  return (
    <div>
      <div className="mb-4 print:hidden flex justify-end gap-2">
        <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
          Download PDF
        </Button>
        <Button variant="outline" size="sm" leftIcon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
          Print Receipt
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md mx-auto print:border-none">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">S</div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{schoolName}</h1>
          {schoolAddress && <p className="text-xs text-gray-500 mt-0.5">{schoolAddress}</p>}
          {schoolPhone && <p className="text-xs text-gray-500">Tel: {schoolPhone}</p>}
          <div className="mt-3 inline-flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1">
            <p className="text-sm font-bold text-green-700">✓ PAYMENT RECEIPT</p>
          </div>
        </div>

        {/* Receipt details */}
        <div className="space-y-2 mb-5 bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Receipt No.</span>
            <span className="font-mono font-semibold text-gray-800">{payment.payment_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Invoice No.</span>
            <span className="font-mono text-gray-700">{invoice.invoice_number}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment Date</span>
            <span className="text-gray-700">{formatDateTime(payment.payment_date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-medium text-gray-800 capitalize">{payment.payment_method}</span>
          </div>
          {payment.transaction_id && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-xs text-gray-600">{payment.transaction_id}</span>
            </div>
          )}
        </div>

        {/* Student info */}
        <div className="mb-5 border border-gray-100 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Student Details</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Name</span>
              <span className="font-semibold text-gray-900">{student.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Student ID</span>
              <span className="text-gray-700">{student.student_id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Class</span>
              <span className="text-gray-700">{student.class?.name} — {student.section?.name}</span>
            </div>
          </div>
        </div>

        {/* Fee items */}
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fee Details</p>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-2 text-gray-700">{item.description}</td>
                    <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
                {invoice.discount > 0 && (
                  <tr className="border-b border-gray-50">
                    <td className="px-3 py-2 text-green-600">Discount</td>
                    <td className="px-3 py-2 text-right text-green-600">- {formatCurrency(invoice.discount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2 border-t border-gray-100 pt-3 mb-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Invoice Total</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-blue-700">
            <span>Amount Paid (this receipt)</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
          {invoice.balance > 0 && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Remaining Balance</span>
              <span>{formatCurrency(invoice.balance)}</span>
            </div>
          )}
        </div>

        {/* Amount in words */}
        <div className="bg-blue-50 rounded-xl p-3 mb-6">
          <p className="text-xs text-blue-500 font-medium mb-0.5">Amount in words:</p>
          <p className="text-sm font-semibold text-blue-800">
            {numberToWords(payment.amount)} Taka Only
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
          <p>This is a valid payment receipt. Keep for your records.</p>
          <p className="mt-1 font-medium">Generated by Shiksha ERP · {formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
}

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
  };

  return convert(Math.floor(num));
}
