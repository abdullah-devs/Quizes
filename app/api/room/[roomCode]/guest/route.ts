import { NextResponse } from "next/server";
import db from "@/lib/db";
import { generateToken, getCurrentStudent } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request, { params }: { params: Promise<{ roomCode: string }> }) {
  try {
    const student = await getCurrentStudent();

    const Data = await request.json().catch(() => {
      return new NextResponse("Missing info", { status: 400 });
    });

    if (!Data) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const { name, avatarName } = Data;

    if (!name || !avatarName) {
      return new NextResponse("Missing info", { status: 400 });
    }

    if (typeof name !== "string" || typeof avatarName !== "string") {
      return new NextResponse("Invalid info", { status: 400 });
    }

    if (name.length < 3 || name.length > 50) {
      return new NextResponse("Name must be more than 3 characters and less than 50 characters", { status: 400 });
    }

    const roomCode = (await params).roomCode;

    const room = await db.room.findUnique({
        where: {
            code: roomCode,
            public: true,
        },
    });

    if (!room) {
        return new NextResponse("Room not found", { status: 404 });
    }

    if (room.id == student?.roomId) {
        return new NextResponse("You are already in this room", { status: 400 });
    }

    const newStudent = await db.student.create({
        data: {
            name,
            avatarName,
            roomId: room.id,
        },
    });

    const session = await generateToken({
      id: newStudent.id,
      type: "STUDENT",
    });

    await pusherServer.trigger(room.code, "guest-joined", {
      id: newStudent.id,
      name: newStudent.name,
      avatarName: newStudent.avatarName,
    });

    const response = NextResponse.json(
      { id: newStudent.id, name: newStudent.name },
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

export async function GET(request: Request, { params }: { params: Promise<{ roomCode: string }> }) {
  try {
    const roomCode = (await params).roomCode;

    const room = await db.room.findUnique({
        where: {
            code: roomCode,
            public: true,
        },
        include: {
            students: true,
        },
    });

    if (!room) {
        return new NextResponse("Room not found", { status: 404 });
    }

    const { students, ...roomWithoutStudents } = room;

    return NextResponse.json(students);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
