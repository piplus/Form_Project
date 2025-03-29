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
    // {
    //   file: "KR1",
    //   description: "แบบฟอร์มกรอกข้อมูลพื้นฐาน เช่น ชื่อ อายุ",
    //   questions: JSON.stringify([
    //     { id: "q1", label: "What is your name?", type: "text" },
    //     { id: "q2", label: "How old are you?", type: "number" },
    //   ]),
    // },
    // {
    //   file: "KR2",
    //   description: "แบบฟอร์มสำรวจความคิดเห็นเกี่ยวกับโปรแกรมมิ่ง",
    //   questions: JSON.stringify([
    //     { id: "q1", label: "What is your favorite color?", type: "text" },
    //     {
    //       id: "q2",
    //       label: "Do you like coding?",
    //       type: "radio",
    //       options: ["Yes", "No"],
    //     },
    //   ]),
    // },
    {
      file: "RT KR 2.1",
      description: "มูลค่าผลกระทบต่อเศรษฐกิจ สังคม และคุณภาพชีวิต ที่เกิดจากการนำผลงานวิจัยและพัฒนานวัตกรรมไปใช้ประโยชน์",
      questions: JSON.stringify([
        { id: "q1", label: "ชื่อผลงานวิจัย สิ่งประดิษฐ์ นวัตกรรมหรืองานสร้างสรรค์ถูกนำไปใช้ประโยชน์", type: "text" },
        { id: "q2", label: "ชื่ออาจารย์/นักวิจัย", type: "text" },
        { id: "q3", label: "ระบุการนำไปใช้ประโยชน์", type: "text" },
        { id: "q4", label: "วันที่ ที่นำไปใช้ประโยชน์", type: "date" },
        { id: "q5", label: "ระบุจำนวนเงินที่สร้างผลกระทบต่อเศรษฐกิจ สังคม และคุณภาพชีวิต", type: "text" },
      ]),
    },
    {
      file: "RT KR 2.2",
      description: "ผลงานวิจัย งานสร้างสรรค์ องค์ความรู้ ความเชี่ยวชาญและเทคโนโลยีพร้อมใช้ ถูกนำไปสร้างมูลค่าเชิงพาณิชย์",
      questions: JSON.stringify([
        { id: "q1", label: "ผลงานวิจัย งานสร้างสรรค์ องค์ความรู้  ความเชี่ยวชาญ และเทคโนโลยีพร้อมใช้", type: "text" },
        { id: "q2", label: "ชื่ออาจารย์/นักวิจัย", type: "text" },
        { id: "q3", label: "ระบุการนำไปสร้างมูลค่าเชิงพาณิชย์อย่างไร", type: "text" },
        { id: "q4", label: "ระบุ บริษัท/หน่วยงาน/องค์กร ที่นำไปสร้างมูลค่า", type: "text" },
        { id: "q5", label: "วันที่ ที่นำไปสร้างมูลค่าเชิงพาณิชย์", type: "date" },
      ]),
    },
    {
      "file": "RT KR 2.3",
      "description": "ผลงานวิจัยที่เผยแพร่ในระดับนานาชาติ พร้อมรายละเอียดการตีพิมพ์",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อผลงานวิจัยที่เผยแพร่", "type": "text" },
        { "id": "q2", "label": "ชื่อ-นามสกุล เจ้าของผลงาน", "type": "text" },
        { "id": "q3", "label": "ชื่อวารสารที่เผยแพร่", "type": "text" },
        {
          "id": "q4",
          "label": "(วัน/เดือน/ปีที่ตีพิมพ์, เล่มที่พิมพ์หรือฉบับที่พิมพ์, เลขหน้าที่พิมพ์หน้าแรกถึงหน้าสุดท้าย)",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "Volume", "type": "text" },
            { "id": "q4_2", "label": "Issue", "type": "text" },
            { "id": "q4_3", "label": "Art. No.", "type": "text" },
            { "id": "q4_4", "label": "Page Start", "type": "text" },
            { "id": "q4_5", "label": "Page End", "type": "text" }
          ]
        },
        { "id": "q5", "label": "ระดับคุณภาพของผลงานที่ตีพิมพ์ในวารสารวิชาการระดับนานาชาติ", "type": "text" }
      ]),
    },
    {
      "file": "RT KR 2.4",
      "description": "งบประมาณวิจัยจากหน่วยงานภายนอก (PPP, Industry, Government),",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อผลงานวิจัย หรือ งานสร้างสรรค์", "type": "text" },
        { "id": "q2", "label": "ชื่อ-นามสกุล เจ้าของผลงาน", "type": "text" },
        {
          "id": "q3",
          "label": "วงเงินที่ได้รับ (บาท)",
          "type": "group",
          "children": [
            { "id": "q3_1", "label": "แหล่งภายนอก", "type": "number" },
            { "id": "q3_2", "label": "Talent Mobility", "type": "number" },
            { "id": "q3_3", "label": "iTAP", "type": "number" }
          ]
        },
        { "id": "q4", "label": "ชื่อหน่วยงานภายนอกที่สนับสนุน", "type": "text" },
        { "id": "q5", "label": "ประเภททุน", "type": "text" },
        { "id": "q6", "label": "วัน/เดือน/ปีที่ได้รับงบประมาณ", "type": "date" },
        { "id": "q7", "label": "PMU/ภาครัฐ/ภาคเอกชน", "type": "text" },
        { "id": "q8", "label": "เลขหนังสือ/รหัสสัญญารับทุน", "type": "text" }
      ]),
    },
    {
      "file": "RT KR 3.1.1",
      "description": "ผลสัมฤทธิ์ที่สำคัญ KR 3.1 กำลังคนในภาคประกอบการ/ภาคอุตสาหกรรม/กำลังคนทุกช่วงวัย ที่ได้รับการพัฒนาตามหลักสูตร Re-skill, Up-skill, New-skill หรือมาใช้บริการ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อหลักสูตร/ชื่อห้อง Lab", "type": "text" },
        { "id": "q2", "label": "ผู้รับผิดชอบ", "type": "text" },
        { "id": "q3", "label": "รายได้ที่ได้รับจากการบริการวิชาการ", "type": "number" },
        { "id": "q4", "label": "ชื่อ-สกุล ผู้ที่ได้รับการพัฒนา", "type": "text" },
        { "id": "q5", "label": "ที่อยู่ที่ทำงานของผู้ที่ได้รับการพัฒนา", "type": "text" },
        { "id": "q6", "label": "วัน/เดือน/ปี (ประชุม, อบรม, ใช้ห้อง Lab, ให้คำปรึกษา)", "type": "date" },
        { "id": "q7", "label": "ผู้ที่ได้รับการพัฒนาได้รับประโยชน์จากหลักสูตรอบรมอย่างไร (โปรดอธิบาย)", "type": "text" },
        { "id": "q8", "label": "หมายเหตุ", "type": "text" }
      ]),
    },
    {
      "file": "RT KR 3.1.2",
      "description": "ผลสัมฤทธิ์ที่สำคัญ KR 3.1 กำลังคนในภาคประกอบการ/ภาคอุตสาหกรรม/กำลังคนทุกช่วงวัย ที่ได้รับการพัฒนาตามหลักสูตร Re-skill, Up-skill, New-skill หรือมาใช้บริการ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อหลักสูตร/ชื่อห้อง Lab", "type": "text" },
        { "id": "q2", "label": "ผู้รับผิดชอบ", "type": "text" },
        { "id": "q3", "label": "ชื่อ-สกุล ผู้ที่ได้รับการพัฒนา", "type": "text" },
        { "id": "q4", "label": "ที่อยู่ที่ทำงานของผู้ที่ได้รับการพัฒนา", "type": "text" },
        { "id": "q5", "label": "วัน/เดือน/ปี ที่ดำเนินการ (ประชุม, อบรม, ใช้ห้อง Lab, ให้คำปรึกษา)", "type": "date" },
        { "id": "q6", "label": "ผู้เข้าร่วมอบรมได้รับประโยชน์จากหลักสูตรอย่างไร (โปรดอธิบาย)", "type": "text" },
        { "id": "q7", "label": "หมายเหตุ", "type": "text" }
      ]),
    },{
      "file": "RT KR 3.2",
      "description": "ผลิตภัณฑ์ (สินค้าหรือบริการ) ในชุมชน/พื้นที่/หน่วยงานที่ได้รับการรับรองมาตรฐาน สร้างรายได้ หรือสร้างมูลค่าเพิ่ม จากงานบริการวิชาการ หรือ การขับเคลื่อนเศรษฐกิจสร้างสรรค์บนฐานศิลปวัฒนธรรมและภูมิปัญญาท้องถิ่น",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ผลิตภัณฑ์ (สินค้า/บริการ) ของชุมชนที่ได้รับรองมาตรฐาน สร้างรายได้ หรือสร้างมูลค่าเพิ่ม", "type": "text" },
        { "id": "q2", "label": "ระบุชื่อชุมชน/พื้นที่ที่เป็นเจ้าของผลิตภัณฑ์ (สินค้า/บริการ)", "type": "text" },
    
        {
          "id": "q3",
          "label": "ผลิตภัณฑ์ (สินค้าหรือบริการ) ในชุมชน/พื้นที่/หน่วยงานที่ได้รับการรับรองมาตรฐานสร้างรายได้",
          "type": "group",
          "children": [
            {
              "id": "q3_1",
              "label": "ระบุ มาตรฐานที่ได้รับการรับรอง และวัน/เดือน/ปี ที่ได้รับการจดขึ้นทะเบียน",
              "type": "date"
            },
            {
              "id": "q3_2",
              "label": "อธิบายผลลัพธ์/ผลกระทบ ที่สามารถวัดได้ในเชิงเศรษฐกิจ (สร้างรายได้ / มูลค่าเพิ่ม)",
              "type": "text"
            },
            {
              "id": "q3_3",
              "label": "ประเภทงาน",
              "type": "radio",
              "options": [
                "งานบริการวิชาการ",
                "ศิลปวัฒนธรรมและภูมิปัญญาท้องถิ่น"
              ]
            }
          ]
        },
        {
          "id": "q4",
          "label": "การดำเนินงานส่งเสริม พัฒนาของหน่วยงาน",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "ชื่อโครงการ/กิจกรรม", "type": "text" },
            { "id": "q4_2", "label": "วัน/เดือน/ปี ที่จัดโครงการ/กิจกรรม", "type": "date" },
            { "id": "q4_3", "label": "ผู้รับผิดชอบ", "type": "text" }
          ]
        }
      ]),
    },
    {
      "file": "RT KR 3.3",
      "description": "รายได้จากการบริการวิชาการ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อโครงการหรือกิจกรรมงานบริการวิชาการที่ให้แก่หน่วยงานภายนอก", "type": "text" },
        { "id": "q2", "label": "ศูนย์ COE / ชื่อ สกุล ผู้รับผิดชอบ", "type": "text" },
        { "id": "q3", "label": "ระบุชื่อหน่วยงานภายนอกที่รับการบริการวิชาการจาก มทร.ธัญบุรี", "type": "text" },
        { "id": "q4", "label": "ลักษณะและขอบเขตของการบริการวิชาการและวิชาชีพที่ก่อให้เกิดรายได้", "type": "text" },
        { "id": "q5", "label": "ระยะเวลาตามสัญญา", "type": "text" },
        { "id": "q6", "label": "งบประมาณตามสัญญา", "type": "text" },
        {
          "id": "q7",
          "label": "การใช้ระเบียบ มทร.ธัญบุรี ว่าด้วยการบริการวิชาการในการเบิกจ่าย",
          "type": "group",
          "children": [
            { "id": "q7_1", "label": "ใช้", "type": "checkbox" },
            { "id": "q7_2", "label": "ไม่ใช้", "type": "checkbox" }
          ]
        },
    
        {
          "id": "q8",
          "label": "รายรับจากบริการในปีที่ประเมิน",
          "type": "group",
          "children": [
            { "id": "q8_1", "label": "งบประมาณที่ได้รับ", "type": "number" },
            { "id": "q8_2", "label": "วัน/เดือน/ปี ที่ได้รับงบประมาณ", "type": "date" }
          ]
        },
    
        {
          "id": "q9",
          "label": "รายจ่าย",
          "type": "group",
          "children": [
            { "id": "q9_1", "label": "งบประมาณดำเนินงาน", "type": "number" }
          ]
        },
    
        {
          "id": "q10",
          "label": "รายได้สุทธิ - จำนวนเงินนำส่ง",
          "type": "group",
          "children": [
            { "id": "q10_1", "label": "หน่วยงาน", "type": "number" },
            { "id": "q10_2", "label": "มหาวิทยาลัย", "type": "number" },
            { "id": "q10_3", "label": "รวมเงินนำส่ง", "type": "number" },
            { "id": "q10_4", "label": "คงเหลือตามสัญญา", "type": "number" }
          ]
        }
      ]),
    },
    {
      "file": "RT KR 3.4",
      "description": "ข้อมูลธุรกิจ Startup ที่เข้ารับการบ่มเพาะและกิจกรรมที่เกี่ยวข้อง",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รายชื่อธุรกิจ Startup ที่เข้ารับการบ่มเพาะ", "type": "text" },
        { "id": "q2", "label": "สถานที่ประกอบธุรกิจ Startup", "type": "text" },
        { "id": "q3", "label": "ชื่อหลักสูตร/โครงการบ่มเพาะผู้ประกอบการ Startup", "type": "text" },
        { "id": "q4", "label": "ผู้รับผิดชอบ", "type": "text" },
        { "id": "q5", "label": "วัน/เดือน/ปี ที่จัดโครงการ/กิจกรรม", "type": "date" }
      ]),
    },
    {
      "file": "RT KR 3.4.1",
      "description": "ผลสัมฤทธิ์ที่สำคัญ KR 3.4 ธุรกิจ Startup ที่ได้รับการบ่มเพาะจากมหาวิทยาลัย",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รายชื่อธุรกิจ Startup ที่ได้รับการบ่มเพาะจากมหาวิทยาลัย", "type": "text" },
        { "id": "q2", "label": "วัน/เดือน/ปี ที่เข้ารับการบ่มเพาะ", "type": "date" },
        { "id": "q3", "label": "อธิบายการสร้างมูลค่าเพิ่ม หรือมูลค่าเพิ่มจากการลงทุน", "type": "text" }
      ]),
    },
    {
      "file": "RT KR 4.3",
      "description": "รายรับนอกเหนือจากการจัดการศึกษาเป็นไปตามแผน",
      "questions": JSON.stringify([
        {
          "id": "q1",
          "label": "ระบุชื่อรายรับนอกเหนือจากการจัดการศึกษา (รายได้จากงานวิจัย รายได้จากบริการทางวิชาการ และรายได้อื่นๆ)",
          "type": "text"
        },
        {
          "id": "q2",
          "label": "รายรับก่อนหักค่าใช้จ่าย",
          "type": "group",
          "children": [
            {
              "id": "q2_1",
              "label": "จำนวนเงิน (บาท)",
              "type": "number"
            },
            {
              "id": "q2_2",
              "label": "วัน/เดือน/ปี ที่ได้รับ",
              "type": "date"
            }
          ]
        }
      ])
    },
    {
      "file": "RT KPI 2.6",
      "description": "ความร่วมมือเพื่อพัฒนาผู้ประกอบการและส่งเสริมการสร้างนวัตกรรมกับภาคธุรกิจ/อุตสาหกรรม (University- Industry Linkage) ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "หน่วยงานที่มีความร่วมมือ", "type": "text" },
        { "id": "q2", "label": "วัน/เดือน/ปี ที่ลงนามความร่วมมือ", "type": "date" },
        { "id": "q3", "label": "รายละเอียดกิจกรรม/โครงการที่ดำเนินการเพื่อพัฒนาผู้ประกอบการและส่งเสริมการสร้างนวัตกรรม", "type": "text" },
        { "id": "q4", "label": "ผู้รับผิดชอบในการดำเนินกิจกรรม/โครงการ", "type": "text" },
        { "id": "q5", "label": "วัน/เดือน/ปี ที่จัดกิจกรรม/โครงการ", "type": "date" },
        { "id": "q6", "label": "สถานที่ดำเนินการ", "type": "text" },
        { "id": "q7", "label": "บริษัท/ภาคอุตสาหกรรม", "type": "text" }
      ]),
    },
    {
      "file": "RT KPI 2.5",
      "description": "จำนวนบทความวิจัยที่ได้รับการตีพิมพ์ โดยมีอาจารย์หรือนักวิจัยจากหน่วยงานหรือสถาบันการศึกษาจากต่างประเทศเป็นผู้ร่วมประพันธ์ ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อบทความวิจัย", "type": "text" },
        { "id": "q2", "label": "ชื่อ-นามสกุล เจ้าของผลงาน", "type": "text" },
    
        {
          "id": "q3",
          "label": "อาจารย์หรือนักวิจัยที่ร่วมประพันธ์",
          "type": "group",
          "children": [
            { "id": "q3_1", "label": "ชื่อ-นามสกุล", "type": "text" },
            { "id": "q3_2", "label": "หน่วยงาน / สถาบันการศึกษาจากต่างประเทศที่สังกัด", "type": "text" }
          ]
        },
    
        {
          "id": "q4",
          "label": "ระดับการเผยแพร่",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "ระดับชาติ", "type": "checkbox" },
            { "id": "q4_2", "label": "ระดับนานาชาติ", "type": "checkbox" }
          ]
        },
    
        {
          "id": "q5",
          "label": "รายละเอียดการตีพิมพ์เผยแพร่",
          "type": "group",
          "children": [
            { "id": "q5_1", "label": "ชื่อวารสารที่เผยแพร่", "type": "text" },
            { "id": "q5_2", "label": "วัน/เดือน/ปี ที่ตีพิมพ์", "type": "date" },
            { "id": "q5_3", "label": "เล่มที่พิมพ์ / ฉบับที่พิมพ์", "type": "text" },
            { "id": "q5_4", "label": "เลขหน้าแรกถึงหน้าสุดท้าย", "type": "text" },
            { "id": "q5_5", "label": "ระดับคุณภาพของวารสารที่ตีพิมพ์ตามฐานข้อมูล TCI", "type": "text" },
            { "id": "q5_6", "label": "ระดับคุณภาพของวารสารที่ตีพิมพ์ตาม Quartile", "type": "text" }
          ]
        }
      ]),
    },
    {
      "file": "RT KPI 2.4",
      "description": "นักศึกษาระดับบัณฑิตศึกษามีผลงานวิทยานิพนธ์ที่ตีพิมพ์ในฐานข้อมูลนานาชาติ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อ-นามสกุล", "type": "text" },
        { "id": "q2", "label": "ปีที่จบการศึกษา", "type": "text" },
        { "id": "q3", "label": "ชื่อวิทยานิพนธ์", "type": "text" },
        {
          "id": "q4",
          "label": "รายละเอียดการเผยแพร่ในระดับนานาชาติ",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "ชื่อวารสารที่เผยแพร่", "type": "text" },
            {
              "id": "q4_2",
              "label": "วัน/เดือน/ปี ที่ตีพิมพ์, เล่มที่พิมพ์หรือฉบับที่พิมพ์, เลขหน้าที่พิมพ์หน้าแรกถึงหน้าสุดท้าย",
              "type": "date"
            }
          ]
        }
      ])
    },
    {
      "file": "RT KR 2.3",
      "description": "ผลงานวิจัยที่ตีพิมพ์ในกลุ่มวารสารวิชาการระดับนานาชาติที่จัดกลุ่มเป็นวารสารที่มีผลกระทบสูง (Q1)",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อผลงานวิจัยที่เผยแพร่", "type": "text" },
        { "id": "q2", "label": "ชื่อ-นามสกุล เจ้าของผลงาน", "type": "text" },
        { "id": "q3", "label": "ชื่อวารสารที่เผยแพร่", "type": "text" },
        
        {
          "id": "q4",
          "label": "(วัน/เดือน/ปีที่ตีพิมพ์, เล่มที่พิมพ์หรือฉบับที่พิมพ์, เลขหน้าที่พิมพ์หน้าแรกถึงหน้าสุดท้าย)",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "Volume", "type": "text" },
            { "id": "q4_2", "label": "Issue", "type": "text" },
            { "id": "q4_3", "label": "Art. No.", "type": "text" },
            { "id": "q4_4", "label": "Page start", "type": "text" },
            { "id": "q4_5", "label": "Page end", "type": "text" },
            { "id": "q4_6", "label": "วัน/เดือน/ปี ที่ตีพิมพ์", "type": "date" }
          ]
        },
    
        { "id": "q5", "label": "ระดับคุณภาพของผลงานที่ตีพิมพ์ในวารสารวิชาการระดับนานาชาติ (Quartile)", "type": "text" }
      ])
    },
    {
      "file": "RT KPI 2.2",
      "description": "สถานประกอบการที่ได้รับการถ่ายโอนองค์ความรู้ เทคโนโลยีหรือนวัตกรรมแล้วก่อให้เกิดมูลค่าเพิ่มลดรายจ่าย เพิ่มรายได้หรือช่วยแก้ปัญหา",
      "questions": JSON.stringify([
        { "id": "q1", "label": "สถานประกอบการที่ได้รับการถ่ายทอดองค์ความรู้ เทคโนโลยี หรือ นวัตกรรม", "type": "text" },
        { "id": "q2", "label": "ชื่อผลงานวิจัย งานสร้างสรรค์ที่นำไปถ่ายทอดองค์ความรู้ เทคโนโลยีหรือ นวัตกรรมให้กับสถานประกอบการ", "type": "text" },
        { "id": "q3", "label": "ชื่อ-นามสกุล เจ้าของผลงาน", "type": "text" },
        { "id": "q4", "label": "วัน/เดือน/ปี ที่ถ่ายทอดองค์ความรู้ เทคโนโลยีหรือ นวัตกรรม", "type": "date" },
        { "id": "q5", "label": "ระบุว่าได้นำไปใช้ประโยชน์ด้านเทคโนโลยีหรือนวัตกรรม หรือลดรายจ่ายเพิ่มรายได้หรือช่วยแก้ปัญหาอย่างไร", "type": "text" }
      ]),
    },
    {
      "file": "RT KPI 2.1",
      "description": "ผลงานวิจัย สิ่งประดิษฐ์ นวัตกรรมหรืองานสร้างสรรค์ ถูกนำไปใช้ประโยชน์เพื่อเพิ่มขีดความสามารถในการแข่งขัน ตอบโจทย์ท้าทายของประเทศหรือพัฒนาชุมชนให้มีความเข้มแข็งและยั่งยืน ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อผลงานวิจัย สิ่งประดิษฐ์ นวัตกรรม หรือการสร้างสรรค์ที่ถูกนำไปใช้ประโยชน์", "type": "text" },
        { "id": "q2", "label": "ชื่ออาจารย์/นักวิจัย", "type": "text" },
        { "id": "q3", "label": "ประเภทงานวิจัยที่นำไปใช้ประโยชน์", "type": "text" },
        { "id": "q4", "label": "ระบุการนำไปใช้ประโยชน์", "type": "text" },
        { "id": "q5", "label": "วันที่ ที่นำไปใช้ประโยชน์", "type": "date" }
      ]),
    },
    {
      "file": "KPI 1.2 คณะ",
      "description": "บัณฑิตที่สอบผ่านมาตรฐานของสภาวิศวกร วิชาชีพผู้ประกอบวิชาชีพวิศวกรรมควบคุม",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รหัสนักศึกษา", "type": "text" },
        { "id": "q2", "label": "ชื่อ - สกุล", "type": "text" },
        { "id": "q3", "label": "ชั้นปี", "type": "text" },
        { "id": "q4", "label": "สาขาวิชา", "type": "text" },
    
        {
          "id": "q5",
          "label": "มาตรฐานสภาวิชาชีพ",
          "type": "group",
          "children": [
            { "id": "q5_1", "label": "มาตรฐาน (ระบุชื่อมาตรฐานที่ได้รับ)", "type": "text" },
            { "id": "q5_2", "label": "หน่วยงานที่ออกใบ Cert.", "type": "text" }
          ]
        },
    
        { "id": "q6", "label": "วัน/เดือน/ปี ที่ผ่านการประเมิน /Certificate", "type": "date" },
        { "id": "q7", "label": "ช่วงเวลารายงานผล (ไตรมาส 1,2,3,4)", "type": "text" }
      ]),
    },
    {
      "file": "KPI 1.1 คณะ",
      "description": "นักศึกษาสามารถสอบสมรรถนะวิชาชีพตามมาตรฐานระดับชาติหรือนานาชาติ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อ-นามสกุล", "type": "text" },
        { "id": "q2", "label": "ชั้นปี", "type": "text" },
        { "id": "q3", "label": "ภาควิชา/สาขาวิชา", "type": "text" },
    
        {
          "id": "q4",
          "label": "นักศึกษามีผลสอบสมรรถนะจากหน่วยงานภายนอก",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "ระบุ - มาตรฐานคุณวุฒิวิชาชีพ/สถาบันคุณวุฒิวิชาชีพ", "type": "text" },
            { "id": "q4_2", "label": "สถานที่/หน่วยงานที่จัด", "type": "text" },
            { "id": "q4_3", "label": "ผลการสอบ/คะแนน (คะแนนที่ได้หรือระดับคะแนนเต็ม)", "type": "text" },
            { "id": "q4_4", "label": "วัน/เดือน/ปี(พ.ศ.) ที่ผ่านการประเมิน /Certificate", "type": "date" },
            { "id": "q4_5", "label": "ระดับมาตรฐานหน่วยงานออกใบรับรอง (ชาติ/นานาชาติ)", "type": "text" }
          ]
        },
    
        { "id": "q5", "label": "ช่วงเวลารวบรวมข้อมูล (ไตรมาส 1,2,3,4)", "type": "text" }
      ]),
    },
    {
      "file": "KPI 1.3 คณะ",
      "description": "นักศึกษามีศักยภาพในการใช้เทคโนโลยีสารสนเทศ สอดคล้องกับมาตรฐานวิชาชีพ เช่น CAD/CAM, SOLIDWORKS, Autodesk Inventor, CST Microwave studio, Cisco Network Certified, AWS Cloud Certified,Fortinet Cyber Security Certified  เป็นต้น",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รหัสนักศึกษา", "type": "text" },
        { "id": "q2", "label": "ชื่อ - นามสกุล", "type": "text" },
        { "id": "q3", "label": "ชั้นปี", "type": "text" },
        { "id": "q4", "label": "ภาควิชา/สาขาวิชา", "type": "text" },
    
        {
          "id": "q5",
          "label": "นักศึกษามีผลสอบสมรรถนะในการใช้เทคโนโลยีสารสนเทศ",
          "type": "group",
          "children": [
            { "id": "q5_1", "label": "โปรแกรม/มาตรฐาน/หลักสูตร/รายวิชาที่เข้ารับการทดสอบ", "type": "text" },
            { "id": "q5_2", "label": "สถานที่/หน่วยงานที่จัด", "type": "text" },
            { "id": "q5_3", "label": "เกณฑ์การผ่าน", "type": "text" },
            { "id": "q5_4", "label": "ผลการสอบ", "type": "text" },
            { "id": "q5_5", "label": "ผลการประเมิน (ผ่าน/ไม่ผ่าน)", "type": "text" },
            { "id": "q5_6", "label": "วัน/เดือน/ปี ที่ผ่านการประเมิน / Certificate", "type": "date" }
          ]
        },
    
        { "id": "q6", "label": "ช่วงเวลาการจัดเก็บข้อมูล (ไตรมาส 1,2,3,4)", "type": "text" }
      ]),
    },
    {
      "file": "RT KPI 1.4 คณะ",
      "description": "นักศึกษามีผลการทดสอบภาษาอังกฤษตามมาตรฐานสากลหรือเทียบเท่า TOEIC 450 ขึ้นไป",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รหัสนักศึกษา", "type": "text" },
        { "id": "q2", "label": "คำนำหน้า", "type": "text" },
        { "id": "q3", "label": "ชื่อ - นามสกุล", "type": "text" },
        { "id": "q4", "label": "สาขาวิชา", "type": "text" },
        { "id": "q5", "label": "คณะ", "type": "text" },
    
        {
          "id": "q6",
          "label": "ประเภทการสอบตามมาตรฐานสากล",
          "type": "group",
          "children": [
            { "id": "q6_1", "label": "TOEIC", "type": "checkbox" },
            { "id": "q6_2", "label": "TOEFL", "type": "checkbox" },
            { "id": "q6_3", "label": "IELTS", "type": "checkbox" },
            { "id": "q6_4", "label": "RT-TEP", "type": "checkbox" },
            { "id": "q6_5", "label": "อื่น ๆ (Etc.)", "type": "checkbox" }
          ]
        },
    
        { "id": "q7", "label": "คะแนนที่ได้", "type": "text" },
        { "id": "q8", "label": "วัน/เดือน/ปี ที่ผ่านการประเมิน", "type": "date" },
        { "id": "q9", "label": "ช่วงเวลาการจัดเก็บข้อมูล (ไตรมาส 1,2,3,4)", "type": "text" }
      ]),
    },
    {
      "file": "RT KPI 1.5 คณะ",
      "description": "นักศึกษาที่มีผลการเรียนในวิชาภาษาอื่น ๆ  ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รหัสนักศึกษา", "type": "text" },
        { "id": "q2", "label": "คำนำหน้า", "type": "text" },
        { "id": "q3", "label": "ชื่อ - นามสกุล", "type": "text" },
        { "id": "q4", "label": "สาขาวิชา", "type": "text" },
        { "id": "q5", "label": "ภาษาที่เรียน / รายวิชาภาษาอื่น ๆ (นอกจากอังกฤษ)", "type": "text" },
    
        {
          "id": "q6",
          "label": "รูปแบบการเรียน",
          "type": "group",
          "children": [
            { "id": "q6_1", "label": "Online", "type": "checkbox" },
            { "id": "q6_2", "label": "Onsite", "type": "checkbox" }
          ]
        },
    
        { "id": "q7", "label": "ระยะเวลาในการเรียน ≥ 76 ชม. (ระบุจำนวนชั่วโมง)", "type": "text" },
        { "id": "q8", "label": "ระบุชื่อหน่วยงาน / Platform ที่จัดการเรียนสอน", "type": "text" },
        { "id": "q9", "label": "คะแนน (คะแนนที่ได้หรือระดับคะแนน เช่น A, B, C หรือไม่ผ่าน)", "type": "text" },
        { "id": "q10", "label": "วัน/เดือน/ปี ที่สำเร็จหลักสูตร (ถ้ามีจัดทำ Cert)", "type": "date" },
        { "id": "q11", "label": "ช่วงเวลาการจัดเก็บข้อมูล (ไตรมาส 1,2,3,4)", "type": "text" }
      ]),
    },
    {
      "file": "KPI 1.6 คณะ",
      "description": "หลักสูตรที่มีรายวิชา หรือโครงงาน หรือกิจกรรม ที่ทำให้ผู้เรียนมีความเข้าใจ มีทักษะ และสามารถนำ AI ไปใช้ประโยชน์ ",
      "questions": JSON.stringify([
        {
          "id": "q1",
          "label": "หลักสูตรที่มีรายวิชา หรือโครงงาน หรือกิจกรรม ที่ทำให้ผู้เรียนมีความเข้าใจ มีทักษะ และสามารถนำ AI ไปใช้ประโยชน์",
          "type": "group",
          "children": [
            { "id": "q1_1", "label": "รหัสหลักสูตร - รายวิชา", "type": "text" },
            { "id": "q1_2", "label": "รายละเอียดรายวิชา", "type": "text" },
            { "id": "q1_3", "label": "ชื่อโครงการ/กิจกรรม", "type": "text" }
          ]
        },
        {
          "id": "q2",
          "label": "ระบุบุคลากรที่จัดโครงการหรือเรียนการสอน",
          "type": "text"
        },
        {
          "id": "q3",
          "label": "ภาควิชา/สาขาวิชา ที่ดำเนินการ",
          "type": "text"
        },
        {
          "id": "q4",
          "label": "รายละเอียดการนำ AI ไปใช้ประโยชน์",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "ด้านสังคม/ด้านการศึกษา", "type": "text" },
            { "id": "q4_2", "label": "ด้านเศรษฐกิจ/ธุรกิจ", "type": "text" },
            { "id": "q4_3", "label": "ด้านสิ่งแวดล้อม", "type": "text" },
            { "id": "q4_4", "label": "ปัญหาที่ได้รับการแก้ไขโดย AI", "type": "text" }
          ]
        },
        {
          "id": "q5",
          "label": "ช่วงเวลาการจัดเก็บข้อมูล (ไตรมาส 1,2,3,4)",
          "type": "text"
        }
      ]),
    },
    {
      "file": "KPI 1.7 คณะ",
      "description": "หลักสูตรที่มีรายวิชา  หรือโครงงาน หรือกิจกรรม ที่ความสอดคล้องกับเป้าหมายการพัฒนาอย่างยั่งยืน (Sustainable Development Goals, SDGs)",
      "questions": JSON.stringify([
        {
          "id": "q1",
          "label": "หลักสูตรที่มีรายวิชา หรือโครงงาน หรือกิจกรรม ที่แสดงความเชื่อมโยงกับเป้าหมายการพัฒนาที่ยั่งยืน",
          "type": "group",
          "children": [
            { "id": "q1_1", "label": "รายชื่อหลักสูตร", "type": "text" },
            { "id": "q1_2", "label": "รายชื่อโครงการ", "type": "text" },
            { "id": "q1_3", "label": "รายชื่อกิจกรรม", "type": "text" },
            { "id": "q1_4", "label": "ระบุบุคลากร/นักศึกษา/ชั้นปี ที่จัดโครงการ", "type": "text" }
          ]
        },
        { "id": "q2", "label": "ภาควิชา/สาขาวิชา ที่ดำเนินการ", "type": "text" },
    
        {
          "id": "q3",
          "label": "SDGs ที่สอดคล้อง (1-17) (เลือกได้มากกว่า 1 ข้อ เช่น SDG 1 / SDG 3,5)", 
          "type": "text"
        },
    
        {
          "id": "q4",
          "label": "รายละเอียดความเชื่อมโยงกับเป้าหมายการพัฒนาที่ยั่งยืน",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "ด้านสังคม (บรรยายรายละเอียด/สอดคล้องกับตัวชี้วัด)", "type": "text" },
            { "id": "q4_2", "label": "ด้านเศรษฐกิจ (บรรยายรายละเอียด/สอดคล้องกับตัวชี้วัด)", "type": "text" },
            { "id": "q4_3", "label": "ด้านสิ่งแวดล้อม (บรรยายรายละเอียด/สอดคล้องกับตัวชี้วัด)", "type": "text" }
          ]
        },
    
        {
          "id": "q5",
          "label": "ช่วงเวลาจัดเก็บข้อมูล (ไตรมาส 1,2,3,4)",
          "type": "text"
        }
      ]),
    },
    {
      "file": "KPI 1.8 คณะ",
      "description": "หลักสูตรเรียนร่วมกับภาคประกอบการ (TM15, CWIE, Premium Course, etc.) ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "สาขาวิชา", "type": "text" },
        { "id": "q2", "label": "ชื่อหลักสูตร (ระบุ)", "type": "text" },
        { "id": "q3", "label": "ภาควิชา/สาขาวิชาที่ดำเนินการ", "type": "text" },
    
        {
          "id": "q4",
          "label": "ประเภทหลักสูตร",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "TM15", "type": "checkbox" },
            { "id": "q4_2", "label": "CWE", "type": "checkbox" },
            { "id": "q4_3", "label": "Premium course", "type": "checkbox" },
            { "id": "q4_4", "label": "อื่น ๆ (ระบุ)", "type": "text" }
          ]
        },
    
        {
          "id": "q5",
          "label": "ชื่อสถานประกอบการที่มีความร่วมมือ และร่วมกิจกรรมตามความต้องการ",
          "type": "text"
        },
    
        {
          "id": "q6",
          "label": "วัน/เดือน/ปี ที่ทำข้อตกลง มหาวิทยาลัย/สถาบัน/ภาคี",
          "type": "date"
        }
      ]),
    },
    {
      "file": "KPI 1.9 คณะ",
      "description": "หลักสูตร/โปรแกรมเฉพาะที่ใช้เทคโนโลยี/นวัตกรรมเพื่อพัฒนาความเป็นผู้ประกอบการ ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รายชื่อหลักสูตร", "type": "text" },
        { "id": "q2", "label": "ภาควิชา/สาขาวิชา", "type": "text" },
    
        {
          "id": "q3",
          "label": "กลุ่มเทคโนโลยี/นวัตกรรมที่ใช้เพื่อพัฒนาความเป็นผู้ประกอบการ",
          "type": "group",
          "children": [
            { "id": "q3_1", "label": "Agro-food", "type": "checkbox" },
            { "id": "q3_2", "label": "Logistic", "type": "checkbox" },
            { "id": "q3_3", "label": "Digital Technology & Economy", "type": "checkbox" },
            { "id": "q3_4", "label": "Tourism & Creative", "type": "checkbox" },
            { "id": "q3_5", "label": "Health and Wellness", "type": "checkbox" }
          ]
        },
    
        {
          "id": "q4",
          "label": "ประเภทหลักสูตร/โปรแกรม",
          "type": "group",
          "children": [
            { "id": "q4_1", "label": "Bachelor’s", "type": "checkbox" },
            { "id": "q4_2", "label": "Master", "type": "checkbox" },
            { "id": "q4_3", "label": "Ph.D", "type": "checkbox" },
            { "id": "q4_4", "label": "Non-Degree", "type": "checkbox" }
          ]
        },
    
        {
          "id": "q5",
          "label": "รายวิชา/เทคโนโลยี/นวัตกรรมที่เกี่ยวข้อง (เพื่อพัฒนาความเป็นผู้ประกอบการ)",
          "type": "text"
        }
      ]),
    },
    {
      "file": "KPI 1.10 คณะ",
      "description": "นักศึกษาเข้าสู่กระบวนการบ่มเพาะเตรียมความพร้อมเป็นผู้ประกอบการ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อ - สกุล นศ. ที่เข้าร่วมกิจกรรม/โครงการ", "type": "text" },
        { "id": "q2", "label": "ชั้นปี", "type": "text" },
        { "id": "q3", "label": "ภาควิชา/สาขาวิชา", "type": "text" },
        { "id": "q4", "label": "วัน/เดือน/ปี ที่จัดกิจกรรม/โครงการ", "type": "date" },
        {
          "id": "q5",
          "label": "กิจกรรม/โครงการด้านพาณิชย์/เตรียมความพร้อมเป็นผู้ประกอบการ",
          "type": "text"
        },
        {
          "id": "q6",
          "label": "สรุป/รายงานผลการจัดกิจกรรม/โครงการ",
          "type": "text"
        },
        { "id": "q7", "label": "หน่วยงาน/สถานที่ ที่จัด", "type": "text" },
        {
          "id": "q8",
          "label": "ช่วงเวลารายงานผล (ไตรมาส 1,2,3,4)",
          "type": "text"
        }
      ]),
    },
    {
      "file": "KPI 1.11 คณะ",
      "description": "นักศึกษาหรือบัณฑิตได้รับรางวัลด้านผู้ประกอบการ (Startup Awards)",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รหัสนักศึกษา", "type": "text" },
        { "id": "q2", "label": "ชื่อ-นามสกุล", "type": "text" },
        { "id": "q3", "label": "ชั้นปี", "type": "text" },
        { "id": "q4", "label": "ภาควิชา/สาขาวิชา", "type": "text" },
        { "id": "q5", "label": "ชื่อผลงานที่ได้รับรางวัล", "type": "text" },
        { "id": "q6", "label": "ชื่อรางวัลผู้ประกอบการ (Startup Awards) ที่ได้รับ", "type": "text" },
        { "id": "q7", "label": "วัน/เดือน/ปี ที่ได้รับรางวัล", "type": "date" },
    
        {
          "id": "q8",
          "label": "หน่วยงานที่มอบรางวัล",
          "type": "group",
          "children": [
            { "id": "q8_1", "label": "ภายใน มทรธ. / คณะ / กก.ผู้ทรงคุณวุฒิภายนอก (ระบุชื่อ)", "type": "text" },
            { "id": "q8_2", "label": "องค์กรภายนอก (ระบุชื่อ)", "type": "text" },
            { "id": "q8_3", "label": "เครือข่ายองค์กรในประเทศ (ระบุชื่อ)", "type": "text" },
            { "id": "q8_4", "label": "องค์กรระดับชาติ (ระบุชื่อ)", "type": "text" },
            { "id": "q8_5", "label": "องค์กรระดับนานาชาติ (ระบุชื่อ)", "type": "text" }
          ]
        },
    
        {
          "id": "q9",
          "label": "รูปแบบผลงาน",
          "type": "group",
          "children": [
            { "id": "q9_1", "label": "ผลงานทีม (ระบุชื่อทีม)", "type": "text" },
            { "id": "q9_2", "label": "ผลงานเดี่ยว (ระบุชื่อผลงาน)", "type": "text" }
          ]
        },
    
        { "id": "q10", "label": "ช่วงเวลาจัดเก็บข้อมูล (ไตรมาส 1,2,3,4)", "type": "text" }
      ]),
    },
    {
      "file": "KPI 1.12 คณะ",
      "description": "นวัตกรรมของผู้เรียน ที่ถูกนำไปใช้ประโยชน์ เกิดการสร้างคุณค่าหรือมูลค่าเชิงพาณิชย์หรือได้รับรางวัลในระดับชาติหรือนานาชาติ",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รหัสนักศึกษา", "type": "text" },
        { "id": "q2", "label": "คำนำหน้า", "type": "text" },
        { "id": "q3", "label": "ชื่อ - นามสกุล", "type": "text" },
        { "id": "q4", "label": "ภาควิชา/สาขาวิชา", "type": "text" },
        { "id": "q5", "label": "นวัตกรรม (ผลงานนักศึกษา)", "type": "text" },
    
        {
          "id": "q6",
          "label": "ระดับรางวัล",
          "type": "group",
          "children": [
            { "id": "q6_1", "label": "ระดับชาติ (ระบุรางวัล)", "type": "text" },
            { "id": "q6_2", "label": "ผลงานเดี่ยว (ระบุรางวัล)", "type": "text" }
          ]
        },
    
        {
          "id": "q7",
          "label": "ผลกระทบที่เกิดขึ้น สร้างคุณค่า (อธิบายถึงคุณค่าในทาง เศรษฐกิจ สังคม สิ่งแวดล้อม)",
          "type": "group",
          "children": [
            { "id": "q7_1", "label": "ด้านเศรษฐกิจ", "type": "text" },
            { "id": "q7_2", "label": "ด้านสังคม", "type": "text" },
            { "id": "q7_3", "label": "ด้านสิ่งแวดล้อม", "type": "text" },
            { "id": "q7_4", "label": "สร้างมูลค่า (ระบุมูลค่าเป็นบาท)", "type": "number" },
          ]
        },
    
        { "id": "q8", "label": "ช่วงเวลาการจัดเก็บข้อมูล (ไตรมาส 1,2,3,4)", "type": "text" }
      ]),
    },
    {
      "file": "RT KPI 2.7",
      "description": "จำนวนผลงานวิจัย สิ่งประดิษฐ์ นวัตกรรมหรืองานสร้างสรรค์ที่ได้รับเลขที่คำขอ/เลขที่สิทธิบัตร หรืออนุสิทธิบัตรหรือขึ้นบัญชีนวัตกรรม",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อผลงานที่ยื่นขอรับการคุ้มครองฯ", "type": "text" },
        { "id": "q2", "label": "ชื่อผู้ขอรับการคุ้มครองฯ", "type": "text" },
        { "id": "q3", "label": "ประเภทการคุ้มครอง", "type": "text" },
        { "id": "q4", "label": "คำขอเลขที่", "type": "text" },
        { "id": "q5", "label": "ยื่นคำขอวันที่", "type": "date" },
    
        {
          "id": "q6",
          "label": "ได้รับเลขที่สิทธิบัตร อนุสิทธิบัตร และบัญชีนวัตกรรม",
          "type": "group",
          "children": [
            { "id": "q6_1", "label": "เลขที่", "type": "text" },
            { "id": "q6_2", "label": "วันที่ได้รับเลขที่", "type": "date" }
          ]
        }
      ]),
    },
    {
      "file": "RT KPI 3.1_(งปม. 68)",
      "description": "หลักสูตร Re-skill, Up-skill, New-skill ที่พัฒนากำลังคนในอุตสาหกรรมเป้าหมาย และ EEC ที่มีผู้เรียนหรือมีผู้เข้าร่วมอบรม (หลักสูตรใหม่ ปีงบประมาณ 2568)",
      "questions": JSON.stringify([
          { "id": "q1", "label": "รายชื่อหลักสูตรอบรมระยะสั้น (Re-skill, Up-skill, New-skill) หรือหลักสูตร Non degreeที่ได้รับการอนุมัติหลักสูตรโดยสภาวิชาการ มทร.ธัญบุรี(ปีงบประมาณ 2568)", "type": "text" },
          { "id": "q2", "label": "วัน เดือน ปี ที่อนุมัติหลักสูตร", "type": "date" },
          { "id": "q3", "label": "จำนวนชั่วโมงตามหลักสูตรอบรม", "type": "text" },
          { "id": "q4", "label": "ผู้รับผิดชอบ", "type": "text" },
          { "id": "q5", "label": "ประเภททักษะ(โปรดระบุ Re-skill,Up-skill, New-skill)", "type": "text" },
          {
              "id": "q6",
              "label": "อุตสาหกรรมที่เกี่ยวข้อง(โปรดระบุประเภทอุตสาหกรรม)",
              "type": "group",
              "children": [
                  { "id": "qุ6_1", "label": "10 + 4 S-curve", "type": "text" },
                  { "id": "q6_2", "label": "EEC", "type": "text" },
              ]
          },
          { "id": "q7", "label": "ชื่อ - สกุล ผู้เข้ารับการอบรม", "type": "text" },
          { "id": "q8", "label": "วัน/เดือน/ปี ที่เข้ารับการอบรม", "type": "date" },
          { "id": "q9", "label": "หมายเหตุ", "type": "text" },
      ]),
  },
  {
      "file": "RT KPI 3.2",
      "description": "ผู้ที่ได้รับการถ่ายทอด องค์ความรู้ เทคโนโลยี นวัตกรรม ความคิดสร้างสรรค์แล้วนำไปใช้ประโยชน์ และเกิดผลกระทบในทางบวก",
      "questions": JSON.stringify([
          {
              "id": "q1",
              "label": "โครงการ/กิจกรรม ถ่ายทอดองค์ความรู้ เทคโนโลยี นวัตกรรม ความคิดสร้างสรรค์ ของหน่วยงาน",
              "type": "group",
              "children": [
                  { "id": "q1_1", "label": "โครงการ/กิจกรรม", "type": "text" },
                  { "id": "q1_2", "label": "วัน/เดือน/ปี ที่จัดโครงการ/กิจกรรม", "type": "date" },
                  { "id": "q1_3", "label": "ผู้รับผิดชอบ", "type": "text" },
                  { "id": "q1_4", "label": "จำนวนผู้เข้าร่วมโครงการทั้งหมด", "type": "text" },
              ],
          },
          { "id": "q2", "label": "ชื่อ - สกุล ผู้ที่ได้รับการถ่ายทอด แล้วนำไปใช้ประโยชน์", "type": "text" },
          { "id": "q3", "label": "ชื่อชุมชน/พื้นที่/หน่วยงาน (โปรดระบุชื่อ)", "type": "text" },
          { "id": "q4", "label": "อธิบายผลลัพธ์/ผลกระทบในทางบวก (i)", "type": "text" },
      ]),
  },
  {
      "file": "RT KPI 3.3",
      "description": "องค์ความรู้ เทคโนโลยี นวัตกรรม ด้านศิลปวัฒนธรรมหรือภูมิปัญญาท้องถิ่น ที่นำไปใช้ให้เกิดการอนุรักษ์ สืบสานหรือพัฒนาเศรษฐกิจสร้างสรรค์",
      "questions": JSON.stringify([
          {
              "id": "q1",
              "label": "องค์ความรู้ เทคโนโลยี นวัตกรรม ด้านศิลปวัฒนธรรมหรือภูมิปัญญาท้องถิ่น",
              "type": "group",
              "children": [
                  { "id": "q1_1", "label": "ชื่อองค์ความรู้ เทคโนโลยี นวัตกรรม", "type": "text" },
                  { "id": "q1_2", "label": "โครงการ/กิจกรรม", "type": "text" },
                  { "id": "q1_3", "label": "วัน/เดือน/ปี", "type": "date" },
                  { "id": "q1_4", "label": "สถานที่ดำเนินการชุมชน/สถานประกอบการ", "type": "text" },
              ],
          },
          { "id": "q2", "label": "อธิบายลักษณะการอนุรักษ์สืบสานหรือพัฒนาเศรษฐกิจสร้างสรรค์", "type": "text" },
      ]),
  },
  {
      "file": "RT KPI 3.4",
      "description": "หน่วยงานของรัฐ ท้องถิ่น เอกชน และระดับสากล ที่ร่วมดำเนินโครงการบริการวิชาการ หรือสนับสนุนงบประมาณในการจัดบริการวิชาการ",
      "questions": JSON.stringify([
          { "id": "q1", "label": "รายชื่อหน่วยงานของรัฐ  เอกชน ท้องถิ่น หรือระดับสากล ที่ร่วมดำเนินโครงการบริการวิชาการ หรือสนับสนุนงบประมาณในการจัดบริการวิชาการ", "type": "text" },
          {
              "id": "q2",
              "label": "รายละเอียดกิจกรรมที่ดำเนินโครงการบริการวิชาการหรือสนับสนุนงบประมาณในการจัดบริการวิชาการ",
              "type": "group",
              "children": [
                  { "id": "q2_1", "label": "*** โปรดระบุรายละเอียดความร่วมมือเพื่อการให้บริการวิชาการ และกิจกรรมที่จะเกิดขึ้น", "type": "text" },
                  { "id": "q2_2", "label": "ระบุงบประมาณที่ได้รับการสนับสนุน (ถ้ามี)", "type": "text" },
              ],
          },
          { "id": "q3", "label": "รายชื่อหน่วยงานที่ได้รับการพัฒนาหรือช่วยเหลือ", "type": "text" },
          { "id": "q4", "label": "วัน/เดือน/ปี ที่ทำกิจกรรม", "type": "date" },
      ]),
  },
  {
      "file": "RT KPI 3.5",
      "description": "งบประมาณจากแหล่งทุนภายนอกสนับสนุนการสร้างผู้ประกอบการ/ธุรกิจใหม่ (Startup Co-Investment Funding)",
      "questions": JSON.stringify([
          { "id": "q1", "label": "ระบุรายชื่อแหล่งทุนภายนอกที่สนับสนุนงบประมาณการสร้างผู้ประกอบการ/ธุรกิจใหม่ (Startup Co-Investment Funding)", "type": "text" },
          { "id": "q2", "label": "จำนวนเงินที่ได้รับการสนับสนุน", "type": "text" },
          { "id": "q3", "label": "วัน/เดือน/ปี ที่ได้รับการสนับสนุน", "type": "date" },
          { "id": "q4", "label": "อธิบาย การสนับสนุนการสร้างผู้ประกอบการ/ธุรกิจใหม่", "type": "text" },
      ]),
  },
  {
      "file": "RT KPI 4.1",
      "description": "ผู้บริหารระดับต้น ระดับกลาง ระดับสูง ได้รับการพัฒนาทักษะเชิงบริหารจัดการ และนำมาใช้ประโยชน์ในการทำงาน",
      "questions": JSON.stringify([
          { "id": "q1", "label": "ไตรมาสที่", "type": "text" },
          { "id": "q2", "label": "ชื่อ-นามสกุล", "type": "text" },
          { "id": "q3", "label": "ระบุตำแหน่งทางการบริหาร เช่น คณบดี ผู้อำนวยการ รองคณบดี รองผู้อำนวยการ หัวหน้างาน เป็นต้น", "type": "text" },
          {
              "id": "q4",
              "label": "การพัฒนาทักษะในหลักสูตรเชิงบริหารจัดการ",
              "type": "group",
              "children": [
                  { "id": "q4_1", "label": "หน่วยงานที่จัดอบรม", "type": "text" },
                  { "id": "q4_2", "label": "หลักสูตร/หัวข้อ ที่การพัฒนาทักษะในหลักสูตรเชิงบริหารจัดการ", "type": "text" },
                  { "id": "q4_3", "label": "ระยะเวลาที่ไป (ว/ด/ป)", "type": "date" },
                  { "id": "q4_4", "label": "สถานที่สัมมนา", "type": "text" },
              ],
          },
          { "id": "q5", "label": "อธิบายการนำความรู้ที่ได้จากการอบรม พัฒนาทักษะเชิงบริหารจัดการมาใช้ประโยชน์กับการทำงาน", "type": "text" },
      ]),
  },
  {
      "file": "RT KPI 4.2",
      "description": "บุคลากรที่ได้รับการพัฒนา สามารถผ่านมาตรฐาน Certified จากหน่วยงานภายนอก",
      "questions": JSON.stringify([
          { "id": "q1", "label": "ไตรมาสที่", "type": "text" },
          { "id": "q2", "label": "ชื่อ-นามสกุล", "type": "text" },
          { "id": "q3", "label": "ตำแหน่งทางวิชาการ/ตำแหน่งทางวิชาชีพ เช่น อาจารย์ภาควิชา ,เจ้าหน้าที่บริหารงานทั่วไป เป็นต้น", "type": "text" },
          { "id": "q4", "label": "สาขา/ฝ่ายงานอื่น ๆ ", "type": "text" },
          {
              "id": "q5",
              "label": "บุคลากรผ่านมาตรฐาน Certified จากหน่วยงานภายนอก",
              "type": "group",
              "children": [
                  { "id": "q5_1", "label": "ระบุชื่อ หลักสูตร/วิชา/เรื่อง ที่ได้รับการพัฒนาตามปรากฎใน Certified จากหน่วยงานภายนอก", "type": "text" },
                  { "id": "q5_2", "label": "หน่วยงานที่จัดฝึกอบรม", "type": "text" },
                  { "id": "q5_3", "label": "สถานที่จัดฝึกอบรม", "type": "text" },
                  { "id": "q5_4", "label": "วัน/เดือน/ปี ที่อบรม", "type": "date" },
                  { "id": "q5_5", "label": "วัน/เดือน/ปี ที่ได้รับ Certified", "type": "date" },
                  { "id": "q5_6", "label": "รูปภาพของใบ certificated", "type": "file" },
              ],
          },
          { "id": "q6", "label": "หมายเหตุ", "type": "text" },
      ]),
  },
  {
      "file": "RT KPI 4.3",
      "description": "อาจารย์ที่ไปฝึกประสบการณ์วิชาชีพในสถานประกอบการหรือแลกเปลี่ยนความรู้สู่ภาคธุรกิจ/อุตสาหกรรม/ชุมชน",
      "questions": JSON.stringify([
          { "id": "q1", "label": "ไตรมาสที่", "type": "text" },
          { "id": "q2", "label": "ชื่อ-นามสกุล", "type": "text" },
          { "id": "q3", "label": "สาขา", "type": "text" },
          {
              "id": "q4",
              "label": "ประเภทการฝึกประสบการณ์วิชาชีพ (ü)",
              "type": "radio",  // เปลี่ยนจาก "group" เป็น "radio"
              "options": ["ฝังตัว/ฝึกประสบการณ์","เป็นที่ปรึกษา","โครงการ Talent Mobility","โครงการ ITAP"],
          },
          {
              "id": "q5",
              "label": "การฝึกประสบการณ์วิชาชีพ",
              "type": "group",
              "children": [
                  { "id": "q5_1", "label": "ชื่อหน่วยงาน/สถานประกอบการอุตสาหกรรม/ชุมชน", "type": "text" },
                  { "id": "q5_2", "label": "หลักสูตร/หัวข้อ ที่ฝึกประสบการณ์", "type": "text" },
                  { "id": "q5_3", "label": "ระยะเวลาที่ไป (ว/ด/ป)", "type": "date" },
                  { "id": "q5_4", "label": "สถานที่", "type": "text" },
              ],
          },
      ]),
  },
  {
      "file": "RT KPI 4.4",
      "description": "อาจารย์ได้รับรางวัลระดับชาติและนานาชาติ ",
      "questions": JSON.stringify([
          { "id": "q1", "label": "ไตรมาสที่", "type": "text" },
          { "id": "q2", "label": "ชื่อ-นามสกุล", "type": "text" },
          { "id": "q3", "label": "สาขา", "type": "text" },
          { "id": "q4", "label": "ชื่อผลงาน/โครงการ", "type": "text" },
          { "id": "q5", "label": "ชื่อรางวัล", "type": "text" },
          {
              "id": "q6",
              "label": "ประเภทรางวัล (ü)",
              "type": "radio",  // เปลี่ยนจาก "group" เป็น "radio"
              "options": ["ชาติ","นานาชาติ"]
          },
          { "id": "q7", "label": "วัน/เดือน/ปี ที่ได้รับรางวัล", "type": "date" },
          { "id": "q8", "label": "ชื่องานที่เข้าร่วมประกวด", "type": "text" },
      ]),
  },
  {
      "file": "RT KPI 4.5",
      "description": "อาจารย์ได้รับรางวัลระดับชาติและนานาชาติ ",
      "questions": JSON.stringify([
          { "id": "q1", "label": "ชื่อ - สกุล", "type": "text" },
          { "id": "q2", "label": "หลักสูตรที่ได้รับการอบรมตามเกณฑ์มาตรฐานคุณภาพอาจารย์ (PSF - Professional Standard Framework)", "type": "text" },
          { "id": "q3", "label": "วัน/เดือน/ปี ที่เข้ารับการอบรม", "type": "date" },
          {
              "id": "q4",
              "label": "ผ่านเกณฑ์การประเมินตามมาตรฐาน PSF (ü)",
              "type": "radio",  // เปลี่ยนจาก "group" เป็น "radio"
              "options": ["ระดับ 1","ระดับ 2","ระดับ 3","ระดับ 4"]
          },
      ]),
  },
  {
      "file": "RT KPI 4.7",
      "description": "จำนวนนักศึกษาต่างชาติ ที่ลงทะเบียนเรียนในระบบ",
      "questions": JSON.stringify([
          { "id": "q1", "label": "ไตรมาสที่", "type": "text" },
          { "id": "q2", "label": "รหัสนักศึกษา", "type": "text" },
          { "id": "q3", "label": "ชื่อ -  สกุล นักศึกษาต่างชาติ", "type": "text" },
          { "id": "q4", "label": "สาขาวิชา/ภาควิชา", "type": "text" },
          { "id": "q5", "label": "ชั้นปี", "type": "text" },
          { "id": "q6", "label": "มาจากสถาบัน", "type": "text" },
          { "id": "q7", "label": "มาจากประเทศ", "type": "date" },
          {
              "id": "q8",
              "label": "ระยะเวลา",
              "type": "group",
              "children": [
                  { "id": "q8_1", "label": "ว/ด/ป ที่มา", "type": "date" },
                  { "id": "q8_2", "label": "ว/ด/ป ที่กลับ", "type": "date" },
              ],
          },
      ]),
  },
  {
      "file": "RT KPI 4.8",
      "description": "จำนวนบุคลากรต่างชาติ",
      "questions": JSON.stringify([
          { "id": "q1", "label": "ไตรมาสที่", "type": "text" },
          { "id": "q2", "label": "ชื่อ -  สกุล ", "type": "text" },
          { "id": "q3", "label": "ภาควิชา/สาขาวิชา", "type": "text" },
          { "id": "q4", "label": "สัญชาติ", "type": "text" },
          { "id": "q5", "label": "มาจากประเทศ", "type": "text" },
          {
              "id": "q6",
              "label": "ระยะเวลา",
              "type": "group",
              "children": [
                  { "id": "q6_1", "label": "ว/ด/ป ที่มา", "type": "date" },
                  { "id": "q6_2", "label": "ว/ด/ป ที่กลับ", "type": "date" },
              ],
          },
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
  // const formKR1 = await prisma.form.findUnique({ where: { file: "KR1" } });
  // const formKR2 = await prisma.form.findUnique({ where: { file: "KR2" } });

  // if (formKR1 && formKR2) {
  //   await prisma.formAccess.createMany({
  //     data: [
  //       { roleId: userA.id, formId: formKR1.id }, // user_a สามารถเข้าถึง KR1
  //       { roleId: userB.id, formId: formKR2.id }, // user_b สามารถเข้าถึง KR2
  //       { roleId: reviewer1.id, formId: formKR1.id }, // reviewer1 ตรวจสอบ KR1 ได้
  //     ],
  //   });
  // }

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
