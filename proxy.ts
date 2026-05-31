// Next 16 renamed Middleware → Proxy; the file lives at the repo root.
// Env-gated: with no Clerk keys the proxy is a no-op passthrough, so the app runs
// locally without auth configured. `clerkMiddleware()` is still the function name.
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

import { clerkEnabled } from "@/lib/clerk-enabled";

const proxy = clerkEnabled
  ? clerkMiddleware()
  : (_req: NextRequest) => NextResponse.next();

export default proxy;

export const config = {
  matcher: [
    // Skip Next internals and static files; run on everything else…
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // …and always on API routes.
    "/(api|trpc)(.*)",
  ],
};
