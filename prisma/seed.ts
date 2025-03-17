import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ✅ สร้าง Role ต่างๆ
  const roles = [
    { name: "admin" },
    { name: "user_a" },
    { name: "user_b" },
    { name: "user_c" },
    { name: "user_d" },
    { name: "form_reviewer_1" },
    { name: "form_reviewer_2" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // ✅ สร้าง Users ตัวอย่าง
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      role: { connect: { name: "admin" } },
    },
  });

  const userA = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      name: "testA",
      email: "test@test.com",
      password: await bcrypt.hash("testtest", 10),
      role: { connect: { name: "user_a" } },
    },
  });

  const userB = await prisma.user.upsert({
    where: { email: "userb@test.com" },
    update: {},
    create: {
      name: "testB",
      email: "userb@test.com",
      password: await bcrypt.hash("testtest", 10),
      role: { connect: { name: "user_b" } },
    },
  });

  const reviewer1 = await prisma.user.upsert({
    where: { email: "reviewer1@test.com" },
    update: {},
    create: {
      name: "Reviewer1",
      email: "reviewer1@test.com",
      password: await bcrypt.hash("reviewer123", 10),
      role: { connect: { name: "form_reviewer_1" } },
    },
  });

  // ✅ สร้างฟอร์มตัวอย่าง
  const forms = [
    {
      file: "KR1",
      status: "Enrolled",
      questions: JSON.stringify([
        { id: "q1", label: "What is your name?", type: "text" },
        { id: "q2", label: "How old are you?", type: "number" },
      ]),
    },
    {
      file: "KR2",
      status: "Pending",
      questions: JSON.stringify([
        { id: "q1", label: "What is your favorite color?", type: "text" },
        { id: "q2", label: "Do you like coding?", type: "radio", "options": ["Yes", "No"] },
      ]),
    },
  ];

  for (const form of forms) {
    await prisma.form.upsert({
      where: { file: form.file },
      update: {},
      create: form,
    });
  }

  // ✅ กำหนดให้ Users กรอกฟอร์มได้ (ใช้ userId แทน roleId)
  const formKR1 = await prisma.form.findUnique({ where: { file: "KR1" } });
  const formKR2 = await prisma.form.findUnique({ where: { file: "KR2" } });

  if (formKR1 && formKR2) {
    await prisma.formAccess.createMany({
      data: [
        { roleId: userA.id, formId: formKR1.id }, // user_a สามารถเข้าถึง KR1
        { roleId: userB.id, formId: formKR2.id }, // user_b สามารถเข้าถึง KR2
        { roleId: reviewer1.id, formId: formKR1.id }, // reviewer1 ตรวจสอบ KR1 ได้
      ],
    });
  }

  console.log("✅ Database Seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
