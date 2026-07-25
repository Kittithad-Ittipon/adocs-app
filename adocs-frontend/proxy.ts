import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const tokenForgot = request.cookies.get("tokenForgot")?.value;
  const path = request.nextUrl.pathname;
  let role: string | undefined;
  if (token) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET_KEY),
      );
      role = payload.role as string;
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }
  if (!token && !tokenForgot) {
    if (path.startsWith("/forgot-repassword")) {
      return NextResponse.redirect(new URL("/forgot", request.url));
    }
    if (path !== "/login" && path !== "/forgot" && path !== "/register") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
  if (!token && tokenForgot) {
    if (path !== "/forgot-repassword") {
      return NextResponse.redirect(new URL("/forgot-repassword", request.url));
    }
    return NextResponse.next();
  }
  if (token && !tokenForgot) {
    if (
      path.startsWith("/dashboard") ||
      path.startsWith("/logs") ||
      path.startsWith("/upload") ||
      path.startsWith("/profile") ||
      path.startsWith("/users-manage")
    ) {
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    }
    if (path.startsWith("/login") || path.startsWith("/forgot")) {
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/users/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (path.startsWith("/users")) {
      if (role !== "user") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }
    return NextResponse.next();
  }
  if (token && tokenForgot) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("tokenForgot");
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/logs",
    "/profile",
    "/upload",
    "/users-manage",
    "/users/:path*",
    "/login",
    "/forgot",
    "/forgot-repassword",
  ],
};
