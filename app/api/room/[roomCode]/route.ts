import { NextResponse } from "next/server";
import { getCurrentStudent, getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ roomCode: string }> }) {
  try {
    const user = await getCurrentUser();
    const student = await getCurrentStudent();

    const roomCode = (await params).roomCode;

    let room = await db.room.findUnique({
        where: {
            code: roomCode,
        },
        include: {
            exam: true,
        }
    });

    if (!room) {
        return new NextResponse("Room not found", { status: 404 });
    }
    
    if (room.userId !== user?.id && !room.public) {
        return new NextResponse("Room not found", { status: 404 });
    }

    let question;

    if (room.startAt && !room.endAt && room.public) {
      const howManySecondsPassed = Math.floor((new Date().getTime() - new Date(room.startAt).getTime()) / 1000);
      const questionIndex = Math.floor(howManySecondsPassed / 35);

      question = await db.question.findFirst({
        where: {
          examId: room.examId,
        },
        include: {
          choices: {
            select: {
              id: true,
              title: true,
            }
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        skip: questionIndex,
      });

      if (!question) {
        room = await db.room.update({
          where: {
            code: roomCode,
          },
          data: {
            endAt: new Date(),
          },
        include: {
            exam: true,
        }
        });

        return NextResponse.json({ ...room, question });
      }

      if (!!student && student.roomId == room.id) {
        const chosenAnswer = await db.answer.findFirst({
          where: {
            studentId: student.id,
            questionId: question?.id,
          }
        });

        if (chosenAnswer && question) {
          question.choices = question?.choices.map((choice) => {
              return {
                ...choice,
                chosen: choice.id === chosenAnswer.choiceId,
              }
          })
        }
      } else if (question) {
        question.choices = question?.choices.map((choice) => {
          return {
            ...choice,
            chosen: false,
          }
      })
      }
    }

    return NextResponse.json({ ...room, question });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ roomCode: string }> }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const roomCode = (await params).roomCode;

    const room = await db.room.findUnique({
        where: {
            code: roomCode,
            userId: user?.id,
        },
    });

    if (!room) {
        return new NextResponse("Room not found", { status: 404 });
    }
    
    if (room.public) {
        return new NextResponse("Room is already public", { status: 403 });
    }

    const updatedRoom = await db.room.update({
        where: {
            code: roomCode,
        },
        data: {
            public: true,
        },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ roomCode: string }> }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const roomCode = (await params).roomCode;

    const room = await db.room.findUnique({
        where: {
            code: roomCode,
            userId: user?.id,
        },
    });

    if (!room) {
        return new NextResponse("Room not found", { status: 404 });
    }

    await db.room.delete({
        where: {
            code: roomCode,
        },
    });

    return new NextResponse("Room deleted successfully", { status: 200 });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}