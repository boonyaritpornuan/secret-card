const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const inputDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ';
const outputDir = path.join(__dirname, '../data/paph/exams');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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
            if (currentLine.length > 0) lines.push(currentLine.join(' ')); // JOIN WITH SPACE!
            currentLine = [t.text];
            lastY = t.y;
          } else {
            currentLine.push(t.text);
          }
        }
        if (currentLine.length > 0) lines.push(currentLine.join(' ')); // JOIN WITH SPACE!
        pages.push(lines.join('\n'));
      }
      resolve(pages);
    });
    pdfParser.loadPDF(filePath);
  });
}

function normalize(str) {
    return str.replace(/(\d) (\d)/g, '$1$2').replace(/\s+/g, ' ').trim();
}

async function processFile(file) {
    const filePath = path.join(inputDir, file);
    const pages = await parsePDF(filePath);
    
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
        currentPassage: null,
        passageEndQ: -1
    };
    sets.push(currentSet);
    
    let lastQId = 0;
    
    for (let i = 0; i < allLines.length; i++) {
        const lineObj = allLines[i];
        const line = lineObj.text;
        if (!line) continue;
        
        const normLine = normalize(line);
        
        // Detect Set Headers
        const setHeaderMatch = normLine.match(/ชุดที่\s*(\d+)/i) || line.match(/ชุด\s*ที่\s*(\d+)/i);
        if (setHeaderMatch) {
            const setNum = parseInt(setHeaderMatch[1]);
            if (setNum > 1) {
                currentSet = {
                    name: `Set ${setNum}`,
                    questions: [],
                    answersMap: {},
                    currentPassage: null,
                    passageEndQ: -1
                };
                sets.push(currentSet);
                lastQId = 0;
                continue;
            }
        }
        
        // Detect two-line grid answer keys (e.g. line 1: numbers, line 2: letters)
        if (normLine.match(/^\d+(\s+\d+)+$/)) {
            // Find next non-empty line
            let nextIndex = i + 1;
            while (nextIndex < allLines.length && !allLines[nextIndex].text.trim()) {
                nextIndex++;
            }
            if (nextIndex < allLines.length) {
                const nextNorm = normalize(allLines[nextIndex].text);
                if (nextNorm.match(/^[ก-งA-Da-d](\s+[ก-งA-Da-d])+$/)) {
                    const numbers = normLine.split(' ');
                    const answers = nextNorm.split(' ');
                    if (numbers.length === answers.length) {
                        for (let j = 0; j < numbers.length; j++) {
                            currentSet.answersMap[parseInt(numbers[j])] = answers[j].toUpperCase();
                        }
                        i = nextIndex; // skip the next line since we processed it
                        continue;
                    }
                }
            }
        }
        
        // Check if it's a grid answer key line (e.g. "1 ก 11 ง 21 ข 31 ค 41 ก" or "1.ค 11.ง")
        const ansMatchRegex = /(\d{1,3})\s*[\.\s]\s*([ก-ฮa-dA-D])/gi;
        const matches = [];
        let match;
        while ((match = ansMatchRegex.exec(normLine)) !== null) {
            matches.push({
                num: parseInt(match[1]),
                ans: match[2].toUpperCase()
            });
        }
        
        // If there are at least 2 matches in a single line, or it matches the grid pattern
        if (matches.length >= 2 || (normLine.startsWith('เฉลย') && matches.length >= 1)) {
            for (const m of matches) {
                currentSet.answersMap[m.num] = m.ans;
            }
            continue;
        }
        
        // Check for inline answer/explanation (common in English/Grammar exams, allows lowercase)
        const inlineAnsMatch = normLine.match(/^(?:Answer:?|เฉลย:?)\s*([A-Dก-งa-d])/i);
        if (inlineAnsMatch) {
            if (currentSet.questions.length > 0) {
                const lastQ = currentSet.questions[currentSet.questions.length - 1];
                currentSet.answersMap[lastQ.id] = inlineAnsMatch[1].toUpperCase();
            }
            continue;
        }
        if (normLine.match(/^Explanation:/i)) {
            continue;
        }
        
        // Detect Passage
        if (normLine.match(/Reading Passage|Letter|อ่านบทความ|สำหรับข้อ|จงอ่าน/i) || normLine.match(/Part \d+ – Reading/i)) {
            currentSet.currentPassage = line + '\n';
            
            const matchRange = normLine.match(/Questions?\s*(\d+)\s*(?:–|-|ถึง)\s*(\d+)/i) || normLine.match(/สำหรับข้อ\s*(\d+)\s*(?:–|-|ถึง)\s*(\d+)/i);
            if (matchRange) {
                currentSet.passageEndQ = parseInt(matchRange[2]);
            } else {
                currentSet.passageEndQ = 999;
            }
            
            // Keep reading lines for passage until a question or answer starts
            while(i + 1 < allLines.length) {
                const nextLine = allLines[i+1].text.trim();
                if (!nextLine) { i++; continue; }
                const nextNorm = normalize(nextLine);
                if (nextNorm.match(/^(\d{1,3})\s*[\.\)]\s*(.*)/)) break; // question starts
                if (nextNorm.match(/^(?:Answer:|เฉลย:?)\s*([A-Dก-งa-d])/i)) break; // answer starts
                
                i++;
                currentSet.currentPassage += nextLine + '\n';
            }
            continue;
        }
        
        // Detect Question
        const qMatch = normLine.match(/^(\d{1,3})\s*[\.\)]\s*(.*)/);
        if (qMatch) {
            const qId = parseInt(qMatch[1]);
            
            // If the question number decreases/stays same, start a new set
            if (qId <= lastQId && lastQId > 0) {
                currentSet = {
                    name: `Set ${sets.length + 1}`,
                    questions: [],
                    answersMap: {},
                    currentPassage: null,
                    passageEndQ: -1
                };
                sets.push(currentSet);
                lastQId = 0;
            }
            
            if (qId > currentSet.passageEndQ) {
                currentSet.currentPassage = null;
            }
            
            lastQId = qId;
            const newQ = {
                id: qId,
                q: qMatch[2],
                choices: {},
                answer: null,
                page: lineObj.page,
                passage: currentSet.currentPassage ? currentSet.currentPassage.trim() : null
            };
            currentSet.questions.push(newQ);
            continue;
        }
        
        // Detect Choice
        const choiceMatch = normLine.match(/^([ก-งA-Da-d])\s*[\.\)]\s*(.*)/);
        if (choiceMatch && currentSet.questions.length > 0) {
            const lastQ = currentSet.questions[currentSet.questions.length - 1];
            const choiceKey = choiceMatch[1].toUpperCase();
            lastQ.choices[choiceKey] = choiceMatch[2];
            continue;
        }
        
        // Append text to last question or choice
        if (currentSet.questions.length > 0) {
            const lastQ = currentSet.questions[currentSet.questions.length - 1];
            const choiceKeys = Object.keys(lastQ.choices);
            if (choiceKeys.length > 0) {
                const lastChoiceKey = choiceKeys[choiceKeys.length - 1];
                lastQ.choices[lastChoiceKey] += ' ' + line;
            } else {
                lastQ.q += ' ' + line;
            }
        }
    }
    
    // Process and combine sets to a single sequential JSON
    let finalQuestions = [];
    let globalId = 1;
    
    for (const s of sets) {
        // Map answers of this set to the questions
        for (const q of s.questions) {
            const mappedAnswer = s.answersMap[q.id] || null;
            q.answer = mappedAnswer;
            
            // Re-map to sequential global ID
            const outputQ = {
                id: globalId++,
                q: q.q.trim(),
                choices: {},
                answer: q.answer,
                passage: q.passage
            };
            
            // Clean choices text
            for (const [k, v] of Object.entries(q.choices)) {
                outputQ.choices[k] = v.trim();
            }
            
            finalQuestions.push(outputQ);
        }
    }
    
    const jsonFileName = file.replace('.pdf', '.json');
    const outPath = path.join(outputDir, jsonFileName);
    fs.writeFileSync(outPath, JSON.stringify(finalQuestions, null, 2), 'utf8');
    
    console.log(`Processed ${file}: ${finalQuestions.length} questions mapped (from ${sets.length} sets).`);
}

async function runAll() {
    for (const file of files) {
        try {
            await processFile(file);
        } catch (e) {
            console.error(`Error processing file ${file}:`, e);
        }
    }
    console.log("ALL FILES PROCESSED SUCCESSFULLY!");
}

runAll();
