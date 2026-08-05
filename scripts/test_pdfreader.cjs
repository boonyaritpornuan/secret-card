const { PdfReader } = require('pdfreader');
const fs = require('fs');

const pdfPath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ/พรบ ป้องกันและบรรเทาสาธารณภัย.pdf';
let output = '';

new PdfReader().parseFileItems(pdfPath, (err, item) => {
  if (err) console.error("error:", err);
  else if (!item) {
    fs.writeFileSync('C:/Users/boony/.gemini/antigravity-ide/brain/804e8a81-b0b4-4de2-8145-393aa163c023/scratch/test_pdf_output2.txt', output, 'utf8');
    console.log("Done reading PDF.");
    console.log("First 500 characters:");
    console.log(output.substring(0, 500));
  }
  else if (item.text) {
    output += item.text + '\n';
  }
});
