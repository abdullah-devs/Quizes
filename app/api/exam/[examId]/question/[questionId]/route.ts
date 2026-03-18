import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ examId: string; questionId: string }> },
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const examIdString = (await params).examId;
    const examId = parseInt(examIdString);
    const questionIdString = (await params).questionId;
    const questionId = parseInt(questionIdString);

    const exam = await db.exam.findUnique({
      where: {
        id: examId,
        userId: user.id,
      },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      return new NextResponse("Exam not found", { status: 404 });
    }

    const question = await db.question.findUnique({
      where: {
        id: questionId,
        examId: examId,
      },
    });

    if (!question) {
      return new NextResponse("Question not found", { status: 404 });
    }

    await db.question.delete({
      where: {
        id: question.id,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
