const fs = require('fs');
const path = require('path');

const examsDir = path.join(__dirname, '../data/sphu/exams');
const metaFile = path.join(__dirname, '../data/sphu/new_parts_meta.json');

const origFiles = [
  { oldName: 'การติดตั้งและบำรุงรักษาคอมพิวเตอร์ส่วนบุคคล.json', label: 'การติดตั้งและบำรุงรักษาคอมพิวเตอร์ส่วนบุคคล', cardKey: 'rawCards_s1', count: 100 },
  { oldName: 'ความมั่นคงปลอดภัยสารสนเทศ และการบริหารความเสี่ยง.json', label: 'ความมั่นคงปลอดภัยสารสนเทศ และการบริหารความเสี่ยง', cardKey: 'rawCards_s2', count: 100 },
  { oldName: 'พ.ร.บ. คอมพิวเตอร์ และกฎหมายที่เกี่ยวข้อง.json', label: 'พ.ร.บ. คอมพิวเตอร์ และกฎหมายที่เกี่ยวข้อง', cardKey: 'rawCards_s3', count: 100 },
  { oldName: 'ภาษาคอมพิวเตอร์ และการเขียนโปรแกรม.json', label: 'ภาษาคอมพิวเตอร์ และการเขียนโปรแกรม', cardKey: 'rawCards_s4', count: 100 },
  { oldName: 'ระบบปฏิบัติการและซอฟต์แวร์สำเร็จรูป.json', label: 'ระบบปฏิบัติการและซอฟต์แวร์สำเร็จรูป', cardKey: 'rawCards_s5', count: 100 },
  { oldName: 'ระบบสารสนเทศ การวิเคราะห์ระบบ และฐานข้อมูล.json', label: 'ระบบสารสนเทศ การวิเคราะห์ระบบ และฐานข้อมูล', cardKey: 'rawCards_s6', count: 100 },
  { oldName: 'ระบบเครือข่ายคอมพิวเตอร์ และอุปกรณ์ที่เกี่ยวข้อง.json', label: 'ระบบเครือข่ายคอมพิวเตอร์ และอุปกรณ์ที่เกี่ยวข้อง', cardKey: 'rawCards_s7', count: 100 },
];

// 1. Rename files in examsDir
for (const item of origFiles) {
  const oldPath = path.join(examsDir, item.oldName);
  const newName = `[ภาค ข 2] ${item.oldName}`;
  const newPath = path.join(examsDir, newName);

  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${item.oldName} -> ${newName}`);
  } else {
    console.log(`Already renamed or missing: ${item.oldName}`);
  }
}

// 2. Update new_parts_meta.json
const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));

// Format meta into 3 parts: ภาค ก (part 1), ภาค ข 1 (part 2), ภาค ข 2 (part 3)
const partK = meta.find(p => p.catName === 'ภาค ก');
const partKb1 = meta.find(p => p.catName === 'ภาค ข 1');
const partKb2 = meta.find(p => p.catName === 'ภาค ข 2');

partK.partNum = 1;
partKb1.partNum = 2;
partKb2.partNum = 3;

// Add original 7 sets to partKb2
const origSets = origFiles.map((item, idx) => ({
  id: `sp-orig-${idx + 1}`,
  label: `${item.label} (ชุด 100 ข้อ)`,
  cardKey: item.cardKey,
  count: item.count
}));

// Combine: original sets first or after? Let's put original sets first (ชุด 1-7) then new 10 sets (ชุด 8-17)
partKb2.sets = [...origSets, ...partKb2.sets];

const updatedMeta = [partK, partKb1, partKb2];
fs.writeFileSync(metaFile, JSON.stringify(updatedMeta, null, 2), 'utf8');
console.log('Updated new_parts_meta.json with 3 parts!');
console.log(`- ภาค ก: ${partK.sets.length} ชุด`);
console.log(`- ภาค ข 1: ${partKb1.sets.length} ชุด`);
console.log(`- ภาค ข 2: ${partKb2.sets.length} ชุด (7 เดิม + 10 ใหม่ = 17 ชุด)`);
