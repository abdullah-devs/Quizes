'use client'

import { Answer, Choice, Student } from "@/app/generated/prisma/client";
import axios from "axios"
import Image from "next/image";
import { useEffect, useState } from "react";
import { createAvatar } from '@dicebear/core';
import * as notionists from '@dicebear/notionists';

export default function RoomEndResults({ roomCode }: { roomCode: string }) {
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
            <div className="flex flex-col w-full items-center justify-center">
                {results?.results.map((student) => (
                    <div key={student.id} className="flex flex-row items-center justify-center border rounded p-4 w-full md:w-1/2 font-semibold text-white">
                        <div className="w-24 h-24 rounded-full overflow-hidden">
                        <Image draggable={false} width={100} height={100} src={createAvatar(notionists, { seed: student.avatarName }).toDataUri()} alt={student.name} />
                        </div>
                        <h2 className="text-xl">{student.name}</h2>
                        <p className="mt-2 text-lg">{student.answers.filter((a) => a.choice.correct).length} / {results.totalQuestions}</p>
                    </div>
                ))}
            </div>
        )
}