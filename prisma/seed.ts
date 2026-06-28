import { PrismaClient, DayStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "guide@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, name: "Guide", passwordHash, role: "admin" },
  });
  console.log(`✓ Admin ready: ${email} (password: ${password})`);

  // Seed the next 20 days as AVAILABLE so the calendar isn't empty on first run.
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 2; i < 22; i++) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + i);
    await prisma.availability.upsert({
      where: { date },
      update: {},
      create: { date, status: DayStatus.AVAILABLE },
    });
  }
  console.log("✓ Seeded 20 available days");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
