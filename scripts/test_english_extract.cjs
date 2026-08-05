const fs = require('fs');
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
      let fullText = '';
      
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
        
        fullText += lines.join('\n') + '\n';
      }
      resolve(fullText);
    });
    pdfParser.loadPDF(filePath);
  });
}

async function testParse() {
  const text = await parsePDF('C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ/English 1.pdf');
  const lines = text.split('\n');
  
  let questions = [];
  let currentQ = null;
  let currentChoice = null;
  let currentPassage = null;
  let passageEndQ = -1; // If passage specifies (for Questions 61-64)
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cleanLine = line.replace(/(\d)\s+(\d)/g, '$1$2').replace(/\s+/g, ' ');
    
    // Detect Answer line
    if (cleanLine.match(/^(?:Answer:|เฉลย:?)\s*([A-Dก-ง])/i)) {
       // We ignore it or parse the answer directly into currentQ if applicable
       continue;
    }
    if (cleanLine.match(/^Explanation:/i)) {
       continue; // skip explanation for now
    }

    // Detect Passage
    if (cleanLine.match(/Reading Passage|Letter|อ่านบทความ/i) || cleanLine.match(/Part \d+ – Reading/i)) {
       currentPassage = cleanLine + '\n';
       
       // Try to find if it specifies ending question
       const matchRange = cleanLine.match(/Questions?\s*(\d+)\s*(?:–|-|ถึง)\s*(\d+)/i);
       if (matchRange) {
           passageEndQ = parseInt(matchRange[2]);
       } else {
           passageEndQ = 999; // Assume until next passage
       }

       // Keep reading lines for passage until a question starts
       while(i + 1 < lines.length) {
          const nextLine = lines[i+1].trim().replace(/(\d)\s+(\d)/g, '$1$2').replace(/\s+/g, ' ');
          if (nextLine.match(/^(\d{1,3})\s*\.\s*(.*)/)) break; // next line is a question
          if (nextLine.match(/^(?:Answer:|เฉลย:?)\s*([A-Dก-ง])/i)) break;
          
          i++;
          if (nextLine) currentPassage += nextLine + '\n';
       }
       continue;
    }
    
    // Check for new question
    const qMatch = cleanLine.match(/^(\d{1,3})\s*\.\s*(.*)/);
    if (qMatch) {
        if (currentQ) questions.push(currentQ);
        
        let qNum = parseInt(qMatch[1]);
        if (qNum > passageEndQ) {
           currentPassage = null;
        }

        currentQ = {
            id: qNum,
            q: qMatch[2],
            choices: {},
            answer: null,
            passage: currentPassage
        };
        currentChoice = null;
        continue;
    }
    
    // Check for choice
    const cMatch = cleanLine.match(/^([ก-ฮA-Da-d])\s*\.\s*(.*)/);
    if (cMatch && currentQ) {
        currentChoice = cMatch[1].toUpperCase();
        currentQ.choices[currentChoice] = cMatch[2];
        continue;
    }
    
    // Append text
    if (currentQ) {
        if (currentChoice) {
            currentQ.choices[currentChoice] += ' ' + cleanLine;
        } else {
            currentQ.q += ' ' + cleanLine;
        }
    }
  }
  
  if (currentQ) questions.push(currentQ);
  
  console.log("Questions 60-65:");
  console.log(JSON.stringify(questions.slice(59, 65), null, 2));
}

testParse();
