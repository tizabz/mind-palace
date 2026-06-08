import { loginSchema } from "@/lib/validation";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt, { type SignOptions } from "jsonwebtoken";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues
            .map((err: { message: string }) => err.message)
            .join(", "),
        },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "The email or password is wrong." },
        { status: 404 },
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "The email or password is wrong." },
        { status: 401 },
      );
    }

    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.ACCESS_TE } as SignOptions,
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.REFRESH_TE } as SignOptions,
    );
    return NextResponse.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "Server internal error" },
      { status: 500 },
    );
  }
}
