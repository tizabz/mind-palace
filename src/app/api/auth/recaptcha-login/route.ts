import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ success: false, message: "Missing reCAPTCHA token" });
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  const res = await fetch(verifyUrl, { method: "POST" });
  const data = await res.json();

  if (!data.success || data.score < 0.5) {
    return NextResponse.json({ success: false, message: "reCAPTCHA failed" });
  }

  return NextResponse.json({ success: true });
}
