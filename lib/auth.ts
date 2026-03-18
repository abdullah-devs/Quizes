"use server";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

type payload = {
  id: number;
  type: "ADMIN" | "STUDENT";
};

import db from "@/lib/db";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function generateToken(data: payload) {
  return await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function decodeToken(token: string) {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  return payload as payload;
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;

  if (!session) return null;

  return await decodeToken(session);
}

export type currentUser = {
  id: number;
  name: string;
  email: string;
  type: "ADMIN";
} | null;

export async function getCurrentUser() {
  const session = (await cookies()).get("session")?.value;

  if (!session) return null;

  const { id, type } = await decodeToken(session);

  if (type !== "ADMIN") {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    return null;
  }

  return { ...user, type };
}

export type currentStudent = {
  id: number;
  name: string;
  avatarName: string;
  type: "STUDENT";
  roomId: number;
} | null;

export async function getCurrentStudent() {
  const session = (await cookies()).get("session")?.value;

  if (!session) return null;

  const { id, type } = await decodeToken(session);

  if (type !== "STUDENT") {
    return null;
  }

  const student = await db.student.findUnique({
    where: {
      id,
    },
  });

  if (!student) {
    return null;
  }

  return { ...student, type };
}
