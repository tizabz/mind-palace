import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
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

  user.refreshToken = null;
  await user.save();

  return NextResponse.json({ message: "Logged out successfully" });
}
