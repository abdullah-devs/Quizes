'use client'

import { cn } from '@/lib/utils';
import { createAvatar } from '@dicebear/core';
import * as notionists from '@dicebear/notionists';
import Image from 'next/image';
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export function CreateStudentProfile({ roomCode }: { roomCode: string }) {
    const [avatar, setAvatar] = useState<string>();
    const [name, setName] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hide, setHide] = useState<boolean>(false);

const t = createAvatar(notionists, {
  seed: 't',
});

const lun = createAvatar(notionists, {
  seed: 'laKwewaraLsWoooooospweawewewrefdretrtfgfbvcxswerfg',
});

const y = createAvatar(notionists, {
  seed: 'y',
});

const m = createAvatar(notionists, {
  seed: 'm',
});

const avatars = [
    { name: "t", avatar: t },
    { name: "m", avatar: m },
    { name: "laKwewaraLsWoooooospweawewewrefdretrtfgfbvcxswerfg", avatar: lun },
    { name: "y", avatar: y },
];

async function registerStudent() {
    setIsLoading(true);

    await axios.post(`/api/room/${roomCode}/guest`, {
        name,
        avatarName: avatar,
    }).then(() => {
        setHide(true);
    }).catch((err) => {
        setError(err.response.data);
    })
    .finally(() => {
        setIsLoading(false);
    })
}

    return !hide && (
        <div className="z-50 flex h-screen bg-fuchsia-600 flex-col items-center justify-center w-screen top-0 left-0 fixed p-8">
            <div className="flex flex-col md:items-center justify-center mt-8 max-w-lg">
                <h1 className="text-2xl text-white font-semibold mb-4">Choose an avatar</h1>
            <div className='flex flex-wrap gap-2'>
                {avatars.map((a) => (
                    <button key={a.name} className={cn('cursor-pointer bg-white rounded-full overflow-hidden duration-200 border-2 border-transparent', avatar == a.name && "border-black")} onClick={() => setAvatar(a.name)}>
                <Image draggable={false} src={a.avatar.toDataUri()} width={100} height={100} alt={a.name} />
            </button>))}
            </div>
            </div>
            <div className="flex flex-col md:items-center justify-center mt-8 w-full max-w-lg">
                <h2 className="text-xl text-white font-semibold mb-4">Enter your name</h2>
            <Input
                onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                }}
                value={name}
                placeholder="Enter your name"
                className={cn("text-lg! bg-white w-full py-5 px-4 md:max-w-xs border-2", error && "border-red-500")}
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <Button className='mt-6 text-white bg-fuchsia-800 w-full md:max-w-xs font-semibold text-lg py-5' disabled={!avatar || !name || isLoading} onClick={registerStudent}>
                {isLoading && <Loader2 className='animate-spin' />}
                Enter Room
            </Button>
            </div>
        </div>
    )
}