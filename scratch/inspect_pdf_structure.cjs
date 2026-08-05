const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const inputDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ';
const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.pdf'));

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

async function run() {
    for (const file of files) {
        const filePath = path.join(inputDir, file);
        try {
            const pages = await parsePDF(filePath);
            console.log(`=========================================`);
            console.log(`File: ${file} | Pages: ${pages.length}`);
            
            // Find pages that look like answer keys
            // Usually contains lines with patterns like: "1. ก" or "1 ก" or "เฉลย"
            let answerPages = [];
            for (let i = 0; i < pages.length; i++) {
                const text = pages[i];
                if (text.includes('เฉลย') || text.match(/\d+\s+[ก-งA-D]\s+\d+\s+[ก-งA-D]/)) {
                    answerPages.push(i + 1);
                }
            }
            console.log(`Potential Answer Pages: ${answerPages.join(', ')}`);
            
            // Print last page preview
            const lastPage = pages[pages.length - 1];
            console.log(`--- LAST PAGE PREVIEW ---`);
            console.log(lastPage.substring(Math.max(0, lastPage.length - 600)));
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }
}

run();
