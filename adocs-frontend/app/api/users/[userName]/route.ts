import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { usersSchema } from "@/lib/validation/users-manage";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/users/${userName}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      },
    );
    const flaskData = await flaskRes.json();
    if (!flaskRes.ok) {
      return NextResponse.json(flaskData, { status: flaskRes.status });
    }
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userName: string }> },
) {
  try {
    const { userName } = await params;
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const body = await request.json();
    const result = usersSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const { maxContainers, useDB } = result.data;
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/users/${userName}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({
          maxContainers,
          useDB,
        }),
      },
    );
    const flaskData = await flaskRes.json();
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
