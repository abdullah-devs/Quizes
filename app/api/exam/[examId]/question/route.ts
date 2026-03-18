import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const examIdString = (await params).examId;
    const examId = parseInt(examIdString);

    const exam = await db.exam.findUnique({
      where: {
        id: examId,
        userId: user.id,
      },
    });

    if (!exam) {
      return new NextResponse("Exam not found", { status: 404 });
    }

    const Data = await request.json().catch(() => {
      return new NextResponse("Missing info", { status: 400 });
    });

    if (!Data) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const { title, choices } = Data;

    if (!title || !choices) {
      return new NextResponse("Missing info", { status: 400 });
    }

    if (typeof title != "string") {
      return new NextResponse("title must be a string", { status: 400 });
    }

    if (!Array.isArray(choices)) {
      return new NextResponse("choices must be an array", { status: 400 });
    }

    let correctCount = 0;
    for (const choice of choices) {
      if (
        typeof choice.title != "string" ||
        typeof choice.correct != "boolean"
      ) {
        return new NextResponse(
          "each choice must have a title string field and a correct boolean field",
          { status: 400 },
        );
      }

      if (choice.correct) {
        correctCount++;
      }
    }

    if (correctCount != 1) {
      return new NextResponse("there must be exactly one correct choice", {
        status: 400,
      });
    }

    const question = await db.question.create({
      data: {
        title,
        examId,
        choices: {
          createMany: {
            data: choices.map(
              (choice: { title: string; correct: boolean }) => ({
                title: choice.title,
                correct: choice.correct,
              }),
            ),
          },
        },
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
