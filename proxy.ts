import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password") ||
    nextUrl.pathname.startsWith("/verify-email");
  const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

  // 1. Redirect logged-in users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 2. Protect dashboard routes
  if (!isLoggedIn && isDashboard) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow NextAuth API routes
  if (isApiAuth) {
    return NextResponse.next();
  }

  // 3. Protect all other API routes
  if (!isLoggedIn && nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Generate security headers: Content-Security-Policy & Nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://lh3.googleusercontent.com https://avatars.githubusercontent.com;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  // Clone headers and set CSP
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
