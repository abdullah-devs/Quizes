import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ examId: string }> }) {
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
          include: {
            questions: {
                include: {
                    choices: true,
                }
            }
          }
      });

      if (!exam) {
        return new NextResponse("Exam not found", { status: 404 });
      }
  
      return NextResponse.json(exam);
    } catch (error) {
      console.log(error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }

export async function DELETE(request: Request, { params }: { params: Promise<{ examId: string }> }) {
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
          include: {
            questions: true
          }
      });

      if (!exam) {
        return new NextResponse("Exam not found", { status: 404 });
      }

      await db.exam.delete({
        where: {
          id: exam.id,
        }
      });
  
      return NextResponse.json(exam);
    } catch (error) {
      console.log(error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }