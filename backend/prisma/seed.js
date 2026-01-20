import prisma from "../src/config/db.js";
import bcrypt from "bcryptjs";


async function main() {
  console.log("👮 Seeding locality admins...");

  const PASSWORD = "Admin@123";
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // 1️⃣ Fetch required geo
  const city = await prisma.city.findFirst({ where: { name: "Bangalore" } });
  if (!city) throw new Error("City not found");

  const zone = await prisma.zone.findFirst({
    where: { name: "West Bangalore", cityId: city.id },
  });
  if (!zone) throw new Error("Zone not found");

  const locality = await prisma.locality.findFirst({
    where: { name: "Pattangere", zoneId: zone.id },
  });
  if (!locality) throw new Error("Locality not found");

  // 2️⃣ Ensure ADMIN role exists
  let adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: { name: "ADMIN" },
    });
  }

  // 3️⃣ Departments to seed admins for
  const departments = await prisma.department.findMany();

  for (const dept of departments) {
    const email = `${dept.name.toLowerCase().replace(/\s+/g, "")}.pattangere@admin.com`;

    // 4️⃣ Create User if not exists
    let user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: `${dept.name} Admin - Pattangere`,
          email,
          passwordHash,
          cityId: city.id,
          zoneId: zone.id,
          localityId: locality.id,
          isVerified: true,
        },
      });
      console.log(`✅ User created: ${email}`);
    }

    // 5️⃣ Assign ADMIN role
    const roleExists = await prisma.userRole.findFirst({
      where: { userId: user.id, roleId: adminRole.id },
    });

    if (!roleExists) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: adminRole.id },
      });
    }

    // 6️⃣ Create AdminProfile
    let adminProfile = await prisma.adminProfile.findUnique({
      where: { userId: user.id },
    });

    if (!adminProfile) {
      adminProfile = await prisma.adminProfile.create({
        data: {
          userId: user.id,
          adminLevel: 1, // locality-level admin
        },
      });
    }

    // 7️⃣ Link admin to department
    const deptLink = await prisma.adminDepartment.findFirst({
      where: {
        adminUserId: user.id,
        departmentId: dept.id,
      },
    });

    if (!deptLink) {
      await prisma.adminDepartment.create({
        data: {
          adminUserId: user.id,
          departmentId: dept.id,
        },
      });
    }

    // 8️⃣ Link admin to locality
    const localityLink = await prisma.adminLocality.findFirst({
      where: {
        adminUserId: user.id,
        localityId: locality.id,
      },
    });

    if (!localityLink) {
      await prisma.adminLocality.create({
        data: {
          adminUserId: user.id,
          localityId: locality.id,
        },
      });
    }

    console.log(`👮 Admin ready for ${dept.name}`);
  }

  console.log("🎉 Locality admin seeding completed");
}

main()
  .catch((e) => {
    console.error("❌ Admin seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });