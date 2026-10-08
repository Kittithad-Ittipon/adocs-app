import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { uploadsSchema } from "@/lib/validation/upload";

export async function GET() {
  try {
    const token = (await cookies()).get("token");
    if (!token) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/containers`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      cache: "no-store",
    });
    if (flaskRes.status === 204) return NextResponse.json([]);
    const flaskData = await flaskRes.json();
    if (flaskRes.status === 401 && flaskData?.error === "No Containers Data") {
      return NextResponse.json([]);
    }
    if (!flaskRes.ok) {
      return NextResponse.json(
        { error: flaskData.error },
        { status: flaskRes.status },
      );
    }
    if (!Array.isArray(flaskData) || !flaskData.every((item) => item !== null && typeof item === "object" && !Array.isArray(item))) {
      return NextResponse.json({ error: "Invalid container data returned by the service." }, { status: 502 });
    }
    const transformData = flaskData.map((item: Record<string, unknown>) => ({
      containerName: item.container_name,
      domain: item.domain,
      image: item.type,
      upDateTime: item.updated_at,
      status: item.status,
      protocol: item.forward_scheme,
      port: item.port_internal,
      projectPath: item.project_path,
      publish: item.publish,
    }));
    return NextResponse.json(transformData, { status: flaskRes.status });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token");
    const formData = await request.formData();
    if (!token) {
      return NextResponse.json({ error: "No Token Found" }, { status: 401 });
    }
    const body = {
      file: formData.get("file"),
      serviceName: formData.get("serviceName"),
      port: String(formData.get("port")),
      domain: formData.get("domain"),
      uploadType: formData.get("uploadType"),
    };
    const result = uploadsSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const flaskRes = await fetch(`${process.env.NEXTAPI_URL}/containers`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token.value}`,
      },
      body: formData,
    });
    const flaskData = await flaskRes.json();
    if (!flaskRes.ok) {
      return NextResponse.json(flaskData, { status: flaskRes.status });
    }
    return NextResponse.json(flaskData, { status: flaskRes.status });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
