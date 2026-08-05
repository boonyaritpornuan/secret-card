const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfPath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ/ระเบียบเตือนภัยพิบัติ.pdf';

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

function normalize(str) {
    return str.replace(/(\d)\s+(\d)/g, '$1$2').replace(/\s+/g, ' ').trim();
}

async function run() {
    const pages = await parsePDF(pdfPath);
    console.log("--- Page 12 Debug ---");
    const lines = pages[11].split('\n');
    for (const line of lines) {
        const normLine = normalize(line);
        if (!normLine) continue;
        
        const ansMatchRegex = /(\d{1,3})\s*[\.\s]\s*([ก-ฮa-dA-D])/gi;
        const matches = [];
        let match;
        while ((match = ansMatchRegex.exec(normLine)) !== null) {
            matches.push({
                num: parseInt(match[1]),
                ans: match[2].toUpperCase()
            });
        }
        
        console.log(`line: "${normLine}" | matches count: ${matches.length}`);
        if (matches.length > 0) {
            console.log(`  matches:`, matches);
        }
    }
}

run();
