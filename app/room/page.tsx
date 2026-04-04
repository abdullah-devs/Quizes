'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RoomCodePage() {
    const [roomCode, setRoomCode] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter()

    async function checkRoom() {
        setIsLoading(true);

        await axios.get(`/api/room/${roomCode}`)
        .then(() => {
            router.push(`/room/${roomCode}`);
        }).catch(() => {
            setError("Room not found");
        }).finally(() => {
            setIsLoading(false);
        })
    }

    return (
        <div className="flex justify-center items-center flex-col bg-fuchsia-700 text-white h-screen">
            <h1 className="font-semibold text-3xl">Enter a room</h1>
            <div className="flex gap-2 items-center mt-4">
            <Input disabled={isLoading} value={roomCode} onChange={(e) => {
                setRoomCode(e.target.value)
                setError("");
            }} className="w-48 text-center text-xl! py-5 placeholder:text-white/20 text-white bg-fuchsia-800 roundeds-lg border-2" placeholder="Room code" />
            <Button disabled={isLoading} onClick={checkRoom} className="font-semibold rounded-lg text-xl p-5.5 text-fuchsia-500 bg-white">
                Join
            </Button>
            </div>
            {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
    );
}