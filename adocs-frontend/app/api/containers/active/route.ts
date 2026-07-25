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
    const flaskData = await flaskRes.json();
    if (!flaskRes.ok) {
      return NextResponse.json(
        { error: flaskData.error },
        { status: flaskRes.status },
      );
    }
    const transformData = flaskData
      .filter((item: any) => item.domain && item.domain.trim() !== "")
      .map((item: any) => ({
        containerName: item.container_name,
        domain: item.domain,
        image: item.type,
        owner: item.owner,
        upDateTime: item.updated_at,
        status: item.status,
      }));
    return NextResponse.json(transformData, { status: flaskRes.status });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
