import { NextResponse } from "next/server";
import { getCurrentStudent, getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ roomCode: string }> }) {
  try {
    const roomCode = (await params).roomCode;

    let room = await db.room.findUnique({
        where: {
            code: roomCode,
        },
        include: {
            exam: {
                select: {
                    _count: {
                        select: {
                            questions: true,
                        }
                    }
                }
            }
        }
    });

    if (!room) {
        return new NextResponse("Room not found", { status: 404 });
    }
    
    if (!room.public) {
        return new NextResponse("Room not found", { status: 404 });
    }

    if (!room.endAt) {
        return new NextResponse("Exam has not ended yet", { status: 403 });
    }

    const studentsWithResults = await db.student.findMany({
        where: {
            roomId: room.id,
        },
        include: {
            answers: {
                include: {
                    choice: true,
                },
            }
        },
    });

    const sorted = studentsWithResults
  .map((student) => {
    const correctCount = student.answers.filter(
      (a) => a.choice?.correct
    ).length;

    return {
      ...student,
      correctCount,
    };
  })
  .sort((a, b) => b.correctCount - a.correctCount);

    return NextResponse.json({ results: sorted, totalQuestions: room.exam._count.questions });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}