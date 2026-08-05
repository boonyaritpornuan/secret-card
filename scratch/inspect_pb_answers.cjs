const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/scratch/all_pdf_answers.json', 'utf8'));
const fileData = data['ระเบียบเตือนภัยพิบัติ.pdf'];

console.log(`Total potential answers: ${fileData.potentialAnswers.length}`);
for (const p of fileData.potentialAnswers) {
    console.log(`\n--- Page ${p.pageNumber} ---`);
    console.log(p.text);
}
