import RoomDetails from "@/components/roomDetails";
import { getCurrentStudent, getCurrentUser } from "@/lib/auth";

export default async function RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
    const roomCode = (await params).roomCode

    const user = await getCurrentUser();
    const student = await getCurrentStudent();

    return (
        <div className="flex w-full items-center justify-center">
            <RoomDetails roomCode={roomCode} user={user} student={student} />
        </div>
    )
}