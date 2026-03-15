import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({
  adapter,
});

async function main() {
  const password = "12345678";
  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.create({
    data: {
      name: "Admin User",
      email: "admin@user.com",
      password: hashedPassword,
    },
  });
}
main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
