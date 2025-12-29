import { PrismaClient } from "@prisma/client";
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
       USERS
    ===================== */

    const passwordHash = await bcrypt.hash("Password@123", 10);

    // ADMIN USER
    const adminUser = await tx.user.upsert({
      where: { email: "admin@assessment.com" },
      update: {},
      create: {
        name: "System Admin",
        email: "admin@assessment.com",
        password: passwordHash,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });

    // STUDENT USER 1
    const studentUser1 = await tx.user.upsert({
      where: { email: "student1@assessment.com" },
      update: {},
      create: {
        name: "Student One",
        email: "student1@assessment.com",
        password: passwordHash,
        roles: {
          create: {
            roleId: studentRole.id,
          },
        },
      },
    });

    // STUDENT USER 2
    const studentUser2 = await tx.user.upsert({
      where: { email: "student2@assessment.com" },
      update: {},
      create: {
        name: "Student Two",
        email: "student2@assessment.com",
        password: passwordHash,
        roles: {
          create: {
            roleId: studentRole.id,
          },
        },
      },
    });

    console.log("Seeded Users:");
    console.log({
      adminUser: adminUser.email,
      studentUser1: studentUser1.email,
      studentUser2: studentUser2.email,
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
