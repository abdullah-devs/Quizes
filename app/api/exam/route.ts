import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import db from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const exams = await db.exam.findMany({
        where: {
            userId: user.id,
        },
        include: {
            _count: {
                select: {
                    questions: true,
                }
            }
        }
    });

    return NextResponse.json(exams);
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
  
      const { name } = Data;
  
      if (!name) {
        return new NextResponse("Missing info", { status: 400 });
      }
  
      const exam = await db.exam.create({
        data: {
            name,
            userId: user.id,
        },
      });

      return NextResponse.json(exam, { status: 201 });
    } catch (error) {
      console.log(error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }