const fs = require('fs');
const content = fs.readFileSync('C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/scratch/alert_p12_lines.txt', 'utf16le');
fs.writeFileSync('C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/scratch/alert_p12_lines_utf8.txt', content, 'utf8');
console.log("Converted alert p12 lines");
