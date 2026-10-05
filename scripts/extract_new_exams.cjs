const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const PUA_MAP = { 0xF70A: '\u0E48', 0xF70B: '\u0E49', 0xF70C: '\u0E4A', 0xF70D: '\u0E4B', 0xF70E: '\u0E4C' };

function safeDecode(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return unescape(str);
  }
}

function decodePua(text) {
  let out = '';
  for (const c of text) {
    const cp = c.codePointAt(0);
    out += PUA_MAP[cp] || c;
  }
  return out.replace(/\u0E4D\u0E32/g, '\u0E33').normalize('NFC');
}

function normalize(str) {
  return str.replace(/(\d)\s+(\d)/g, '$1$2').replace(/\s+/g, ' ').trim();
}

function parsePDF(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      let pages = [];
      for (const page of pdfData.Pages) {
        const texts = page.Texts.map(t => ({
          text: decodePua(safeDecode(t.R[0].T)),
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

// Quick test on 3 sample files
async function test() {
  const samples = [
    'C:/Users/boony/Downloads/คอมพิวเตอร์ สพฐ 38 ค(2)/ข้อสอบ/ภาค ข 2/การติดตั้งเครื่องคอมพิวเตอร์ส่วนบุคคล.pdf',
    'C:/Users/boony/Downloads/คอมพิวเตอร์ สพฐ 38 ค(2)/ข้อสอบ/ภาค ก/อนุกรม.pdf',
    'C:/Users/boony/Downloads/คอมพิวเตอร์ สพฐ 38 ค(2)/ข้อสอบ/ภาค ข 1/นโยบายรัฐบาล.pdf'
  ];

  for (const s of samples) {
    console.log('\n=====================================');
    console.log('Testing: ' + path.basename(s));
    const pages = await parsePDF(s);
    console.log('Total pages: ' + pages.length);
    console.log('Page 1 first 5 lines:');
    const l1 = pages[0].split('\n').slice(0, 5);
    l1.forEach(l => console.log('  ', l));
  }
}

test().catch(console.error);
