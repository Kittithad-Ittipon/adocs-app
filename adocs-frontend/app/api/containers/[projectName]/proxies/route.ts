import { containerProxySchema } from "@/lib/validation/container-proxy";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
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
    const result = containerProxySchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/containers/${encodeURIComponent(projectName)}/proxies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(result.data),
      },
    );
    const flaskData = await flaskRes.json();
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
