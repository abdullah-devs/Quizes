import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const rooms = await db.room.findMany({
        where: {
            userId: user.id,
        },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

      const Data = await request.json().catch(() => {
        return new NextResponse("Missing info", { status: 400 });
      });
  
      if (!Data) {
        return new NextResponse("Missing info", { status: 400 });
      }
  
      const { examId } = Data;
  
      if (!examId) {
        return new NextResponse("Missing info", { status: 400 });
      }

      if (typeof examId != "number") {
        return new NextResponse("Invalid info data type", { status: 400 });
      }
  
      const exam = await db.exam.findUnique({
        where: {
            id: examId,
            userId: user.id,
        },
      });

        if (!exam) {
            return new NextResponse("Exam not found", { status: 404 });
        }

        const code = Math.random().toString(36).substring(2, 9).toLowerCase();

        const room = await db.room.create({
            data: {
                code,
                examId,
                userId: user.id,
            }
        });

      return NextResponse.json(room, { status: 201 });
    } catch (error) {
      console.log(error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }