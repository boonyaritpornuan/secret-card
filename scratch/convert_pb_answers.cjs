const fs = require('fs');
const content = fs.readFileSync('C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/scratch/pb_answers_inspect.txt', 'utf16le');
fs.writeFileSync('C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/scratch/pb_answers_inspect_utf8.txt', content, 'utf8');
console.log("Converted pb answers inspect");
