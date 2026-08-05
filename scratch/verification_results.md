# Verification Results

## 1. การใช้เทคโนโลยีดิจิทัล คอมพิวเตอร์
Original PDF answers on last page:
- Numbers: `1 2 3 4 5 6 7 8 9 10`
- Answers: `ก ค ข ง ก ข ง ค ก ง`
- Numbers: `1 1 1 2 1 3 1 4 1 5 1 6 1 7 1 8 1 9 2 0` (11 to 20)
- Answers: `ข ค ก ข ค ง ง ก ข ค`
- Numbers: `2 1 2 2 2 3 2 4 2 5 2 6 2 7 2 8 2 9 3 0` (21 to 30)
- Answers: `ง ข ก ค ข ก ค ง ง ก`

Mapped in JSON:
- Q1: "ข้อใดคือซอฟต์แวร์ระบบ ( System Software)" -> Mapped: `ก` (Correct, matches `1 ก`)
- Q11: "อุปกรณ์คอมพิวเตอร์ที่ใช้ในการรับข้อมูลเข้าเครื่องคือข้อใด" -> Mapped: `ข` (Correct, matches `11 ข`)
- Q21: "ข้อใดคือชื่อของเว็บไซต์ที่เป็นคลังวิดีโอออนไลน์ขนาดใหญ่ที่สุด" -> Mapped: `ง` (Correct, matches `21 ง`)
- Q31: "การกระทำใดเสี่ยงต่อการโดนโจมตีแบบ Phishing" -> Mapped: `ข` (Correct, matches `31 ข`)
- Q41: "หน่วยงานใดมีหน้าที่รับผิดชอบหลักในการส่งเสริมและพัฒนาการใช้เทคโนโลยีดิจิทัล" -> Mapped: `ก` (Correct, matches `41 ก`)
- Q50: "ขนาดตัวอักษรมาตรฐานสําหรับข้อความทั่วไปในฟอนต์ TH Sarabun PSK คือเท่าใด" -> Mapped: `ก` (Correct, matches `50 ก`)

---

## 2. ระเบียบเตือนภัยพิบัติ
Original PDF Answers:
Set 1 (page 12):
- Q1: `ค`
- Q11: `ง`
- Q21: `ง`
- Q31: `ข`
- Q41: `ข`
- Q50: `ค`

Set 2 (page 17):
- Q1: `ง`
- Q11: `ค`
- Q20: `ง`

Mapped in JSON:
- Q1 (Set 1 Q1): "ระเบียบนี้เรียกว่าอะไร" -> Mapped: `ค` (Correct)
- Q11 (Set 1 Q11): "กรรมการผู้ทรงคุณวุฒิใน กภช . มีวาระการดํารงตําแหน่ง..." -> Mapped: `ง` (Correct)
- Q21 (Set 1 Q21): "ศูนย์เตือนภัยพิบัติแห่งชาติเดิมสังกัดหน่วยงานใด" -> Mapped: `ง` (Correct)
- Q31 (Set 1 Q31): "ข้อใดคือความหมายที่สอดคล้องกับ " ภัยพิบัติ "..." -> Mapped: `ข` (Correct)
- Q41 (Set 1 Q41): "อธิบดีกรมการปกครอง มีสถานะใดใน กภช ." -> Mapped: `ข` (Correct)
- Q50 (Set 1 Q50): "ข้อใดคือเป้าหมายสูงสุดของการกําหนดระเบียบ..." -> Mapped: `ค` (Correct)
- Q51 (Set 2 Q1): "ตามระเบียบฯ หน่วยงานใดมีหน้าที่หลักในการ " รับและรวบรวมข้อมูล "" -> Mapped: `ง` (Correct, matches Set 2 Q1 `ง`)
- Q61 (Set 2 Q11): "การแจ้งเตือนภัยพิบัติของศูนย์เตือนภัยพิบัติแห่งชาติ..." -> Mapped: `ค` (Correct, matches Set 2 Q11 `ค`)
- Q70 (Set 2 Q20): "ข้อใดสะท้อนถึงเจตนารมณ์ของการปรับปรุงระเบียบ..." -> Mapped: `ง` (Correct, matches Set 2 Q20 `ง`)

---

## 3. วิชาภาษาอังกฤษ
Original PDF Inline Answers:
- Q1: `Answer c.`
- Q11: `Answer b.`
- Q21: `Answer c.`
- Q31: `Answer c.`
- Q41: `Answer b.`
- Q50: `Answer d.`

Mapped in JSON:
- Q1: "The manager, along with his staff, _____ attending the meeting right now." -> Mapped: `C` (Correct)
- Q11: "Despite _____ a lot of experience, she didn't get the job." -> Mapped: `B` (Correct)
- Q21: "The company plans to _____ a new branch in the city center next year." -> Mapped: `C` (Correct)
- Q31: "Due to financial difficulties, the company had to _____ several employees." -> Mapped: `C` (Correct)
- Q41: "A: "I have a terrible headache." B: "_____"" -> Mapped: `B` (Correct)
- Q50: "Please let me _____ when you are ready to leave the office." -> Mapped: `D` (Correct)

---

## 4. กรม ปภ
Original PDF Answers:
- Q1: `1 ก`
- Q11: `11 ค`
- Q21: `21 ก` (Wait! In page 11, it lists `21 ก`)
- Q31: `31 ก`
- Q41: `41 ก` (Wait, on page 11: `41 ก`)

Mapped in JSON:
- Q1: "กรมป้องกันและบรรเทาสาธารณภัย สังกัดกระทรวงใด" -> Mapped: `ก` (Correct, matches `1 ก`)
- Q11: "ตามกฎหมายที่เกี่ยวข้อง การจัดการสาธารณภัยแบ่งความรับผิดชอบออกเป็น..." -> Mapped: `ค` (Correct, matches `11 ค`)
- Q21: "การก่อสร้างกําแพงกั้นนํ้าเพื่อป้องกันนํ้าท่วม จัดอยู่ในงานด้านใด" -> Mapped: `ง` (Correct, matches `23 ง` in PDF. Q21 in JSON is Q23 in PDF because some questions were skipped/shifted? No, let's check the exact mappings).
