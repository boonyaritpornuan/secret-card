<div align="center">

# 🃏 SECRET CARD — ติวสอบราชการ

**แอปท่องจำการ์ด + ทำข้อสอบแบบออฟไลน์ สำหรับเตรียมตัวสอบภาค ข. ข้าราชการไทย**

React 19 · Vite 6 · Tailwind CSS 4 · Motion · PWA · Capacitor (Android)

</div>

---

## 📖 เกี่ยวกับโปรเจกต์

SECRET CARD เป็นแอปติวสอบสำหรับผู้ที่เตรียมตัวสอบราชการ โดยรวมเครื่องมือสำคัญไว้ในที่เดียว:

- **โหมดทบทวนการ์ด (Flashcard)** — การ์ดคำถาม-คำตอบ พร้อมจับเวลาการจำ บันทึกว่า "จำได้ / ยังจำไม่ได้" และโหมดทบทวนเฉพาะข้อที่พลาด
- **โหมดทำข้อสอบ (Exam Mode)** — ทำข้อสอบจำลอง พร้อมตรวจคะแนนทันที และแสดงคำอธิบายเฉลย (explanation) หลังตอบ
- **ทำงานแบบออฟไลน์ 100%** — ข้อมูลข้อสอบทั้งหมดถูกเก็บอยู่ในเครื่อง เปิดใช้ได้แม้ไม่มีอินเทอร์เน็ต
- **ติดตั้งได้เป็นแอป (PWA / Android)** — เพิ่มไปหน้าจอโฮม หรือ build เป็น APK ด้วย Capacitor

## 🎯 ตำแหน่งที่รองรับ

| ตำแหน่ง | หน่วยงาน | เนื้อหา |
|---|---|---|
| นักวิเคราะห์นโยบายและแผน | ปภ. (กรมป้องกันและบรรเทาสาธารณภัย) ปี 2569 | 3 Part · 50 ชุดการ์ด · 36 ชุดข้อสอบ |
| นักวิชาการคอมพิวเตอร์ปฏิบัติการ | สพฐ. (สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน) | 7 ชุดการ์ด (700 ข้อ) · 7 ชุดข้อสอบ พร้อมเฉลยคำอธิบาย |

โครงสร้างออกแบบให้รองรับการเพิ่มตำแหน่ง/หัวข้อใหม่ได้ง่าย — เพิ่มรายการใน `POSITIONS` (หน้าเลือกหัวข้อ) + config ใน `App.tsx` เท่านั้น

## ✨ ฟีเจอร์หลัก

- 🏠 **หน้าเลือกหัวข้อ** — เลือกตำแหน่งสอบที่ต้องการติวได้ทันที ข้อมูลโหลดเฉพาะเมื่อเข้าใช้งาน (fast first paint)
- 🧠 **Flashcard 3 Part** — แบ่งเนื้อหาออกเป็น Part และชุดการ์ด 50 ใบต่อชุด
- 📊 **ติดตามความคืบหน้า** — สถิติชุดที่ทบทวนจบ จำนวนการ์ดที่จำได้ ความแม่นยำข้อสอบ แสดงบนหน้า Hub
- 🔁 **ทบทวนข้อที่พลาด** — เก็บประวัติข้อที่ตอบผิด แล้วกลับมาทบทวนเฉพาะข้อนั้นโดยเฉพาะ
- 📝 **โหมดข้อสอบ** — ทำข้อสอบจริงจับเวลา สรุปผลพร้อมสถิติ และเฉลยพร้อมคำอธิบาย
- 💾 **บันทึกความคืบหน้าอัตโนมัติ** — เก็บลง `localStorage` (แยกประวัติตามตำแหน่ง) โหลดต่อครั้งหน้าได้ทันที
- 🚀 **โหลดเร็ว** — ใช้ lazy-loading แยกคลังข้อสอบออกจาก bundle หลัก + หน้าโหลดเริ่มต้น (boot loader) แสดงความคืบหน้า
- 📱 **PWA + Capacitor** — เปิดจากหน้าจอโฮมได้ หรือ build เป็นแอป Android ได้

## 🚀 วิธีรันโปรเจกต์

