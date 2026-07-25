import { loginSchema } from "@/lib/validation/login";
import { NextResponse } from "next/server";
import { decodeJwt } from "jose";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const { username, password } = result.data;
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": clientIP },
      body: JSON.stringify({ username, password }),
    });
    const flaskData = await flaskRes.json();
    if (!flaskRes.ok) {
      return NextResponse.json(flaskData, { status: flaskRes.status });
    }
    const { token, message } = flaskData;
    const decodedPayload = decodeJwt(token);
    const role = decodedPayload.role;
    let href = "/";
    if (role == "admin") {
      href = "/dashboard";
    } else if (role == "user") {
      href = "/users/dashboard";
    }
    const response = NextResponse.json(
      { message, href },
      { status: flaskRes.status },
    );
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 4 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });
    response.cookies.delete("tokenForgot");
    return response;
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
