'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an external error tracking service
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 p-6 rounded-full mb-6 ring-8 ring-red-50/50">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-bold text-[#13221C] mb-3 tracking-tight">
        Oops, something went wrong!
      </h1>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        An unexpected error occurred while trying to render this page. 
        Don't worry, our team has been notified.
      </p>

      {/* Development Error Details */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-left overflow-auto">
          <p className="font-mono text-sm text-red-600 font-semibold mb-2">
            {error.name}: {error.message}
          </p>
          {error.stack && (
            <pre className="font-mono text-xs text-gray-500 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#20C997] hover:bg-[#1bb386] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
        
        <Link 
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all border border-gray-200 shadow-sm active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
