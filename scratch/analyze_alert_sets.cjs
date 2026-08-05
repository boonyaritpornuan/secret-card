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
    let allLines = [];
    for (let i = 0; i < pages.length; i++) {
        const lines = pages[i].split('\n');
        for (const line of lines) {
            allLines.push({
                text: line.trim(),
                page: i + 1
            });
        }
    }
    
    let sets = [];
    let currentSet = {
        name: 'Set 1',
        questions: [],
        answersMap: {},
    };
    sets.push(currentSet);
    
    let lastQId = 0;
    
    for (let i = 0; i < allLines.length; i++) {
        const lineObj = allLines[i];
        const line = lineObj.text;
        if (!line) continue;
        const normLine = normalize(line);
        
        const setHeaderMatch = normLine.match(/ชุดที่\s*(\d+)/i) || line.match(/ชุด\s*ที่\s*(\d+)/i);
        if (setHeaderMatch) {
            const setNum = parseInt(setHeaderMatch[1]);
            if (setNum > 1) {
                currentSet = {
                    name: `Set ${setNum}`,
                    questions: [],
                    answersMap: {},
                };
                sets.push(currentSet);
                lastQId = 0;
                continue;
            }
        }
        
        const qMatch = normLine.match(/^(\d{1,3})\s*[\.\)]\s*(.*)/);
        if (qMatch) {
            const qId = parseInt(qMatch[1]);
            if (qId <= lastQId && lastQId > 0) {
                currentSet = {
                    name: `Set ${sets.length + 1}`,
                    questions: [],
                    answersMap: {},
                };
                sets.push(currentSet);
                lastQId = 0;
            }
            lastQId = qId;
            currentSet.questions.push({ id: qId, q: qMatch[2], page: lineObj.page });
        }
    }
    
    for (const s of sets) {
        console.log(`Set Name: ${s.name} | Questions count: ${s.questions.length}`);
        if (s.questions.length > 0) {
            console.log(`  First Q: Q${s.questions[0].id} on Page ${s.questions[0].page}`);
            console.log(`  Last Q: Q${s.questions[s.questions.length - 1].id} on Page ${s.questions[s.questions.length - 1].page}`);
        }
    }
}

run();
