"use client";

import axios from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Exam } from "@/app/generated/prisma/client";

export function Exams() {
  const [exams, setExams] = useState<
    (Exam & { _count: { questions: number } })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      await axios
        .get("/api/exam")
        .then((res) => {
          return setExams(res.data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    fetchExams();
  }, []);

  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return exams.map((exam) => (
    <Link
      key={exam.id}
      href={`/dashboard/exam/${exam.id}`}
      className="flex flex-col gap-2 min-w-50 rounded-md border p-4"
    >
      <h2 className="text-lg font-semibold">{exam.name}</h2>
      <p className="text-sm text-muted-foreground">
        {exam._count.questions} questions
      </p>
    </Link>
  ));
}
