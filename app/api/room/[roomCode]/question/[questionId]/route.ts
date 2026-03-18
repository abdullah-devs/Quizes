import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ roomCode: string, questionId: string }> }) {
  try {
    const roomCode = (await params).roomCode;

    const room = await db.room.findUnique({
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
    
    if (!room.public) {
        return new NextResponse("Room not found", { status: 404 });
    }

    if (!room.startAt) {
        return new NextResponse("Exam has not started yet", { status: 403 });
    }

    if (room.endAt) {
        return new NextResponse("Exam has already ended", { status: 403 });
    }

    const questionIdString = (await params).questionId;
    const questionId = parseInt(questionIdString);

    const questions = await db.question.findMany({
        where: {
            examId: room.examId,
        },
        include: {
            choices: true,
        },
        orderBy: {
            createdAt: "asc",
        }
    });

    if (!questions.find((q) => q.id === questionId)) {
        return new NextResponse("Question not found", { status: 404 });
    }

    const QUESTION_DURATION = 30 * 1000;
    const ANSWER_REVEAL = 5 * 1000;
    const SLOT_DURATION = QUESTION_DURATION + ANSWER_REVEAL;

    const questionIndex = questions.findIndex((q) => q.id === questionId);
    const questionStartTime = new Date(room.startAt).getTime() + questionIndex * SLOT_DURATION;
    const answerRevealStart = questionStartTime + QUESTION_DURATION;
    const answerRevealEnd = answerRevealStart + ANSWER_REVEAL;
    const currentTime = Date.now();

    if (currentTime < answerRevealStart) {
        return new NextResponse("Question answer not revealed yet", { status: 403 });
    }

    if (currentTime > answerRevealEnd) {
        return new NextResponse("Answer reveal window has passed", { status: 403 });
    }

    if (currentTime < questionStartTime) {
        return new NextResponse("Question has not started yet", { status: 403 });
    }

    const question = questions.find((q) => q.id === questionId);
    const correctAnswer = question?.choices.find((c) => c.correct);

    return NextResponse.json(correctAnswer);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ roomCode: string, questionId: string }> }) {
  try {
    const student = await getCurrentStudent();

    if (!student) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const Data = await request.json().catch(() => {
        return new NextResponse("Missing info", { status: 400 });
    });

    if (!Data) {
        return new NextResponse("Missing info", { status: 400 });
    }

    const { choiceId } = Data;

    if (!choiceId) {
        return new NextResponse("Missing info", { status: 400 });
    }

    if (typeof choiceId != "number") {
        return new NextResponse("choiceId must be an integer", { status: 400 });
    }

    const roomCode = (await params).roomCode;

    const room = await db.room.findUnique({
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
    
    if (!room.public) {
        return new NextResponse("Room not found", { status: 404 });
    }

    if (!room.startAt) {
        return new NextResponse("Exam has not started yet", { status: 403 });
    }

    if (room.endAt) {
        return new NextResponse("Exam has already ended", { status: 403 });
    }

    if (student.roomId !== room.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const questionIdString = (await params).questionId;
    const questionId = parseInt(questionIdString);

    const questions = await db.question.findMany({
        where: {
            examId: room.examId,
        },
        include: {
            choices: true,
        },
        orderBy: {
            createdAt: "asc",
        }
    });

    if (!questions.find((q) => q.id === questionId)) {
        return new NextResponse("Question not found", { status: 404 });
    }

    const existingAnswer = await db.answer.findFirst({
        where: {
            studentId: student.id,
            questionId: questionId,
        }
    });

    if (existingAnswer) {
        return new NextResponse("You have already answered this question", { status: 403 });
    }

    const QUESTION_DURATION = 30 * 1000;
    const ANSWER_REVEAL = 5 * 1000;
    const SLOT_DURATION = QUESTION_DURATION + ANSWER_REVEAL;

    const questionIndex = questions.findIndex((q) => q.id === questionId);
    const questionStartTime = new Date(room.startAt).getTime() + questionIndex * SLOT_DURATION;
    const answerRevealStart = questionStartTime + QUESTION_DURATION;
    const currentTime = Date.now();

    if (currentTime >= answerRevealStart) {
        return new NextResponse("Answering period has passed", { status: 403 });
    }

    if (currentTime < questionStartTime) {
        return new NextResponse("Question has not started yet", { status: 403 });
    }

    const question = questions.find((q) => q.id === questionId);
    const choice = question?.choices.find((c) => c.id === choiceId);

    if (!choice) {
        return new NextResponse("Choice not found", { status: 404 });
    }

    const answer = await db.answer.create({
        data: {
            choiceId: choiceId,
            studentId: student.id,
            questionId: questionId,
            roomId: room.id,
        }
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}