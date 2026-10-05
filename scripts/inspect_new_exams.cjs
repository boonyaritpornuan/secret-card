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

function inspectPdf(filePath) {
  return new Promise((resolve) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataReady', pdfData => {
      let fullText = '';
      for (const p of pdfData.Pages) {
        fullText += p.Texts.map(t => safeDecode(t.R[0].T)).join(' ') + '\n';
      }
      fullText = decodePua(fullText);
      const hasInline = /ตอบ\s*[ก-งA-D]/i.test(fullText);
      const hasAnswerKey = /เฉลยข้อสอบ/i.test(fullText);
      const hasAnswerWord = /เฉลย/i.test(fullText);
      console.log(`${path.basename(filePath)} (${pdfData.Pages.length}p): inline=${hasInline} | keyTable=${hasAnswerKey} | hasเฉลย=${hasAnswerWord}`);
      resolve();
    });
    parser.on('pdfParser_dataError', err => {
      console.error('Err in', filePath, err);
      resolve();
    });
    parser.loadPDF(filePath);
  });
}

async function run() {
  const baseDir = 'C:/Users/boony/Downloads/คอมพิวเตอร์ สพฐ 38 ค(2)/ข้อสอบ';
  const cats = ['ภาค ก', 'ภาค ข 1', 'ภาค ข 2'];
  for (const cat of cats) {
    console.log(`\n=== ${cat} ===`);
    const files = fs.readdirSync(path.join(baseDir, cat)).filter(f => f.endsWith('.pdf'));
    for (const f of files) {
      await inspectPdf(path.join(baseDir, cat, f));
    }
  }
}

run();
