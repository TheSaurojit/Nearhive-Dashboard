// app/api/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/firebase/firebase-admin";
import { dump } from "@/helper/helper";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  const expiresIn = 24 * 60 * 60 * 1000 ;

  try {
    const sessionCookie = await adminAuth.createSessionCookie(token, { expiresIn });

    // const res = await adminAuth.verifyIdToken(token)

    dump("creating session");

    // Set HTTP-only cookie
    (await cookies()).set("__session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expiresIn / 1000
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Invalid token:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
