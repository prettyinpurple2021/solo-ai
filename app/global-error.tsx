"use client";

import { Inter } from "next/font/google";
import { AlertCircle } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50`}>
        <div className="w-full max-w-lg bg-white rounded-lg shadow-lg border-2 border-red-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-6 w-6" />
              <h1 className="text-xl font-bold">Something went wrong</h1>
            </div>
            <p className="text-gray-600">
              We've encountered a critical error. Our team has been notified.
            </p>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-700 overflow-auto max-h-40">
              {error?.message || "Unknown error"}
              {error?.digest && (
                <div className="mt-2 text-xs text-gray-500">
                  Error ID: {error.digest}
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6 bg-gray-50 flex justify-between gap-2">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Go Home
            </button>
            <button 
              onClick={() => reset()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
