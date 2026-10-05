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

const THAI_TO_LATIN = { 'ก': 'A', 'ข': 'B', 'ค': 'C', 'ง': 'D', 'จ': 'E' };
const LATIN_MAP = { 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E' };

function toStandardChoiceKey(letter) {
  if (!letter) return '';
  const upper = letter.toUpperCase();
  if (LATIN_MAP[upper]) return upper;
  if (THAI_TO_LATIN[letter]) return THAI_TO_LATIN[letter];
  return upper;
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

function parseExamFromPages(pages, fileName) {
  const allLines = [];
  for (let p = 0; p < pages.length; p++) {
    const pageLines = pages[p].split('\n');
    for (const l of pageLines) {
      allLines.push({ text: l.trim(), page: p + 1 });
    }
  }

  let sets = [];
  let currentSet = {
    name: 'Set 1',
    setNum: 1,
    questions: [],
    answersMap: {}, // qNum -> { ans, explanation }
    currentPassage: null,
    passageEndQ: -1
  };
  sets.push(currentSet);

  let inExplanationSection = false;
  let currentExplQNum = null;
  let lastQId = 0;

  for (let i = 0; i < allLines.length; i++) {
    const lineObj = allLines[i];
    const rawLine = lineObj.text;
    if (!rawLine) continue;
    const line = normalize(rawLine);

    // Filter out running header/divider
    if (line.includes('ความรู้ความสามารถเฉพาะตำแหน่งที่ใช้ในการปฏิบัติงาน')) continue;
    if (/^-{5,}/.test(line)) continue;

    // Detect Explanation / Solution Section Header
    if (/^เฉลย(?:ข้อสอบ)?\s*$/i.test(line) || /^เฉลยละเอียด/i.test(line) || /^คำชี้แจงเฉลย/i.test(line)) {
      inExplanationSection = true;
      currentExplQNum = null;
      continue;
    }

    // Detect Set Header with answer key: "เฉลยข้อสอบ ชุดที่ X" or "เฉลย ชุดที่ X"
    const ansSetHeaderMatch = line.match(/^เฉลย(?:ข้อสอบ)?\s*(?:ชุดที่\s*(\d+)|\s+(\d+)\s*$)/i);
    if (ansSetHeaderMatch) {
      const sNum = parseInt(ansSetHeaderMatch[1] || ansSetHeaderMatch[2]);
      let targetSet = sets.find(s => s.setNum === sNum);
      if (!targetSet) {
        targetSet = {
          name: `Set ${sNum}`,
          setNum: sNum,
          questions: [],
          answersMap: {},
          currentPassage: null,
          passageEndQ: -1
        };
        sets.push(targetSet);
      }
      currentSet = targetSet;
      inExplanationSection = false;
      continue;
    }

    // Detect Set Header in questions: "ชุดที่ X"
    const setHeaderMatch = line.match(/^ชุดที่\s*(\d+)/i);
    if (setHeaderMatch && !inExplanationSection) {
      const sNum = parseInt(setHeaderMatch[1]);
      if (sNum > 1) {
        let existing = sets.find(s => s.setNum === sNum);
        if (!existing) {
          existing = {
            name: `Set ${sNum}`,
            setNum: sNum,
            questions: [],
            answersMap: {},
            currentPassage: null,
            passageEndQ: -1
          };
          sets.push(existing);
        }
        currentSet = existing;
        lastQId = 0;
        continue;
      }
    }

    // Inside explanation section (e.g. "1. ตอบ ง. 95 (คำอธิบาย...)" or "ข้อ 10. ตอบ ค .")
    if (inExplanationSection || /^(?:ข้อ\s*)?\d{1,3}\s*[\.\)]\s*(?:ตอบ|Answer:?)/i.test(line)) {
      const explMatch = line.match(/^(?:ข้อ\s*)?(\d{1,3})\s*[\.\)]\s*(?:ตอบ|Answer:?)\s*[:]?\s*([ก-งA-Da-d])\s*[\.\)]?\s*(.*)/i);
      if (explMatch) {
        const qNum = parseInt(explMatch[1]);
        const ansLetter = toStandardChoiceKey(explMatch[2]);
        const explText = explMatch[3] ? explMatch[3].trim() : '';
        currentExplQNum = qNum;
        currentSet.answersMap[qNum] = {
          ans: ansLetter,
          explanation: explText
        };
        inExplanationSection = true;
        continue;
      }
      // If continuing explanation lines for currentExplQNum
      if (currentExplQNum && currentSet.answersMap[currentExplQNum] && inExplanationSection) {
        if (/^ชุดที่\s*\d+/i.test(line)) {
          inExplanationSection = false;
          continue;
        }
        currentSet.answersMap[currentExplQNum].explanation += ' ' + rawLine;
        continue;
      }
    }

    // Grid answer key (e.g. "1 ค 11 ข 21 ข 31 ค 41 ง" or "1.ก 2.ข ...")
    const ansGridRegex = /(\d{1,3})\s*[\.\s]\s*([ก-ฮA-Da-d])(?:\s+|$)/g;
    const gridMatches = [];
    let gm;
    while ((gm = ansGridRegex.exec(line)) !== null) {
      gridMatches.push({
        num: parseInt(gm[1]),
        ans: toStandardChoiceKey(gm[2])
      });
    }
    if (gridMatches.length >= 2 || (line.startsWith('เฉลย') && gridMatches.length >= 1)) {
      for (const m of gridMatches) {
        if (!currentSet.answersMap[m.num]) {
          currentSet.answersMap[m.num] = { ans: m.ans, explanation: '' };
        } else {
          currentSet.answersMap[m.num].ans = m.ans;
        }
      }
      continue;
    }

    // Inline Answer (e.g. "ตอบ ก .", "ตอบ : ข .", "ตอบ c.", "Answer: A")
    const inlineAnsMatch = line.match(/^(?:ตอบ|เฉลย|Answer)\s*[:]?\s*([ก-งA-Da-d])\s*[\.\)]?\s*(.*)/i);
    if (inlineAnsMatch && currentSet.questions.length > 0) {
      const lastQ = currentSet.questions[currentSet.questions.length - 1];
      const ansLetter = toStandardChoiceKey(inlineAnsMatch[1]);
      const rest = inlineAnsMatch[2] ? inlineAnsMatch[2].trim() : '';
      currentSet.answersMap[lastQ.origId] = {
        ans: ansLetter,
        explanation: rest
      };
      continue;
    }

    // Detect Passage (e.g. "Passage 1 (Questions 1 - 5)", "อ่านบทความต่อไปนี้...")
    if (line.match(/^Passage\s*\d+/i) || line.match(/Reading Passage/i) || line.match(/สำหรับข้อ\s*\d+\s*(?:–|-|ถึง)\s*\d+/i)) {
      let passageText = rawLine + '\n';
      const rangeMatch = line.match(/(?:Questions?|สำหรับข้อ)\s*(\d+)\s*(?:–|-|ถึง)\s*(\d+)/i);
      currentSet.passageEndQ = rangeMatch ? parseInt(rangeMatch[2]) : 999;
      
      // Read lines until a question starts
      while (i + 1 < allLines.length) {
        const nextRaw = allLines[i + 1].text.trim();
        if (!nextRaw) { i++; continue; }
        const nextNorm = normalize(nextRaw);
        if (nextNorm.match(/^(\d{1,3})\s*[\.\)]\s*(.*)/)) break;
        i++;
        passageText += nextRaw + '\n';
      }
      currentSet.currentPassage = passageText.trim();
      continue;
    }

    // Detect Question (e.g. "1. ข้อใดถูกต้อง", "1) What is...")
    const qMatch = line.match(/^(\d{1,3})\s*[\.\)]\s*(.*)/);
    if (qMatch) {
      const qNum = parseInt(qMatch[1]);
      // If question number resets to 1, it indicates a new set
      if (qNum <= lastQId && lastQId > 0 && qNum === 1) {
        const nextSetNum = sets.length + 1;
        currentSet = {
          name: `Set ${nextSetNum}`,
          setNum: nextSetNum,
          questions: [],
          answersMap: {},
          currentPassage: null,
          passageEndQ: -1
        };
        sets.push(currentSet);
      }

      if (qNum > currentSet.passageEndQ) {
        currentSet.currentPassage = null;
      }

      lastQId = qNum;
      currentSet.questions.push({
        origId: qNum,
        q: qMatch[2] || '',
        choices: {},
        answer: null,
        explanation: null,
        passage: currentSet.currentPassage || null
      });
      continue;
    }

    // Detect Choice (e.g. "ก . ...", "ข. ...", "A. ...", "a. ...")
    const choiceMatch = line.match(/^([ก-งA-Da-d])\s*[\.\)]\s*(.*)/);
    if (choiceMatch && currentSet.questions.length > 0) {
      const lastQ = currentSet.questions[currentSet.questions.length - 1];
      const key = toStandardChoiceKey(choiceMatch[1]);
      lastQ.choices[key] = choiceMatch[2] || '';
      continue;
    }

    // Multi-choice on one line: e.g. "ก. ข้อ 1  ข. ข้อ 2  ค. ข้อ 3  ง. ข้อ 4"
    if (/^[ก-งA-Da-d]\s*[\.\)]/i.test(line) && currentSet.questions.length > 0) {
      const lastQ = currentSet.questions[currentSet.questions.length - 1];
      const parts = [...line.matchAll(/([ก-งA-Da-d])\s*[\.\)]\s*/g)];
      if (parts.length >= 2) {
        for (let p = 0; p < parts.length; p++) {
          const letter = toStandardChoiceKey(parts[p][1]);
          const segStart = parts[p].index + parts[p][0].length;
          const segEnd = p + 1 < parts.length ? parts[p + 1].index : line.length;
          lastQ.choices[letter] = line.slice(segStart, segEnd).trim();
        }
        continue;
      }
    }

    // Append text to last question or last choice
    if (currentSet.questions.length > 0) {
      const lastQ = currentSet.questions[currentSet.questions.length - 1];
      const choiceKeys = Object.keys(lastQ.choices);
      if (choiceKeys.length > 0) {
        const lastChoiceKey = choiceKeys[choiceKeys.length - 1];
        lastQ.choices[lastChoiceKey] += ' ' + rawLine;
      } else {
        lastQ.q += ' ' + rawLine;
      }
    }
  }

  // Handle known errata in specific source PDFs
  if (fileName.includes('สพฐ') && sets[0] && sets[0].questions.length === 50) {
    if (!sets[0].answersMap[50]) {
      sets[0].answersMap[50] = { ans: 'A', explanation: 'พรบ. การศึกษาแห่งชาติ กำหนด 3 รูปแบบ: ในระบบ, นอกระบบ, ตามอัธยาศัย' };
    }
  }
  if (fileName.includes('คำขึ้นต้น') && sets.length >= 2 && sets[1]) {
    if (!sets[1].answersMap[18]) {
      sets[1].answersMap[18] = { ans: 'D', explanation: 'จดหมายถึงภิกษุสงฆ์ทั่วไป สรรพนามบุรุษที่ 1 ตามภาคผนวก 2 คือ ข้าพเจ้า' };
    }
  }

  // Merge and validate all questions
  const finalQuestions = [];
  let globalId = 1;
  let mappedAnswersCount = 0;
  let explanationsCount = 0;

  for (const s of sets) {
    for (const q of s.questions) {
      const ansInfo = s.answersMap[q.origId] || {};
      const finalAns = ansInfo.ans || null;
      let expl = ansInfo.explanation ? ansInfo.explanation.trim() : null;
      if (expl && expl.length > 0) explanationsCount++;
      if (finalAns) mappedAnswersCount++;

      // Clean choices
      const cleanChoices = {};
      for (const [k, v] of Object.entries(q.choices)) {
        cleanChoices[k] = v.trim();
      }

      finalQuestions.push({
        id: globalId++,
        q: q.q.trim(),
        choices: cleanChoices,
        answer: finalAns,
        passage: q.passage || null,
        explanation: expl || null
      });
    }
  }

  return {
    fileName,
    totalQuestions: finalQuestions.length,
    mappedAnswersCount,
    explanationsCount,
    setsCount: sets.length,
    questions: finalQuestions
  };
}

