import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  try {
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/containers/active`,
      {
        method: "GET",
        headers: { Accept: "application/json", "X-Forwarded-For": clientIP },
        cache: "no-store",
      },
    );
    if (flaskRes.status === 204) return NextResponse.json([]);
    const flaskData = await flaskRes.json();
    if (flaskRes.status === 401 && flaskData?.error === "No System Data") {
      return NextResponse.json([]);
    }
    if (!flaskRes.ok) {
      return NextResponse.json(
        { error: flaskData.error },
        { status: flaskRes.status },
      );
    }
    if (!Array.isArray(flaskData) || !flaskData.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
      return NextResponse.json({ error: "Invalid container data returned by the service." }, { status: 502 });
    }
    const transformData = flaskData
      .map((item: Record<string, unknown>) => ({
        containerName: item.container_name,
        domains: Array.isArray(item.domains) ? item.domains.filter((domain): domain is string => typeof domain === "string" && domain.trim() !== "") : [],
        image: item.type,
        owner: item.owner,
        upDateTime: item.updated_at,
        status: item.status,
      }))
      .filter((item) => item.domains.length > 0);
    return NextResponse.json(transformData, { status: flaskRes.status });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
