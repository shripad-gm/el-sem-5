import prisma from "../src/config/db.js";

async function main() {
  console.log("🌱 Starting master seed...");

  /* -------------------------------
     1. CITY
  --------------------------------*/
  let bangalore = await prisma.city.findFirst({
    where: { name: "Bangalore" },
  });

  if (!bangalore) {
    bangalore = await prisma.city.create({
      data: {
        name: "Bangalore",
        state: "Karnataka",
      },
    });
  }

  /* -------------------------------
     2. ZONES
  --------------------------------*/
  const zonesData = [
    "Mahadevapura",
    "Yelahanka",
    "Bommanahalli",
    "Dasarahalli",
    "West Bangalore",
  ];

  const zones = {};

  for (const zoneName of zonesData) {
    let zone = await prisma.zone.findFirst({
      where: {
        name: zoneName,
        cityId: bangalore.id,
      },
    });

    if (!zone) {
      zone = await prisma.zone.create({
        data: {
          name: zoneName,
          cityId: bangalore.id,
        },
      });
    }

    zones[zoneName] = zone;
  }

  /* -------------------------------
     3. LOCALITIES
  --------------------------------*/
  const localitiesData = {
    Mahadevapura: [
      ["Whitefield", 12.9698, 77.7499],
      ["Brookefield", 12.9842, 77.72],
      ["Marathahalli", 12.9592, 77.6974],
    ],
    Yelahanka: [
      ["Yelahanka New Town", 13.1007, 77.5963],
      ["Jakkur", 13.0761, 77.6193],
    ],
    Bommanahalli: [
      ["HSR Layout", 12.9116, 77.6473],
      ["BTM Layout", 12.9166, 77.6101],
    ],
    Dasarahalli: [
      ["Peenya", 13.0298, 77.5186],
      ["Nandini Layout", 13.0057, 77.548],
    ],
    "West Bangalore": [
      ["Vijayanagar", 12.9719, 77.5321],
      ["Rajajinagar", 12.9916, 77.5554],
    ],
  };

  for (const zoneName in localitiesData) {
    for (const [name, lat, lng] of localitiesData[zoneName]) {
      const existing = await prisma.locality.findFirst({
        where: {
          name,
          zoneId: zones[zoneName].id,
        },
      });

      if (!existing) {
        await prisma.locality.create({
          data: {
            name,
            latitude: lat,
            longitude: lng,
            zoneId: zones[zoneName].id,
          },
        });
      }
    }
  }

  /* -------------------------------
     4. ROLES
  --------------------------------*/
  await prisma.role.createMany({
    data: [
      { name: "citizen" },
      { name: "admin" },
      { name: "super_admin" },
    ],
    skipDuplicates: true,
  });

  /* -------------------------------
     5. ISSUE STATUSES
  --------------------------------*/
  await prisma.issueStatus.createMany({
    data: [
      { name: "OPEN" },
      { name: "IN_PROGRESS" },
      { name: "ESCALATED" },
      { name: "RESOLVED_PENDING_USER" },
      { name: "VERIFIED" },
      { name: "CLOSED" },
    ],
    skipDuplicates: true,
  });

  /* -------------------------------
     6. DEPARTMENTS
  --------------------------------*/
  await prisma.department.createMany({
    data: [
      { name: "BBMP" },
      { name: "BESCOM" },
      { name: "PWD" },
      { name: "BWSSB" },
    ],
    skipDuplicates: true,
  });

  const bbmp = await prisma.department.findFirst({ where: { name: "BBMP" } });
  const bescom = await prisma.department.findFirst({ where: { name: "BESCOM" } });
  const bwssb = await prisma.department.findFirst({ where: { name: "BWSSB" } });

  /* -------------------------------
     7. ISSUE CATEGORIES
  --------------------------------*/
  await prisma.issueCategory.createMany({
    data: [
      { name: "Pothole", departmentId: bbmp.id },
      { name: "Garbage", departmentId: bbmp.id },
      { name: "Streetlight", departmentId: bescom.id },
      { name: "Water Leakage", departmentId: bwssb.id },
    ],
    skipDuplicates: true,
  });

  const pothole = await prisma.issueCategory.findFirst({ where: { name: "Pothole" } });
  const streetlight = await prisma.issueCategory.findFirst({ where: { name: "Streetlight" } });

  /* -------------------------------
     8. SLA RULES
  --------------------------------*/
  await prisma.slaRule.createMany({
    data: [
      { categoryId: pothole.id, adminLevel: 1, timeLimitHours: 48 },
      { categoryId: pothole.id, adminLevel: 2, timeLimitHours: 72 },
      { categoryId: streetlight.id, adminLevel: 1, timeLimitHours: 24 },
      { categoryId: streetlight.id, adminLevel: 2, timeLimitHours: 48 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Master seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
