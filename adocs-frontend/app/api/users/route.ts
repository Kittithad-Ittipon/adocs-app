import { registerSchema } from "@/lib/validation/register";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const { username, email, password, dbState } = result.data;
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": clientIP },
      body: JSON.stringify({ username, email, password, dbState }),
    });
    const flaskData = await flaskRes.json();
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/users`, {
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
      email: item.email,
      role: item.role,
      container: item.container,
      maxContainer: item.max_containers,
      db: item.db,
      requestDB: item.req_db,
      usersStatus: item.status,
    }));
    return NextResponse.json(transformData, { status: flaskRes.status });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
