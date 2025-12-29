import prisma from "../../config/prisma";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";

type SignupInput = {
  name: string;
  email?: string;
  phone?: string;
  password: string;
};

/* =========================
   SIGNUP
========================= */
export const signup = async (data: SignupInput) => {
  if (!data.email && !data.phone) {
    throw new Error("Email or phone number is required");
  }

  const orConditions: any[] = [];
  if (data.email) orConditions.push({ email: data.email });
  if (data.phone) orConditions.push({ phone: data.phone });

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: orConditions,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const studentRole = await prisma.role.findUnique({
    where: { name: "STUDENT" },
  });

  if (!studentRole) {
    throw new Error("STUDENT role not found");
  }

  const userData: any = {
    name: data.name,
    ...(data.email && { email: data.email }),
    ...(data.phone && { phone: data.phone }),
    password: await hashPassword(data.password),
    roles: {
      create: {
        roleId: studentRole.id,
      },
    },
  };

  const user = await prisma.user.create({
    data: userData,
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  const roles = user.roles.map((ur) => ur.role.name);

  const permissions = [
    ...new Set(
      user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.key)
      )
    ),
  ];

  const token = signToken({
    userId: user.id,
    roles,
    permissions,
  });

  // ✅ Use type assertion on user object
  const userWithPhone = user as any;

  return {
    user: {
      id: userWithPhone.id,
      name: userWithPhone.name,
      email: userWithPhone.email,
      phone: userWithPhone.phone,
      roles,
    },
    token,
  };
};

/* =========================
   LOGIN (EMAIL OR PHONE)
========================= */
export const login = async (identifier: string, password: string) => {
  console.log("Login attempt with identifier:", identifier);

  // Use $queryRaw with parameterized query
  const users = await prisma.$queryRaw<any[]>`
    SELECT * FROM "User" 
    WHERE email = ${identifier} OR phone = ${identifier}
    LIMIT 1
  `;

  console.log("Query result:", users);

  if (!users || users.length === 0) {
    throw new Error("Invalid credentials");
  }

  const foundUser = users[0];
  console.log("User found with id:", foundUser.id);

  // Now get the full user with relations
  const user = await prisma.user.findUnique({
    where: { id: foundUser.id },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const roles = user.roles.map((ur) => ur.role.name);

  const permissions = [
    ...new Set(
      user.roles.flatMap((ur) =>
        ur.role.permissions.map((rp) => rp.permission.key)
      )
    ),
  ];

  const token = signToken({
    userId: user.id,
    roles,
    permissions,
  });

  const userWithPhone = user as any;

  return {
    user: {
      id: userWithPhone.id,
      name: userWithPhone.name,
      email: userWithPhone.email,
      phone: userWithPhone.phone,
      roles,
    },
    token,
  };
};
