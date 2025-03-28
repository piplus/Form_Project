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
      description: "แบบฟอร์มกรอกข้อมูลพื้นฐาน เช่น ชื่อ อายุ",
      questions: JSON.stringify([
        { id: "q1", label: "What is your name?", type: "text" },
        { id: "q2", label: "How old are you?", type: "number" },
      ]),
    },
    {
      file: "KR2",
      description: "แบบฟอร์มสำรวจความคิดเห็นเกี่ยวกับโปรแกรมมิ่ง",
      questions: JSON.stringify([
        { id: "q1", label: "What is your favorite color?", type: "text" },
        {
          id: "q2",
          label: "Do you like coding?",
          type: "radio",
          options: ["Yes", "No"],
        },
      ]),
    },
    {
      file: "RT KR 2.1",
      description: "มูลค่าผลกระทบต่อเศรษฐกิจ สังคม และคุณภาพชีวิต ที่เกิดจากการนำผลงานวิจัยและพัฒนานวัตกรรมไปใช้ประโยชน์",
      questions: JSON.stringify([
        { id: "q1", label: "ชื่อผลงานวิจัย สิ่งประดิษฐ์ นวัตกรรมหรืองานสร้างสรรค์ถูกนำไปใช้ประโยชน์", type: "text" },
        { id: "q2", label: "ชื่ออาจารย์/นักวิจัย", type: "text" },
        { id: "q3", label: "ระบุการนำไปใช้ประโยชน์", type: "text" },
        { id: "q4", label: "วันที่ ที่นำไปใช้ประโยชน์", type: "text" },
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
        { id: "q5", label: "วันที่ ที่นำไปสร้างมูลค่าเชิงพาณิชย์", type: "text" },
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
        { "id": "q6", "label": "วัน/เดือน/ปีที่ได้รับงบประมาณ", "type": "text" },
        { "id": "q7", "label": "PMU/ภาครัฐ/ภาคเอกชน", "type": "text" },
        { "id": "q8", "label": "เลขหนังสือ/รหัสสัญญารับทุน", "type": "text" }
      ]),
    },
    {
      "file": "RT KR 3.1.1",
      "description": "กำลังคนในภาคประกอบการ/ภาคอุตสาหกรรม/กำลังคนทุกช่วงวัย ที่ได้รับการพัฒนาตามหลักสูตร Re-skill, Up-skill, New-skill หรือมาใช้บริการ (เรียน, อบรม, ใช้ห้อง LAB, ให้คำปรึกษา)",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อหลักสูตร/ชื่อห้อง Lab", "type": "text" },
        { "id": "q2", "label": "ผู้รับผิดชอบ", "type": "text" },
        { "id": "q3", "label": "รายได้ที่ได้รับจากการบริการวิชาการ", "type": "number" },
        { "id": "q4", "label": "ชื่อ-สกุล ผู้ที่ได้รับการพัฒนา", "type": "text" },
        { "id": "q5", "label": "ที่อยู่ที่ทำงานของผู้ที่ได้รับการพัฒนา", "type": "text" },
        { "id": "q6", "label": "วัน/เดือน/ปี (ประชุม, อบรม, ใช้ห้อง Lab, ให้คำปรึกษา)", "type": "text" },
        { "id": "q7", "label": "ผู้ที่ได้รับการพัฒนาได้รับประโยชน์จากหลักสูตรอบรมอย่างไร (โปรดอธิบาย)", "type": "text" },
        { "id": "q8", "label": "หมายเหตุ", "type": "text" }
      ]),
    },
    {
      "file": "RT KR 3.1.2",
      "description": "ผลิตภัณฑ์ (สินค้าหรือบริการ) ในชุมชน/พื้นที่/หน่วยงานที่ได้รับการรับรองมาตรฐาน สร้างรายได้ หรือสร้างมูลค่าเพิ่ม จากงานบริการวิชาการ หรือ การขับเคลื่อนเศรษฐกิจสร้างสรรค์บนฐานศิลปวัฒนธรรมและภูมิปัญญาท้องถิ่น",
      "questions": JSON.stringify([
        { "id": "q1", "label": "ชื่อหลักสูตร/ชื่อห้อง Lab", "type": "text" },
        { "id": "q2", "label": "ผู้รับผิดชอบ", "type": "text" },
        { "id": "q3", "label": "ชื่อ-สกุล ผู้ที่ได้รับการพัฒนา", "type": "text" },
        { "id": "q4", "label": "ที่อยู่ที่ทำงานของผู้ที่ได้รับการพัฒนา", "type": "text" },
        { "id": "q5", "label": "วัน/เดือน/ปี ที่ดำเนินการ (ประชุม, อบรม, ใช้ห้อง Lab, ให้คำปรึกษา)", "type": "text" },
        { "id": "q6", "label": "ผู้เข้าร่วมอบรมได้รับประโยชน์จากหลักสูตรอย่างไร (โปรดอธิบาย)", "type": "text" },
        { "id": "q7", "label": "หมายเหตุ", "type": "text" }
      ]),
    },{
      "file": "RT KR 3.2",
      "description": "การดำเนินงานส่งเสริม พัฒนาของหน่วยงานผ่านผลิตภัณฑ์/บริการในชุมชน และโครงการบริการวิชาการหรือศิลปวัฒนธรรม",
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
              "type": "text"
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
            { "id": "q4_2", "label": "วัน/เดือน/ปี ที่จัดโครงการ/กิจกรรม", "type": "text" },
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
            { "id": "q8_2", "label": "วัน/เดือน/ปี ที่ได้รับงบประมาณ", "type": "text" }
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
        { "id": "q5", "label": "วัน/เดือน/ปี ที่จัดโครงการ/กิจกรรม", "type": "text" }
      ]),
    },
    {
      "file": "RT KR 3.4.1",
      "description": "ติดตามผลการบ่มเพาะธุรกิจ Startup จากมหาวิทยาลัย และมูลค่าเพิ่มที่เกิดขึ้น",
      "questions": JSON.stringify([
        { "id": "q1", "label": "รายชื่อธุรกิจ Startup ที่ได้รับการบ่มเพาะจากมหาวิทยาลัย", "type": "text" },
        { "id": "q2", "label": "วัน/เดือน/ปี ที่เข้ารับการบ่มเพาะ", "type": "text" },
        { "id": "q3", "label": "อธิบายการสร้างมูลค่าเพิ่ม หรือมูลค่าเพิ่มจากการลงทุน", "type": "text" }
      ]),
    },
    {
      "file": "RT KR 4.3",
      "description": "ข้อมูลรายรับนอกเหนือจากการจัดการศึกษา (งานวิจัย บริการวิชาการ ฯลฯ) ก่อนหักค่าใช้จ่าย",
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
              "type": "text"
            }
          ]
        }
      ])
    },
    {
      "file": "RT KPI 2.6",
      "description": "ข้อมูลความร่วมมือกับหน่วยงานเพื่อส่งเสริมการพัฒนาผู้ประกอบการและสร้างนวัตกรรมร่วมกับภาคอุตสาหกรรม",
      "questions": JSON.stringify([
        { "id": "q1", "label": "หน่วยงานที่มีความร่วมมือ", "type": "text" },
        { "id": "q2", "label": "วัน/เดือน/ปี ที่ลงนามความร่วมมือ", "type": "text" },
        { "id": "q3", "label": "รายละเอียดกิจกรรม/โครงการที่ดำเนินการเพื่อพัฒนาผู้ประกอบการและส่งเสริมการสร้างนวัตกรรม", "type": "text" },
        { "id": "q4", "label": "ผู้รับผิดชอบในการดำเนินกิจกรรม/โครงการ", "type": "text" },
        { "id": "q5", "label": "วัน/เดือน/ปี ที่จัดกิจกรรม/โครงการ", "type": "text" },
        { "id": "q6", "label": "สถานที่ดำเนินการ", "type": "text" },
        { "id": "q7", "label": "บริษัท/ภาคอุตสาหกรรม", "type": "text" }
      ]),
    },
    {
      "file": "RT KPI 2.5",
      "description": "ข้อมูลการตีพิมพ์ผลงานวิจัยร่วมกับอาจารย์หรือนักวิจัยจากต่างประเทศ",
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
            { "id": "q5_2", "label": "วัน/เดือน/ปี ที่ตีพิมพ์", "type": "text" },
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
      "description": "ข้อมูลการเผยแพร่ผลงานวิจัยของนักศึกษาในระดับนานาชาติ",
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
              "type": "text"
            }
          ]
        }
      ])
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
