const fs = require('fs');
const path = require('path');

const examsDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/src/exams';
const files = fs.readdirSync(examsDir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(examsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const totalQ = content.length;
    const unanswered = content.filter(q => !q.answer).length;
    console.log(`${file}: ${totalQ} questions, ${unanswered} unanswered.`);
}
