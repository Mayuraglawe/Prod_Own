import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

/**
 * Metadata configuration for search engine optimization (SEO) and tab titles.
 */
export const metadata: Metadata = {
  title: 'Donezo — Prod Own Operations & Error Dashboard',
  description: 'Plan, prioritize, and accomplish your tasks and monitor self-hosted error telemetry with ease'
};

/**
 * Root HTML shell template wrapper for all Next.js application views.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-[#F3F5F4] text-[#13221C] antialiased selection:bg-[#20C997] selection:text-white">
        {children}
      </body>
    </html>
  );
}
