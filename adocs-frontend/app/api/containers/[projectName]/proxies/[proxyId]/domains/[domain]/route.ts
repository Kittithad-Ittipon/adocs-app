import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectName: string; proxyId: string; domain: string }> },
) {
  try {
    const { projectName, proxyId, domain } = await params;
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    if (!/^\d+$/.test(proxyId) || !/^[a-z0-9.*-]+$/i.test(domain)) {
      return NextResponse.json({ error: "Invalid proxy host or domain." }, { status: 400 });
    }
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/containers/${encodeURIComponent(projectName)}/proxies/${proxyId}/domains/${encodeURIComponent(domain)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token.value}` },
      },
    );
    const flaskData = await flaskRes.json();
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
