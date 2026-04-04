'use client'

import { Answer, Choice, Student } from "@/app/generated/prisma/client";
import axios from "axios"
import Image from "next/image";
import { useEffect, useState } from "react";
import { createAvatar } from '@dicebear/core';
import * as notionists from '@dicebear/notionists';
import Link from "next/link";
import { Button } from "./ui/button";

export default function RoomEndResults({ roomCode, isOwner }: { roomCode: string, isOwner: boolean }) {
    const [results, setResults] = useState<{ results: (Student & { answers: (Answer & { choice: Choice })[] })[], totalQuestions: number }>();

    async function getResults() {
        await axios.get(`/api/room/${roomCode}/result`).then((res) => {
            setResults(res.data);
            console.log(res.data)
        })
    }

    useEffect(() => {
        getResults();
    }, [])

        return (
            <div className="flex flex-col w-full items-center justify-center p-4">
                <div className="flex flex-row items-center justify-between border-b p-2 w-full md:w-1/2 font-bold text-white">
                    <h1>Avatar</h1>
                    <h1>Name</h1>
                    <h1>Correct <br />
                    Answers</h1>
                </div>
                {results?.results.map((student) => (
                    <div key={student.id} className="flex flex-row items-center justify-between border-b p-2 w-full md:w-1/2 font-semibold text-white">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-white">
                        <Image draggable={false} width={100} height={100} src={createAvatar(notionists, { seed: student.avatarName }).toDataUri()} alt={student.name} />
                        </div>
                        <h2 className="text-xl">{student.name}</h2>
                        <p className="mt-2 text-lg">{student.answers.filter((a) => a.choice.correct).length} / {results.totalQuestions}</p>
                    </div>
                ))}
            {isOwner && (
                <Link href="/dashboard" className="mt-4">
                    <Button className="bg-white p-6 rounded-lg text-fuchsia-600 font-semibold text-xl">Go back to dashboard</Button>
                </Link>
            )}
            </div>
        )
}