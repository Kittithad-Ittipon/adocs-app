import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function expiredRecovery() {
  const response = NextResponse.json(
    { error: "Your recovery session has expired. Please request a new code.", href: "/forgot" },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.delete("tokenForgot");
  return response;
}

async function recoveryRequest(request: Request, method: "GET" | "POST") {
  const token = (await cookies()).get("tokenForgot")?.value;
  if (!token) return expiredRecovery();
  try {
    const backend = await fetch(`${process.env.NEXTAPI_URL}/auth/${method === "GET" ? "otp-session" : "resend"}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Forwarded-For": request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1",
        "User-Agent": request.headers.get("user-agent") || "",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const data = await backend.json();
    if (backend.status === 401 || backend.status === 422) return expiredRecovery();
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    const retryAfter = backend.headers.get("Retry-After");
    if (retryAfter) headers["Retry-After"] = retryAfter;
    const response = NextResponse.json(
      backend.ok
        ? { message: data.message, valid: data.valid, retry_after: data.retry_after, expires_at: data.expires_at }
        : data,
      { status: backend.status, headers },
    );
    if (backend.ok && method === "POST") {
      response.cookies.set({
        name: "tokenForgot",
        value: data.token,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 300,
        secure: process.env.NODE_ENV === "production",
      });
    }
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to send a new code. Please try again." }, { status: 503 });
  }
}

export async function GET(request: Request) {
  return recoveryRequest(request, "GET");
}

export async function POST(request: Request) {
  return recoveryRequest(request, "POST");
}
