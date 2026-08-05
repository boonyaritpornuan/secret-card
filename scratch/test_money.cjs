const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const pdfPath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ/ระเบียบเงินช่วยเหลือผู้ประสบภัย.pdf';

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
            if (currentLine.length > 0) lines.push(currentLine.join(''));
            currentLine = [t.text];
            lastY = t.y;
          } else {
            currentLine.push(t.text);
          }
        }
        if (currentLine.length > 0) lines.push(currentLine.join(''));
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
    console.log(`Total Pages: ${pages.length}`);
    
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
                console.log(`Detected new set from header: ${currentSet.name} at page ${lineObj.page}`);
                continue;
            }
        }
        
        const ansMatchRegex = /(\d{1,3})\s*[\.\s]\s*([ก-ฮa-dA-D])/gi;
        const matches = [];
        let match;
        while ((match = ansMatchRegex.exec(normLine)) !== null) {
            matches.push({
                num: parseInt(match[1]),
                ans: match[2].toUpperCase()
            });
        }
        
        if (matches.length >= 3 || (normLine.startsWith('เฉลย') && matches.length >= 1)) {
            for (const m of matches) {
                currentSet.answersMap[m.num] = m.ans;
            }
            console.log(`Parsed answer key line at page ${lineObj.page}:`, matches.map(m => `${m.num}:${m.ans}`).join(', '));
            continue;
        }
        
        const inlineAnsMatch = normLine.match(/^(?:Answer:|เฉลย:?)\s*([A-Dก-ง])/i);
        if (inlineAnsMatch) {
            if (currentSet.questions.length > 0) {
                const lastQ = currentSet.questions[currentSet.questions.length - 1];
                currentSet.answersMap[lastQ.id] = inlineAnsMatch[1].toUpperCase();
            }
            continue;
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
                console.log(`Detected new set from Q number decrease (Q${qId} after Q${lastQId}) at page ${lineObj.page}`);
            }
            
            lastQId = qId;
            const newQ = {
                id: qId,
                q: qMatch[2],
                choices: {},
                answer: null,
                page: lineObj.page
            };
            currentSet.questions.push(newQ);
            continue;
        }
        
        const choiceMatch = normLine.match(/^([ก-งA-Da-d])\s*[\.\)]\s*(.*)/);
        if (choiceMatch && currentSet.questions.length > 0) {
            const lastQ = currentSet.questions[currentSet.questions.length - 1];
            const choiceKey = choiceMatch[1].toUpperCase();
            lastQ.choices[choiceKey] = choiceMatch[2];
            continue;
        }
        
        if (currentSet.questions.length > 0) {
            const lastQ = currentSet.questions[currentSet.questions.length - 1];
            const choiceKeys = Object.keys(lastQ.choices);
            if (choiceKeys.length > 0) {
                const lastChoiceKey = choiceKeys[choiceKeys.length - 1];
                lastQ.choices[lastChoiceKey] += ' ' + normLine;
            } else {
                lastQ.q += ' ' + normLine;
            }
        }
    }
    
    console.log(`\n--- Set Summaries ---`);
    for (const s of sets) {
        console.log(`Set: ${s.name} | Questions: ${s.questions.length} | Answers Found: ${Object.keys(s.answersMap).length}`);
        s.questions.slice(0, 3).forEach(q => {
            const ans = s.answersMap[q.id] || null;
            console.log(`  Q${q.id}: ${q.q.substring(0, 50)}... -> Answer: ${ans}`);
        });
    }
}

run();