**ข้อกำหนดเบื้องต้น:** Node.js (แนะนำ v20+)

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รันในโหมดพัฒนา (เปิดที่ http://localhost:3000)
npm run dev

# 3. สร้าง production build
npm run build

# 4. พรีวิว build
npm run preview
```

### ตรวจสอบคุณภาพโค้ด

```bash
npm run lint   # ตรวจ TypeScript types
```

## 📂 โครงสร้างโฟลเดอร์

```
secret-card/
├── src/                    # โค้ดแอปหลัก
│   ├── components/         # UI: PositionList, Hub, Home, Study, Finish, ExamList, ExamSession, ExamResult
│   ├── App.tsx             # ตัวกลางจัดการ view / ตำแหน่ง / การโหลดข้อมูล
│   ├── types.ts            # TypeScript types (Card, Part, Position, ExamProgress, ...)
│   ├── questions.json      # คลังการ์ด ปภ. (auto-generated, lazy-loaded)
│   ├── exams_index.ts      # ดัชนีข้อสอบ ปภ. (auto-generated)
│   └── exams_sphu_index.ts # ดัชนีข้อสอบ สพฐ. (auto-generated)
├── data/
│   ├── paph/               # ข้อมูลดิบ ปภ.: chapters (25 ไฟล์), exams (36 ไฟล์)
│   ├── sphu/               # ข้อมูลดิบ สพฐ.: exams (7 ไฟล์), cards.json (700 การ์ด)
│   └── COM/                # ต้นฉบับ PDF จากเว็บราชการ (ใช้แปลงเท่านั้น)
├── scripts/                # สคริปต์แปลง/สร้างข้อมูล (run ด้วย npx tsx / node)
│   ├── build_questions.cjs        # chapters → src/questions.json
│   ├── generate_exams_index.cjs   # สร้างดัชนีข้อสอบทั้งสองตำแหน่ง
│   ├── convert_com_to_sphu.cjs    # ข้อมูล COM → data/sphu
│   └── extract_exams*.cjs         # แยกข้อสอบจาก PDF → JSON
├── public/
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker (ทำงานเฉพาะ production)
└── index.html              # หน้าเริ่มต้น + boot loader
```

## 🔧 การอัปเดตข้อมูลข้อสอบ

ข้อมูลทั้งหมดมาจากไฟล์ต้นฉบับใน `data/` เมื่อมีข้อมูลชุดใหม่:

```bash
# 1. วางไฟล์ชุดข้อสอบใหม่ใน data/paph/exams/ หรือ data/sphu/exams/
# 2. สร้างดัชนีใหม่ (ชื่อไฟล์อัตโนมัติ)
node scripts/generate_exams_index.cjs
# 3. แก้คลังการ์ด (ถ้ามี) แล้ว rebuild
node scripts/build_questions.cjs
```

> ⚠️ ไฟล์ `src/questions.json`, `src/exams_index.ts`, `src/exams_sphu_index.ts` เป็นไฟล์ **auto-generated** — ควรแก้ผ่านสคริปต์/ข้อมูลดิบเท่านั้น ไม่ควรแก้โดยตรง

## 📱 ติดตั้งเป็นแอป Android (Capacitor)

```bash
npm run build
npx cap sync android
npx cap open android   # เปิด Android Studio เพื่อ build APK
```

## 🛠️ เทคโนโลยีที่ใช้

| เทคโนโลยี | ใช้ทำอะไร |
|---|---|
| React 19 + TypeScript | โครงสร้าง UI และตรรกะแอป |
| Vite 6 | Dev server + build ที่เร็ว |
| Tailwind CSS 4 | ระบบ styling |
| Motion (framer-motion) | แอนิเมชันการ์ดและหน้า |
| lucide-react | ไอคอน |
| Capacitor 8 | แปลงเป็นแอป Android |
| PWA (manifest + Service Worker) | ติดตั้งบนหน้าจอโฮม / ใช้งานออฟไลน์ |
| pdf2json / pdf-parse | สคริปต์แยกข้อสอบจาก PDF |

---

<div align="center">
<sub>SECRET CARD — PREVALENT OFFLINE STUDY ENGINE</sub>
</div>
