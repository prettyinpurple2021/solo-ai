"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Card className="w-full max-w-lg border-2 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="h-6 w-6" />
            <CardTitle className="text-xl">Something went wrong</CardTitle>
          </div>
          <CardDescription>
            We've encountered an unexpected error. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm text-gray-700 overflow-auto max-h-40">
            {error?.message || "Unknown error"}
            {error?.digest && (
              <div className="mt-2 text-xs text-gray-500">
                Error ID: {error.digest}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          <Button 
            onClick={() => reset()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
