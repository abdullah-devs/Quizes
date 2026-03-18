'use client'

import { Choice, Question, Student } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { pusherClient } from "@/lib/pusher";
import { createAvatar } from '@dicebear/core';
import * as notionists from '@dicebear/notionists';
import axios from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { QRCodeSVG } from 'qrcode.react';
import { cn } from "@/lib/utils";

export default function RoomWaitingDetails({ roomCode, isOwner, onStart }: { roomCode: string, isOwner: boolean, onStart?: (question: Question & { choices: Choice[], startAt: Date }) => void }) {
    const [isStarting, setIsStarting] = useState(false);
    const [guests, setGuests] = useState<Student[]>([]);
    const [started, setStarted] = useState(false);

    async function startExam() {
        setIsStarting(true);

        await axios.post(`/api/room/${roomCode}/start`).finally(() => {
            setIsStarting(false);
        })
    }

    useEffect(() => {
        async function getGuests() {
            await axios.get(`/api/room/${roomCode}/guest`).then((res) => {
                setGuests(res.data);
            })
        }

        getGuests();
    }, [])

    useEffect(() => {
        pusherClient.subscribe(roomCode);

        pusherClient.bind("guest-joined", (data: Student) => {
            setGuests((prev) => {
                if (prev.some((g) => g.id === data.id)) return prev;
                return [...prev, data];
            });
        
        });

        pusherClient.bind("exam-started", (data: Question & { choices: Choice[], startAt: Date }) => {
            if (!started) {
                setStarted(true);
                setTimeout(() => {
                    onStart?.(data);
                }, 200);
            }
        });

        return () => {
            pusherClient.unsubscribe(roomCode);
        }
    }, [])

    return (
        <div className={cn("flex flex-col h-screen w-full items-center justify-start p-8 pt-12 duration-200", started && "pointer-events-none opacity-0")}>
            <h2 className="mb-3 font-semibold text-white text-3xl">Room Code: {roomCode}</h2>
            <div className="flex flex-col items-center w-full md:max-w-lg gap-4">
            {isOwner ? (
                <Button className="bg-white font-semibold text-fuchsia-600 p-5 w-full text-lg" onClick={startExam} disabled={isStarting}>
                    {isStarting && <Loader2 className="animate-spin" />}
                    Start Exam</Button>
            ) : (
            <h1 className="text-2xl text-white font-bold">Waiting for host to start the exam...</h1>
            )}
            </div>
            <div className="flex flex-col items-start mt-12 w-full">
            <h1 className="font-semibold text-2xl text-white">Guests ({guests.length})</h1>
            <div className="flex flex-row w-full">
                {guests.map((g) => (
                    <div key={g.id} className="flex flex-col items-center justify-center mt-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden">
                            <Image draggable={false} width={100} height={100} src={createAvatar(notionists, { seed: g.avatarName }).toDataUri()} alt={g.name} />
                        </div>
                        <h1 className="text-white font-medium text-xl">{g.name}</h1>
                    </div>
                ))}
            </div>
            </div>
            {isOwner && <QRCodeSVG className="rounded-xl mt-4" size={200} marginSize={2} value={window.location.href} />}
        </div>
    )
}