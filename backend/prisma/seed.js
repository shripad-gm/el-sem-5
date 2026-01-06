import prisma from "../src/config/db.js";



async function main() {
 console.log("🌱 Seeding admin user...");

  // 1️⃣ Find user (by email or id)
  const user = await prisma.user.findUnique({
    where: { email: "admin@test.com" }
  });

  if (!user) {
    throw new Error("Admin user not found");
  }

  // 2️⃣ Create admin profile
  await prisma.adminProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      adminLevel: 1
    }
  });

  // 3️⃣ Fetch department + locality
  const department = await prisma.department.findFirst({
    where: { name: "BBMP" }
  });

  const locality = await prisma.locality.findFirst();

  if (!department || !locality) {
    throw new Error("Department or locality missing");
  }

  // 4️⃣ Assign department
  await prisma.adminDepartment.upsert({
    where: {
      adminUserId_departmentId: {
        adminUserId: user.id,
        departmentId: department.id
      }
    },
    update: {},
    create: {
      adminUserId: user.id,
      departmentId: department.id
    }
  });

  // 5️⃣ Assign locality
  await prisma.adminLocality.upsert({
    where: {
      adminUserId_localityId: {
        adminUserId: user.id,
        localityId: locality.id
      }
    },
    update: {},
    create: {
      adminUserId: user.id,
      localityId: locality.id
    }
  });

  console.log("✅ Admin seeded successfully");
}

main()
  .catch((error) => {
    console.error("❌ SLA seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
