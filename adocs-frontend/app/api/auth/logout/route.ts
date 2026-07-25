import { NextResponse } from "next/server";

export async function DELETE() {
  const response = NextResponse.json({ message: "Logout Successfuly." });
  response.cookies.delete("token");
  response.cookies.delete("tokenForgot");
  return response;
}
