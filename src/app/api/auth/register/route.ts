import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");
    const name = String(body.name || "").trim();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email and password (min 6 chars) are required" },
        { status: 400 },
      );
    }

    await connectMongo();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      name,
      plan: "free",
      planStatus: "active",
    });

    return NextResponse.json(
      { id: String(user._id), email: user.email, plan: user.plan },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const isConn =
      message.includes("ECONNREFUSED") || message.includes("Mongo");
    return NextResponse.json(
      {
        error: isConn
          ? "Cannot connect to MongoDB. Start MongoDB locally or set MONGODB_URI in .env.local"
          : message,
      },
      { status: 500 },
    );
  }
}
