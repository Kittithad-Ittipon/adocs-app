import { containersSchema } from "@/lib/validation/containers-manage";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectName: string }> },
) {
  try {
    const { projectName } = await params;
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const body = await request.json();
    const result = containersSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const { port, containerName, protocol, publish } = result.data;
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/containers/${projectName}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({
          port: parseInt(port),
          containerName,
          protocol,
          publish,
        }),
      },
    );
    const flaskData = await flaskRes.json();
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectName: string }> },
) {
  try {
    const { projectName } = await params;
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const { projectPath } = await request.json();
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/containers/${projectName}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({ projectPath }),
      },
    );
    const flaskData = await flaskRes.json();
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
