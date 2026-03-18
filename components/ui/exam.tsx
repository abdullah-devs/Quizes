"use client";

import axios from "axios";
import { Check, FileVideo, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Choice, Exam, Question } from "@/app/generated/prisma/client";
import { CreateQuestionDialog } from "../createQuestionDialog";
import { DeleteQuestionConfirmation } from "../deleteQuestionConfirmation";
import { DeleteExamConfirmation } from "../deleteExamConfirmation";

export default function Exam({ id }: { id: number }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();
  const [exam, setExam] = useState<
    Exam & { questions: (Question & { choices: Choice[] })[] }
  >();

  async function fetchExam() {
    await axios
      .get(`/api/exam/${id}`)
      .then((res) => {
        setExam(res.data);
      })
      .catch((err) => {
        setError(err.response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchExam();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full justify-center items-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col w-full justify-center p-8 md:px-24 lg:px-64">
      <div className="flex justify-between w-full">
        <h1 className="text-2xl font-bold">{exam?.name}</h1>
        <CreateQuestionDialog examId={id} onCreate={fetchExam} />
      </div>
      <div className="flex flex-col gap-4 w-full my-4">
        {exam?.questions.map((question, i) => (
          <div
            key={question.id}
            className="flex flex-col gap-2 rounded-md border p-4 w-full"
          >
            <h2 className="text-lg font-semibold">
            {i + 1}.{" "}{question.title.split("\n").map((line, i) => (
                <span key={i}>
                {line}
                <br />
                </span>
            ))}
            </h2>
            <div className="flex flex-col gap-1">
              {question.choices.map((choice) => (
                <div
                  key={choice.id}
                  className={`flex items-start gap-1 ${
                    choice.correct ? "text-green-500" : ""
                  }`}
                >
                  {choice.correct && <Check className="mt-1" size={16} />}
                  <span>{choice.title.split("\n").map((line, i) => (
                        <span key={i}>
                            {line}
                            <br />
                        </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
            <DeleteQuestionConfirmation
              examId={id}
              questionId={question.id}
              onDelete={fetchExam}
            />
          </div>
        ))}
      </div>
      <DeleteExamConfirmation examId={id} />
    </div>
  );
}
