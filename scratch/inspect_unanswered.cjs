const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const inputDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ';
const targetFiles = [
    'การใช้เทคโนโลยีดิจิทัล คอมพิวเตอร์.pdf',
    'การใช้ไวยากรณ์.pdf',
    'ระเบียบเตือนภัยพิบัติ.pdf',
    'วิชาภาษาอังกฤษ .pdf'
];

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
    for (const file of targetFiles) {
        const filePath = path.join(inputDir, file);
        if (!fs.existsSync(filePath)) {
            console.log(`File does not exist: ${file}`);
            continue;
        }
        const pages = await parsePDF(filePath);
        console.log(`\n=========================================`);
        console.log(`File: ${file} | Pages: ${pages.length}`);
        
        // Print the last 2 pages
        const startPage = Math.max(0, pages.length - 2);
        for (let i = startPage; i < pages.length; i++) {
            console.log(`--- Page ${i + 1} ---`);
            console.log(pages[i]);
        }
    }
}

run();
