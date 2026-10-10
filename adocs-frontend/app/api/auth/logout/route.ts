import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE() {
  const token = (await cookies()).get("token")?.value;
  if (token) {
    try {
      const backend = await fetch(`${process.env.NEXTAPI_URL}/auth/logout`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      // Expired or already revoked sessions still allow local cookie cleanup.
      if (!backend.ok && backend.status !== 401 && backend.status !== 422) {
        return NextResponse.json({ error: "Unable to log out. Please try again." }, { status: 503 });
      }
    } catch {
      return NextResponse.json({ error: "Unable to log out. Please try again." }, { status: 503 });
    }
  }
  const response = NextResponse.json({ message: "Logout Successfuly." });
  response.cookies.delete("token");
  response.cookies.delete("tokenForgot");
  return response;
}
