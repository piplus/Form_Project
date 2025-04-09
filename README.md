This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

 1. เปิด MySQL ใน XAMPP
เปิด XAMPP Control Panel

✅ กด Start MySQL

เปิด phpMyAdmin ➜ สร้าง Database เช่น myappdb

🛠 2. ตั้ง .env ในโปรเจกต์ Next.js
env
Copy
Edit
DATABASE_URL="mysql://root:@localhost:3306/myappdb"
📝 หมายเหตุ:

root = user

ค่าว่าง (ไม่มีรหัสผ่าน)

localhost หรือ 127.0.0.1

3306 = default port

🔄 3. ตั้ง schema.prisma
prisma
Copy
Edit
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}
🧪 4. รัน Prisma
bash
Copy
Edit
npx prisma generate
npx prisma migrate dev --name init
⚡ 5. ลอง Query
ts
Copy
Edit
// example.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(users);
}

main();
🎯 Summary
ขั้นตอน	รายละเอียด
✅ เปิด XAMPP	Start MySQL + สร้าง DB
🛠 ตั้ง .env	DATABASE_URL=mysql://root:@localhost:3306/mydb
🔁 prisma generate	npx prisma generate
🧪 migrate	npx prisma migrate dev

