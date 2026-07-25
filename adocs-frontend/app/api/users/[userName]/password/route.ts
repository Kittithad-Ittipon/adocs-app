import { rePasswordSchema } from "@/lib/validation/re-password";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;
    const body = await request.json();
    const result = rePasswordSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const { password, newPassword } = result.data;
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/users/${userName}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({ password, newPassword }),
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
