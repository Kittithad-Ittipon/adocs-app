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
      if (payload.purpose !== "login") throw new Error("Invalid login token");
      role = payload.role as string;
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
    try {
      const session = await fetch(`${process.env.NEXTAPI_URL}/auth/session`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (session.status === 401 || session.status === 422) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("token");
        return response;
      }
      if (!session.ok) return new NextResponse("Unable to verify your session. Please try again.", { status: 503 });
    } catch {
      return new NextResponse("Unable to verify your session. Please try again.", { status: 503 });
    }
  }
  if (!token && tokenForgot) {
    try {
      const session = await fetch(`${process.env.NEXTAPI_URL}/auth/otp-session`, {
        headers: { Authorization: `Bearer ${tokenForgot}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (session.status === 401 || session.status === 422) {
        const response = NextResponse.redirect(new URL("/forgot", request.url));
        response.cookies.delete("tokenForgot");
        return response;
      }
      if (!session.ok) return new NextResponse("Unable to verify your recovery code. Please try again.", { status: 503 });
    } catch {
      return new NextResponse("Unable to verify your recovery code. Please try again.", { status: 503 });
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
      path.startsWith("/users-manage") ||
      path.startsWith("/sessions") ||
      path.startsWith("/container-manage")
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
    "/sessions/:path*",
    "/container-manage",
    "/users/:path*",
    "/login",
    "/forgot",
    "/forgot-repassword",
  ],
};
