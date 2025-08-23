"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AccountRecoveryPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Here you would typically call your backend API to handle the password reset request
      // For demonstration, we'll simulate a successful request
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage("If an account with this email exists, a password reset link has been sent.");
      setEmail(""); // Clear the input field
    } catch (_err) {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-purple-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold boss-text-gradient">
            Forgot Your Password?
          </CardTitle>
          <CardDescription>
            No problem. Enter your email below and we'll send you a link to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordResetRequest} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@your-empire.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            
            {message && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full boss-button bg-gradient-soloboss hover:bg-gradient-soloboss-light text-white font-bold"
              disabled={loading}
            >
              {loading ? "Sending..." : "🚀 Send Reset Link"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/signin" className="text-sm font-medium text-purple-600 hover:underline">
              Remembered your password? Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
