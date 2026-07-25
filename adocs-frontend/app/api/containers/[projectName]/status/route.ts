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
    const { projectPath, containerStatus } = await request.json();
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/containers/${projectName}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({ projectPath, containerStatus }),
      },
    );
    const flaskData = await flaskRes.json();
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
