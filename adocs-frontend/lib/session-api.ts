import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function sessionRequest(path: string, method: "GET" | "DELETE" = "GET") {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  try {
    const backend = await fetch(`${process.env.NEXTAPI_URL}${path}`, {
      method,
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const data = await backend.json();
    const response = NextResponse.json(data, {
      status: backend.status,
      headers: { "Cache-Control": "no-store" },
    });
    if (backend.status === 401 || (backend.ok && method === "DELETE" && data.is_current)) {
      response.cookies.delete("token");
    }
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to connect to the session service." }, { status: 503 });
  }
}
