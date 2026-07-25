import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/logs`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      cache: "no-store",
    });
    const flaskData = await flaskRes.json();
    if (!flaskRes.ok) {
      return NextResponse.json(
        { error: flaskData.error },
        { status: flaskRes.status },
      );
    }
    const transformData = flaskData.map((item: any) => ({
      username: item.username,
      containers: item.container_name,
      action: item.action,
      upDateTime: item.created_at,
      status: item.status,
      details: item.details,
    }));
    return NextResponse.json(transformData, { status: flaskRes.status });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
