"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error tracking removed
  }, [error]);
  return (
    <html>
      <body
        className="font-mono min-h-screen flex items-center justify-center p-4 bg-dark-bg"
      >
        <div className="w-full max-w-lg bg-dark-card rounded-sm shadow-[0_0_20px_rgba(255,0,110,0.3)] border-2 border-neon-magenta/50 overflow-hidden">
          <div className="p-6 border-b-2 border-gray-700">
            <div className="flex items-center gap-2 text-neon-magenta mb-2">
              <AlertCircle className="h-6 w-6" />
              <h1 className="text-xl font-bold font-orbitron uppercase tracking-wider text-white">Something went wrong</h1>
            </div>
            <p className="text-gray-300 font-mono">
              We&apos;ve encountered a critical error. Our team has been
              notified.
            </p>
          </div>

          <div className="p-6">
            <div className="bg-dark-bg p-4 rounded-sm border-2 border-gray-700 text-sm text-gray-300 font-mono overflow-auto max-h-40">
              {error?.message || "Unknown error"}
              {error?.digest && (
                <div className="mt-2 text-xs text-gray-500 font-mono">
                  Error ID: {error.digest}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-dark-bg/50 flex justify-between gap-2">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 border-2 border-gray-700 rounded-sm text-gray-300 bg-dark-card hover:bg-dark-hover hover:border-neon-cyan transition-all font-mono font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Go Home
            </button>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-neon-purple text-white rounded-sm hover:bg-neon-purple/80 hover:shadow-[0_0_15px_rgba(179,0,255,0.3)] transition-all font-mono font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
