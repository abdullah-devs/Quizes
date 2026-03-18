'use client'

import { Choice, Question } from "@/app/generated/prisma/client";
import { cn } from "@/lib/utils";
import axios from "axios";
import { use, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Check, X } from "lucide-react";

export default function RoomQuestionDetails({ isOwner, roomCode, question, startAt, fetchQuestion }: { isOwner: boolean, roomCode: string, question?: (Question & { choices: (Pick<Choice, "id" | "title"> & { chosen: boolean })[] }) | null, startAt: Date, fetchQuestion?: () => Promise<void> }) {
const [questionDetails, setQuestionDetails] = useState(question);
const [correctAnswer, setCorrectAnswer] = useState<Choice>();
 const [secondsRemaning, setSecondsRemaining] = useState(30);
 const [hidden, setHidden] = useState(true);
 const [isChooseLoading, setIsChooseLoading] = useState(false);
 const [status, setStatus] = useState<"answering" | "reveal">("answering");

 async function getCorrectAnswer() {
    await axios.get(`/api/room/${roomCode}/question/${questionDetails?.id}`).then((res) => {
        setCorrectAnswer(res.data);
    });
 }

 useEffect(() => {
    setQuestionDetails(question);
 }, [question])

 async function chooseAnswer(choiceId: number) {
    setIsChooseLoading(true);

    await axios.post(`/api/room/${roomCode}/question/${questionDetails?.id}`, {
        choiceId,
    }).then(() => {
        setQuestionDetails((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                choices: prev.choices.map((choice) => {
                    if (choice.id === choiceId) {
                        return {
                            ...choice,
                            chosen: true,
                        }
                    }

                    return {
                        ...choice,
                        chosen: false,
                    }
                })
            }
        })
    }).finally(() => {
        setIsChooseLoading(false);
    });
 }

 useEffect(() => {
    if (!hidden) {
    if (status === "reveal") {
        getCorrectAnswer();
    } else {
        setCorrectAnswer(undefined);
        setHidden(true);
        setTimeout(() => {
            fetchQuestion?.()
        }, 200);
        }
    }
}, [status]);

 const QUESTION_DURATION = 30;
 const SLOT_DURATION = 35;

 useEffect(() => {
    setHidden(false);

    function tick() {
        const elapsed = Math.floor((Date.now() - new Date(startAt).getTime()) / 1000);
        const positionInSlot = elapsed % SLOT_DURATION;

        if (positionInSlot < QUESTION_DURATION) {
            setSecondsRemaining(QUESTION_DURATION - positionInSlot);
            setStatus("answering");
        } else {
            setSecondsRemaining(SLOT_DURATION - positionInSlot);
            setStatus("reveal");
        }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
}, [startAt, question]);

    return (
        <div className={cn("flex flex-col h-screen w-full items-center justify-start p-8 pt-0 duration-200", hidden && "pointer-events-none opacity-0")}>
            <h1 className="my-6 text-5xl font-semibold text-white">{secondsRemaning}</h1>
            <div className="fixed bg-white p-1 w-full top-0 left-0 duration-200" style={{
                width: `${(secondsRemaning / (status == 'answering' ? 30 : 5)) * 100}%`
            }} />
            {isOwner && <h2 className="font-semibold text-white text-3xl mb-3">
            {" "}{questionDetails?.title.split("\n").map((line, i) => (
                <span key={i}>
                {line}
                <br />
                </span>
            ))}
            </h2>}
            <div className="flex flex-col items-center w-full md:max-w-lg gap-4">
                {questionDetails?.choices.map((choice, i) => (
                    <Button key={choice.id} className={cn("bg-white rounded-md px-4 py-2 w-full text-center", choice.chosen && "ring-2")} disabled={status === "reveal" || isOwner || questionDetails.choices.some((c) => c.chosen) || isChooseLoading} variant="outline" onClick={() => chooseAnswer(choice.id)}>
                        {correctAnswer?.id === choice.id && <Check />}
                        {correctAnswer && correctAnswer?.id != choice.id && choice.chosen && <X className="text-red-500" />}
                        {i + 1}{isOwner && (". " + choice.title)}
                    </Button>
                ))}
            </div>
        </div>
    )
}