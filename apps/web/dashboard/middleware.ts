import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth((req) => {
  try {
    const isLoggedIn = !!req.auth;
    const user = req.auth?.user as { role?: string; tenantId?: string } | undefined;
    const role = user?.role?.toLowerCase() || 'admin';
    const rolePrefix = role === 'super_admin' ? 'superadmin' : role;

    const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
    const isApiRoute = req.nextUrl.pathname.startsWith("/api");
    const isAuthApiRoute = req.nextUrl.pathname.startsWith("/api/auth");
    
    // Define role specific paths
    const rolePaths = ["/admin", "/employee", "/owner", "/superadmin"];
    const isProtectedRoute = 
      req.nextUrl.pathname.startsWith("/dashboard") || 
      rolePaths.some(p => req.nextUrl.pathname.startsWith(p)) ||
      (isApiRoute && !isAuthApiRoute);

    if (isProtectedRoute && !isLoggedIn) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return Response.redirect(new URL("/login", req.nextUrl));
    }

    if (isLoggedIn) {
      if (isAuthRoute || req.nextUrl.pathname === "/") {
        return Response.redirect(new URL(`/${rolePrefix}/dashboard`, req.nextUrl));
      }

      // Protect role-specific routes (e.g. employee cannot access /admin)
      const accessingRolePath = rolePaths.find(p => req.nextUrl.pathname.startsWith(p));
      if (accessingRolePath && accessingRolePath !== `/${rolePrefix}`) {
        return Response.redirect(new URL(`/${rolePrefix}/dashboard`, req.nextUrl));
      }
    }
  } catch (error) {
    console.error("Middleware Error:", error);
    
    // Graceful fallback if the middleware logic crashes
    if (req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    // Return a 500 response so the Next.js global-error.tsx or error.tsx can catch it
    return new NextResponse("Internal Server Error in Middleware", { status: 500 });
  }
})

export const config = {
  // We removed the ?!api exclusion from the matcher so that API routes (except /api/auth) can be protected
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
