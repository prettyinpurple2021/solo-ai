import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // Clerk middleware would be added here when environment variables are properly configured
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}; 