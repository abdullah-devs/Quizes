'use client'

import { Choice, Exam, Question, Room } from "@/app/generated/prisma/client";
import { currentStudent, currentUser, getCurrentStudent, getCurrentUser } from "@/lib/auth";
import axios from "axios"
import { useEffect, useState } from "react"
import { CreateStudentProfile } from "./createStudentProfile";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { DeleteRoomConfirmation } from "./deleteRoomConfirmation";
import RoomWaitingDetails from "./roomWaitingDetails";
import RoomQuestionDetails from "./roomQuestionDetails";
import RoomEndResults from "./roomEndResults";

export default function RoomDetails({ roomCode, user, student }: { roomCode: string, user: currentUser, student: currentStudent }) {
    const [roomDetails, setRoomDetails] = useState<Room & { exam: Exam, question?: (Question & { choices: (Pick<Choice, "id" | "title"> & { chosen: boolean })[] }) | null }>();
    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(true);
    const [isMakingPublicLoading, setIsMakingPublicLoading] = useState(false);

    async function fetchRoomDetails() {
        await axios.get(`/api/room/${roomCode}`)
            .then((data) => {
                setRoomDetails(data.data);
            }).catch((err) => {
                setError(err.response.data);
            }).finally(() => {
                setIsLoading(false);
            })
    }

    async function makeRoomPublic() {
        setIsMakingPublicLoading(true);

        await axios.patch(`/api/room/${roomCode}`)
            .then(() => {
                fetchRoomDetails();
            }).catch((err) => {
                setError(err.response.data);
            }).finally(() => {
                setIsMakingPublicLoading(false);
            })
    }

    useEffect(() => {
        fetchRoomDetails()
    }, [roomCode])

    if (isLoading) {
        return <div className="flex h-screen w-full bg-fuchsia-600 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-white" />
        </div>
    }

    if (error) {
        return (<div className="flex h-screen w-full items-center justify-center font-medium text-2xl text-red-500">
            {error}
        </div>)
    }
    
    return (
        <>
    {!user && !student && <CreateStudentProfile roomCode={roomCode} />}
        <div className="flex bg-fuchsia-600 w-full h-screen items-center justify-center">
            {user?.id == roomDetails?.userId && !roomDetails?.public &&  (
                <div className="flex flex-col items-start justify-center text-white">
                    <h1 className="text-xl font-medium">Exam: {roomDetails?.exam.name}</h1>
                    <h1 className="text-xl font-medium">Time: 30 seconds for each question</h1>
                <Button onClick={makeRoomPublic} className='mt-6 text-fuchsia-600 bg-white w-full md:max-w-xs font-semibold text-lg py-5' disabled={isMakingPublicLoading}>
                    {isMakingPublicLoading && <Loader2 size={20} className="animate-spin" />}
                Make Room Public
            </Button>
            <DeleteRoomConfirmation roomCode={roomCode} />
            </div>
            )}
            {roomDetails?.public && !roomDetails.startAt && <RoomWaitingDetails roomCode={roomCode} isOwner={user?.id == roomDetails.userId} onStart={(question) => {
                setRoomDetails((prev) => {
                    if (!prev) return prev;
                    const { startAt, ...rest } = question;
                    const choices = rest.choices.map((c) => {
                        return {
                            ...c,
                            chosen: false,
                        }
                    })
                    return {
                        ...prev,
                        startAt: startAt,
                        exam: {
                            ...prev.exam,
                        },
                        question: {
                            ...rest,
                            choices
                        },
                    }
                })
            }} />}
            {roomDetails?.startAt && !roomDetails.endAt && (
                <RoomQuestionDetails isOwner={user?.id == roomDetails.userId} roomCode={roomCode} question={roomDetails.question} startAt={roomDetails.startAt} fetchQuestion={fetchRoomDetails} />
            )}
            {roomDetails?.endAt && (
                <RoomEndResults roomCode={roomCode} />
            )}
        </div>
        </>
    )
}