import { registerSchema } from "@/lib/validation";
import connectDB from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((err: { message: string }) => err.message).join(", ") }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    await connectDB();
    const existingUser = await User.findOne({ email });


    if (existingUser) {
      return NextResponse.json({ error: "This email has already been recorded" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();

    return NextResponse.json({ message: "signup successful", user: { id: newUser._id, email: newUser.email, name: newUser.name} }, { status: 201 });
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json({ error: "Server internal error" }, { status: 500 });
  }
}
