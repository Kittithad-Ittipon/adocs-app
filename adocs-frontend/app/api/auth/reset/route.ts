import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forgotRePasswordSchema } from "@/lib/validation/forgot-repassword";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = forgotRePasswordSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    const tokenForgot = (await cookies()).get("tokenForgot");
    if (!tokenForgot) {
      return NextResponse.json({ error: "Token Not Found" }, { status: 401 });
    }
    const { otpValue, password } = result.data;
    const flaskRes = await fetch(
      `${process.env.NEXTAPI_URL}/auth/reset`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenForgot.value}`,
        },
        body: JSON.stringify({ otpValue, password }),
      },
    );
    const flaskData = await flaskRes.json();
    if (!flaskRes.ok) {
      return NextResponse.json(flaskData, { status: flaskRes.status });
    }
    const response = NextResponse.json(flaskData, { status: flaskRes.status });
    response.cookies.delete("tokenForgot");
    return response;
  } catch (error) {
    return Response.json({ error: "Server Error" }, { status: 500 });
  }
}
