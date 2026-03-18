"use client";

import axios from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Room } from "@/app/generated/prisma/client";

export function Rooms() {
  const [rooms, setRooms] = useState<
    Room[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      await axios
        .get("/api/room")
        .then((res) => {
          return setRooms(res.data);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    fetchRooms();
  }, []);

  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return rooms.map((room) => (
    <Link
      key={room.id}
      href={`/room/${room.code}`}
      className="flex flex-col gap-2 min-w-50 rounded-md border p-4"
    >
      <h2 className="text-lg font-semibold">{room.code}</h2>
    </Link>
  ));
}
