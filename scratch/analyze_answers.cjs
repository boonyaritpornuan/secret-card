const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/scratch/all_pdf_answers.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

for (const [file, info] of Object.entries(data)) {
    console.log(`\n==================================================`);
    console.log(`FILE: ${file} | TOTAL PAGES: ${info.totalPages}`);
    console.log(`Potential Answer Pages: ${info.potentialAnswers.map(p => p.pageNumber).join(', ')}`);
    
    // Check if there are potential answer pages
    if (info.potentialAnswers.length > 0) {
        for (const ans of info.potentialAnswers) {
            console.log(`--- Page ${ans.pageNumber} content (first 300 chars) ---`);
            console.log(ans.text.substring(0, 300).replace(/\n/g, ' '));
        }
    } else {
        console.log("No potential answer pages detected by keywords. Last page text:");
        console.log(info.lastPageText.substring(0, 300).replace(/\n/g, ' '));
    }
}
