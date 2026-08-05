const fs = require('fs');
const path = require('path');

const jsonPath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/src/exams/ระเบียบเตือนภัยพิบัติ.json';
const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`Total questions: ${questions.length}`);
const answered = questions.filter(q => q.answer);
const unanswered = questions.filter(q => !q.answer);

console.log(`Answered count: ${answered.length}`);
console.log(`Unanswered count: ${unanswered.length}`);

console.log("\nFirst 5 answered questions:");
answered.slice(0, 5).forEach(q => console.log(`  ID ${q.id}: Answer: ${q.answer} | Question: ${q.q.substring(0, 50)}...`));

console.log("\nFirst 5 unanswered questions:");
unanswered.slice(0, 5).forEach(q => console.log(`  ID ${q.id}: Question: ${q.q.substring(0, 50)}...`));
