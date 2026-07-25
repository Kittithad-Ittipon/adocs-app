import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/users/profile`, {
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
    const transformData = {
      username: flaskData.username,
      email: flaskData.email,
      db: flaskData.database,
      container: flaskData.container_used,
      maxContainers: flaskData.max_containers,
      role: flaskData.role,
      userUploadTotal: flaskData.user_upload_total,
    };
    return NextResponse.json(transformData, { status: flaskRes.status });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
