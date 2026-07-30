'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error('Critical global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="bg-red-50 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Critical System Error
          </h1>
          
          <p className="text-gray-600 mb-8">
            The application encountered a fatal error during initialization. Please try refreshing the page.
          </p>

          {/* Development Error Details */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-8 text-left overflow-auto">
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

          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#20C997] hover:bg-[#1bb386] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] w-full"
          >
            <RefreshCcw className="w-5 h-5" />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
