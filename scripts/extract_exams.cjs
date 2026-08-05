const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const inputDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ';
const outputDir = path.join(__dirname, '../data/paph/exams');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.pdf'));
let processedCount = 0;

function safeDecode(str) {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return unescape(str);
    }
}

function parsePDF(filePath, fileName) {
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

async function processAll() {
  for (const file of files) {
    const filePath = path.join(inputDir, file);
    try {
      const text = await parsePDF(filePath, file);
      
      let questions = [];
      let currentQ = null;
      let currentChoice = null;
      let currentPassage = null;
      let passageEndQ = -1;
      
      const lines = text.split('\n');
      let inAnswers = false;
      let answersMap = {};
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Remove spaces inside numbers
        const cleanLine = line.replace(/(\d)\s+(\d)/g, '$1$2').replace(/\s+/g, ' ');
        
        // Check for answers grid (supports Thai ก-ฮ or English a-d/A-D)
        const ansMatchRegex = /(\d{1,3})\s*([ก-ฮa-dA-D])/gi;
        if (/^(\d{1,3})\s*[ก-ฮa-dA-D]\s*(\d{1,3})\s*[ก-ฮa-dA-D]/.test(cleanLine) || (cleanLine.match(ansMatchRegex) || []).length > 2) {
            inAnswers = true;
        }
        
        if (inAnswers) {
            let match;
            while ((match = ansMatchRegex.exec(cleanLine)) !== null) {
                answersMap[parseInt(match[1])] = match[2].toUpperCase();
            }
            continue; // Answers block usually at the end, so we can skip choice/question parsing
        }

        // Check for inline answer/explanation (common in English exams)
        const inlineAnswerMatch = cleanLine.match(/^(?:Answer:|เฉลย:?)\s*([A-Dก-ง])/i);
        if (inlineAnswerMatch) {
            if (currentQ) {
                answersMap[currentQ.id] = inlineAnswerMatch[1].toUpperCase();
            }
            continue;
        }
        if (cleanLine.match(/^Explanation:/i)) {
            continue; // Ignore explanation block
        }

        // Detect Passage
        if (cleanLine.match(/Reading Passage|Letter|อ่านบทความ|สำหรับข้อ|จงอ่าน/i) || cleanLine.match(/Part \d+ – Reading/i)) {
            currentPassage = cleanLine + '\n';
            
            // Try to find if it specifies ending question
            const matchRange = cleanLine.match(/Questions?\s*(\d+)\s*(?:–|-|ถึง)\s*(\d+)/i) || cleanLine.match(/สำหรับข้อ\s*(\d+)\s*(?:–|-|ถึง)\s*(\d+)/i);
            if (matchRange) {
                passageEndQ = parseInt(matchRange[2]);
            } else {
                passageEndQ = 999; // Assume until next passage or end
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
        
        // Check for choice (Thai ก-ง or English A-D)
        const cMatch = cleanLine.match(/^([ก-ฮA-Da-d])\s*\.\s*(.*)/);
        if (cMatch && currentQ) {
            currentChoice = cMatch[1].toUpperCase();
            currentQ.choices[currentChoice] = cMatch[2];
            continue;
        }
        
        // Append text to current choice or question
        if (currentQ) {
            if (currentChoice) {
                currentQ.choices[currentChoice] += ' ' + cleanLine;
            } else {
                currentQ.q += ' ' + cleanLine;
            }
        }
      }
      
      if (currentQ) {
          questions.push(currentQ);
      }
      
      // Map answers
      for (const q of questions) {
          if (answersMap[q.id]) {
              q.answer = answersMap[q.id];
          }
      }
      
      // Save JSON
      const jsonFileName = file.replace('.pdf', '.json');
      fs.writeFileSync(path.join(outputDir, jsonFileName), JSON.stringify(questions, null, 2), 'utf8');
      
      processedCount++;
      console.log(`Processed ${file}: ${questions.length} questions, ${Object.keys(answersMap).length} answers found.`);
      
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
  
  console.log(`\nCompleted extracting ${processedCount} out of ${files.length} PDFs.`);
}

processAll();
