import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import jwt from "jsonwebtoken";
import User from "@/models/User";

export async function POST(req: Request) {
  const { refreshToken } = await req.json();

  if (!refreshToken) {
    return NextResponse.json({ message: "Refresh token is required" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ refreshToken });
  if (!user) {
    return NextResponse.json({ message: "Invalid refresh token" }, { status: 403 });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.Access_TE }
    );

    return NextResponse.json({ accessToken: newAccessToken });
  } catch (error) {
    return NextResponse.json({ message: "Invalid refresh token" }, { status: 403 });
  }
}
