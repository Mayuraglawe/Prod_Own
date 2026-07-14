import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

/**
 * Metadata configuration for search engine optimization (SEO) and tab titles.
 */
export const metadata: Metadata = {
  title: 'Prod Own Dashboard',
  description: 'Self-hosted multi-tenant operations dashboard'
};

/**
 * Root HTML shell template wrapper for all Next.js application views.
 */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

