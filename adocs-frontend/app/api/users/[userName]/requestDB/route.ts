import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;
    const { requestDB } = await request.json();
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/users/${userName}/requestDB`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({ requestDB }),
    });
    const flaskData = await flaskRes.json();
    if (!flaskRes.ok) {
      return NextResponse.json(flaskData, { status: flaskRes.status });
    }
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
