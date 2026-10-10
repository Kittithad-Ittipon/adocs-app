import { sessionRequest } from "@/lib/session-api";
import { NextResponse } from "next/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
    return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
  }
  return sessionRequest(`/sessions/${encodeURIComponent(sessionId)}`, "DELETE");
}
