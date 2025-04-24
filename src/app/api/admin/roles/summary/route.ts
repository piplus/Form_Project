// /api/admin/roles/summary/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const roles = await prisma.role.findMany({
    include: {
      users: {
        include: { submissions: true },
      },
    },
  });

  const summary = roles.map((role) => {
    const totalUsers = role.users.length;
    const submittedUsers = role.users.filter(u => u.submissions.length > 0).length;
    const notSubmitted = totalUsers - submittedUsers;
    const totalSubmissions = role.users.reduce((sum, u) => sum + u.submissions.length, 0);

    return {
      id: role.id,
      name: role.name,
      totalUsers,
      submitted: submittedUsers,
      notSubmitted,
      totalSubmissions,
    };
  });

  return NextResponse.json(summary);
}