import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type BackendLog = {
  username?: string | null; container_name?: string | null; action?: string | null;
  created_at?: string | null; status?: string | null; details?: string | null;
};

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return NextResponse.json({ error: "Please sign in to view logs." }, { status: 401 });
  const apiUrl = process.env.NEXTAPI_URL?.replace(/\/+$/, "");
  if (!apiUrl) return NextResponse.json({ error: "Logs service is not configured." }, { status: 503 });
  try {
    const response = await fetch(apiUrl + "/logs", {
      headers: { Accept: "application/json", Authorization: "Bearer " + token },
      cache: "no-store",
    });
    if (response.status === 204) return NextResponse.json([]);
    const data: unknown = await response.json().catch(() => null);
    const error = data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : undefined;
    // Support older backends that report an empty list as an authorization error.
    if (response.status === 401 && error === "No Logs Data") return NextResponse.json([]);
    if (!response.ok) return NextResponse.json({ error: error || "Unable to load logs." }, { status: response.status });
    if (!Array.isArray(data) || !data.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
      return NextResponse.json({ error: "Logs service returned an invalid response." }, { status: 502 });
    }
    return NextResponse.json(data.map((item: BackendLog) => ({
      username: item.username ?? "", containers: item.container_name ?? "",
      action: item.action ?? "", upDateTime: item.created_at ?? "",
      status: item.status ?? "", details: item.details ?? "",
    })));
  } catch {
    return NextResponse.json({ error: "Unable to reach the logs service. Please try again." }, { status: 502 });
  }
}