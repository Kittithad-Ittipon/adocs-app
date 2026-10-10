import { sessionRequest } from "@/lib/session-api";

export async function GET() {
  return sessionRequest("/sessions");
}
