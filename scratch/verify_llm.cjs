const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

function safeDecode(str) {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return unescape(str);
    }
}

function parsePDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      let pages = [];
      for (const page of pdfData.Pages) {
        const texts = page.Texts.map(t => ({
          text: safeDecode(t.R[0].T),
          x: t.x,
          y: t.y
        }));
        
        texts.sort((a, b) => {
          if (Math.abs(a.y - b.y) < 0.5) return a.x - b.x;
          return a.y - b.y;
        });
        
        let lines = [];
        let currentLine = [];
        let lastY = -1;
        
        for (const t of texts) {
          if (lastY === -1 || Math.abs(t.y - lastY) > 0.5) {
            if (currentLine.length > 0) lines.push(currentLine.join(' '));
            currentLine = [t.text];
            lastY = t.y;
          } else {
            currentLine.push(t.text);
          }
        }
        if (currentLine.length > 0) lines.push(currentLine.join(' '));
        pages.push(lines.join('\n'));
      }
      resolve(pages);
    });
    pdfParser.loadPDF(filePath);
  });
}

async function verify() {
    const pdfDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ';
    const jsonDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/src/exams';
    
    // We will verify a few key files:
    const filesToVerify = [
        'การใช้เทคโนโลยีดิจิทัล คอมพิวเตอร์',
        'ระเบียบเตือนภัยพิบัติ',
        'วิชาภาษาอังกฤษ ',
        'กรม ปภ'
    ];
    
    for (const baseName of filesToVerify) {
        const pdfPath = path.join(pdfDir, baseName + '.pdf');
        const jsonPath = path.join(jsonDir, baseName + '.json');
        
        console.log(`========================================`);
        console.log(`VERIFYING FILE: ${baseName}`);
        console.log(`========================================`);
        
        const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const pdfPages = await parsePDF(pdfPath);
        
        // Print the last page of PDF which usually contains the answer key
        console.log('--- Original PDF Answer Key Page/Lines ---');
        const lastPage = pdfPages[pdfPages.length - 1];
        const lastPageLines = lastPage.split('\n');
        // print lines that look like answer keys
        lastPageLines.forEach(l => {
            const trimmed = l.trim();
            if (trimmed.match(/เฉลย/) || trimmed.match(/Answer/i) || trimmed.match(/^\d+(\s+\d+)+$/) || trimmed.match(/^[ก-งa-d](\s+[ก-งa-d])+$/) || trimmed.match(/(\d+)\s*[\.\s]\s*([ก-งA-D])/)) {
                console.log('  ' + trimmed);
            }
        });
        
        // Let's sample a few questions (e.g. Q1, Q11, Q21, Q31, Q41, Q50)
        const sampleIds = [1, 11, 21, 31, 41, 50].filter(id => id <= jsonContent.length);
        console.log('--- Sample Mapped Answers in JSON ---');
        for (const id of sampleIds) {
            const qObj = jsonContent.find(q => q.id === id);
            if (qObj) {
                console.log(`  Q${id}: ${qObj.q.substring(0, 60)}...`);
                console.log(`     Choices: ${JSON.stringify(qObj.choices)}`);
                console.log(`     Mapped Answer: ${qObj.answer}`);
            }
        }
        console.log('\n');
    }
}

verify().catch(console.error);
