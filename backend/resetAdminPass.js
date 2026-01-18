import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const hash = await bcrypt.hash("Admin@123", 10);

  await prisma.user.update({
    where: { email: "admin@test.com" },
    data: { passwordHash: hash }
  });

  console.log("✅ Admin password reset to Admin@123");
}

resetAdminPassword()
  .finally(() => prisma.$disconnect());
