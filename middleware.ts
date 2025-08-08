import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/landing",
    "/sign-in",
    "/sign-up", 
    "/unauthorized-sign-in",
    "/user",
    "/about",
    "/features",
    "/pricing",
    "/contact",
    "/blog",
    "/help",
    "/privacy",
    "/terms",
    "/cookies",
    "/gdpr",
    "/security",
    "/status",
    "/team",
    "/community",
    "/brand-demo",
    "/auth-example",
    "/feature-test",
    "/api/webhooks(.*)",
  ],
  // Routes that can be accessed while signed out, but also show user content when signed in
  ignoredRoutes: [
    "/api/webhooks(.*)",
  ],
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
} 