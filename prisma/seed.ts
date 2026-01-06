import { PrismaClient, AchievementName } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

console.log("DB SEED");

async function main() {
  console.log("==== STARTING DB SEED");

  await prisma.$transaction(async (tx) => {
    /* =====================
       PERMISSIONS
    ===================== */
    const permissions = [
      "CREATE_ASSESSMENT",
      "UPDATE_ASSESSMENT",
      "DELETE_ASSESSMENT",
      "PUBLISH_ASSESSMENT",
      "CREATE_QUESTION",
      "UPDATE_QUESTION",
      "DELETE_QUESTION",
      "START_EXAM",
      "SUBMIT_ANSWER",
      "VIEW_RESULT",
      "MANAGE_USERS",
    ];

    await tx.permission.createMany({
      data: permissions.map((p) => ({ key: p })),
      skipDuplicates: true,
    });

    /* =====================
       ROLES
    ===================== */
    const adminRole = await tx.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", description: "System Administrator" },
    });

    const studentRole = await tx.role.upsert({
      where: { name: "STUDENT" },
      update: {},
      create: { name: "STUDENT", description: "Assessment Participant" },
    });

    const allPermissions = await tx.permission.findMany();

    await tx.rolePermission.createMany({
      data: allPermissions.map((p) => ({
        roleId: adminRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    const studentPermissions = allPermissions.filter((p) =>
      ["START_EXAM", "SUBMIT_ANSWER", "VIEW_RESULT"].includes(p.key)
    );

    await tx.rolePermission.createMany({
      data: studentPermissions.map((p) => ({
        roleId: studentRole.id,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    /* =====================
       ACHIEVEMENTS (NEW)
    ===================== */
    const achievementsData = [
      {
        name: AchievementName.NOVICE_SCHOLAR,
        title: "Novice Scholar",
        description: "Your first steps into a larger world.",
        icon: "🌱",
      },
      {
        name: AchievementName.RISING_STAR,
        title: "Rising Star",
        description: "Consistency is key, and you're proving it.",
        icon: "⭐",
      },
      {
        name: AchievementName.SKILL_SEEKER,
        title: "Skill Seeker",
        description: "Actively expanding your horizons.",
        icon: "🔍",
      },
      {
        name: AchievementName.KNOWLEDGE_MASTER,
        title: "Knowledge Master",
        description: "You have shown deep understanding.",
        icon: "🧠",
      },
      {
        name: AchievementName.PRO_EXPLORER,
        title: "Pro Explorer",
        description: "Venturing into advanced territories.",
        icon: "🚀",
      },
      {
        name: AchievementName.ELITE_ADVENTURER,
        title: "Elite Adventurer",
        description: "Battle-hardened and ready for anything.",
        icon: "⚔️",
      },
      {
        name: AchievementName.GRAND_WIZARD,
        title: "Grand Wizard",
        description: "A true master of the arts and sciences.",
        icon: "🧙‍♂️",
      },
      {
        name: AchievementName.UNIVERSAL_LEGEND,
        title: "Universal Legend",
        description: "The pinnacle of achievement. You are legendary.",
        icon: "👑",
      },
    ];

    for (const achievement of achievementsData) {
      await tx.achievement.upsert({
        where: { name: achievement.name },
        update: {
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
        },
        create: achievement,
      });
    }

    /* =====================
       USERS
    ===================== */
    const passwordHash = await bcrypt.hash("Password@123", 10);

    const adminUser = await tx.user.upsert({
      where: { email: "admin@assessment.com" },
      update: {},
      create: {
        name: "System Admin",
        email: "admin@assessment.com",
        password: passwordHash,
        roles: { create: { roleId: adminRole.id } },
      },
    });

    const studentUser1 = await tx.user.upsert({
      where: { email: "student1@assessment.com" },
      update: {},
      create: {
        name: "Student One",
        email: "student1@assessment.com",
        password: passwordHash,
        roles: { create: { roleId: studentRole.id } },
      },
    });

    const studentUser2 = await tx.user.upsert({
      where: { email: "student2@assessment.com" },
      update: {},
      create: {
        name: "Student Two",
        email: "student2@assessment.com",
        password: passwordHash,
        roles: { create: { roleId: studentRole.id } },
      },
    });

    console.log("Seeding Completed Successfully:");
    console.log({
      achievements: achievementsData.length,
      users: 3,
    });
  });
}

main()
  .catch((e) => {
    console.error("SEED FAILED ❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
