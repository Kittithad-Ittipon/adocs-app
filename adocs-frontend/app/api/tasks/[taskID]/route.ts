import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskID: string }> },
) {
  const { taskID } = await params;
  const token = (await cookies()).get("token");
  if (!token) {
    return NextResponse.json({ error: "Token Not Found!" }, { status: 401 });
  }
  try {
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/tasks/${taskID}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        cache: "no-store",
      },
    );
    const flaskData = await flaskRes.json();
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
