import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Segoe UI', 'Arial', 'system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: { default: 'Shiksha ERP', template: '%s | Shiksha ERP' },
  description: 'Premium multi-tenant School Management SaaS for Bangladesh',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
