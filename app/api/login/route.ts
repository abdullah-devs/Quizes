import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const Data = await request.json().catch(() => {
      return new NextResponse("Missing info", { status: 400 });
    });

    if (!Data) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const { email, password } = Data;

    if (!email || !password) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return new NextResponse("Invalid email or password", { status: 400 });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return new NextResponse("Invalid email or password", { status: 400 });
    }

    const session = await generateToken({
      id: user.id,
      type: "ADMIN",
    });

    const response = NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 200 },
    );

    response.cookies.set({
      name: "session",
      value: session,
      httpOnly: true,
      maxAge: 30 * 86400,
    });

    return response;
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
