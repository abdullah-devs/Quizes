import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request, { params }: { params: Promise<{ roomCode: string }> }) {
    try {
      const user = await getCurrentUser();
  
      if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
  
      const roomCode = (await params).roomCode;
  
      const room = await db.room.findUnique({
          where: {
              code: roomCode,
              userId: user.id,
              public: true,
          },
      });
  
      if (!room) {
          return new NextResponse("Room not found", { status: 404 });
      }
      
      if (room.startAt) {
          return new NextResponse("Room already started", { status: 403 });
      }
  
      const updatedRoom = await db.room.update({
          where: {
              code: roomCode,
          },
          data: {
              startAt: new Date(),
          },
      });

      const firstQuestion = await db.question.findFirst({
        where: {
            examId: room.examId,
        },
        select: {
            id: true,
            title: true,
            choices: {
                select: {
                    id: true,
                    title: true,
                },
                orderBy: {
                    createdAt: "asc",
                }
            },
        },
        orderBy: {
            createdAt: "asc",
        },
      });

      await pusherServer.trigger(room.code, "exam-started", { ...firstQuestion, startAt: updatedRoom.startAt });
  
      return NextResponse.json(updatedRoom);
    } catch (error) {
      console.log(error);
      return new NextResponse("Internal Error", { status: 500 });
    }
}