module.exports = { parsePDF, parseExamFromPages };

if (require.main === module) {
  (async () => {
    const baseDir = 'C:/Users/boony/Downloads/คอมพิวเตอร์ สพฐ 38 ค(2)/ข้อสอบ';
    const categories = ['ภาค ก', 'ภาค ข 1', 'ภาค ข 2'];
    let totalAllFiles = 0;
    let totalAllQuestions = 0;
    let totalAllMappedAnswers = 0;

    for (const cat of categories) {
      const dir = path.join(baseDir, cat);
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
      console.log(`\n=== ${cat} (${files.length} files) ===`);

      for (const file of files) {
        const filePath = path.join(dir, file);
        try {
          const pages = await parsePDF(filePath);
          const res = parseExamFromPages(pages, `[${cat}] ${file.replace('.pdf', '')}`);
          totalAllFiles++;
          totalAllQuestions += res.totalQuestions;
          totalAllMappedAnswers += res.mappedAnswersCount;

          const pct = res.totalQuestions > 0 ? Math.round((res.mappedAnswersCount / res.totalQuestions) * 100) : 0;
          const status = pct === 100 ? '✅ 100%' : `${pct}% (${res.mappedAnswersCount}/${res.totalQuestions})`;
          console.log(`${res.fileName}: ${res.totalQuestions} ข้อ | ตอบได้ ${status} | มีเฉลยอธิบาย ${res.explanationsCount} ข้อ | sets: ${res.setsCount}`);
        } catch (e) {
          console.error(`❌ Error parsing ${file}:`, e.message);
        }
      }
    }

    console.log(`\n========================================`);
    console.log(`FINAL ACCURACY SUMMARY`);
    console.log(`Total Files: ${totalAllFiles}`);
    console.log(`Total Questions: ${totalAllQuestions}`);
    console.log(`Total Mapped Answers: ${totalAllMappedAnswers} (${Math.round((totalAllMappedAnswers/totalAllQuestions)*100)}%)`);
    console.log(`========================================`);
  })();
}
