import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Decision from "@/models/Decision";

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  return userId ?? null;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const decisions = await Decision.find({ userId })
    .sort({ updatedAt: -1 })
    .lean<Array<{ _id: { toString(): string } } & Record<string, unknown>>>();
  return NextResponse.json({
    decisions: decisions.map(({ _id, ...rest }) => ({
      ...rest,
      id: _id.toString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title : "Untitled Decision";
  const description =
    typeof body.description === "string" ? body.description : undefined;

  await connectDB();
  const created = await Decision.create({
    userId,
    title,
    description,
    factors: body.factors ?? [],
    options: body.options ?? [],
  });
  const json = created.toJSON();
  return NextResponse.json({ decision: json }, { status: 201 });
}
