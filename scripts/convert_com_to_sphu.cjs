const fs = require('fs');
const path = require('path');

// Map Thai choice letters (ก-ง) to English letters (A-D) used by the app
const THAI_TO_LATIN = { 'ก': 'A', 'ข': 'B', 'ค': 'C', 'ง': 'D', 'จ': 'E', 'ฉ': 'F', 'ช': 'G' };

const inputDir = path.join(__dirname, '../data/COM/output');
const examOutDir = path.join(__dirname, '../data/sphu/exams');
const cardOutFile = path.join(__dirname, '../data/sphu/cards.json');

if (!fs.existsSync(examOutDir)) {
  fs.mkdirSync(examOutDir, { recursive: true });
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));

const cardSets = {}; // { rawCards_s1: [...], ... }
let setIdx = 0;

for (const file of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(inputDir, file), 'utf8'));
  const title = file.replace('.json', '');

  const examQuestions = raw.map((q, i) => {
    const choices = {};
    for (const key of Object.keys(q.options)) {
      const latin = THAI_TO_LATIN[key] || key;
      choices[latin] = q.options[key];
    }
    const answer = THAI_TO_LATIN[q.answer] || q.answer;
    return {
      id: i + 1,
      q: q.question,
      choices,
      answer,
      passage: null,
      explanation: (q.explanation || '').trim() || null
    };
  });

  const outFile = path.join(examOutDir, file);
  fs.writeFileSync(outFile, JSON.stringify(examQuestions, null, 2), 'utf8');
  console.log(`OK ${title}: ${examQuestions.length} ข้อ -> data/sphu/exams/${file}`);

  // Flashcard set: question + correct answer (highlighted) + explanation
  setIdx += 1;
  const cards = raw.map(q => ({
    q: q.question,
    a: `<span class='hl'>${q.answer_text || ''}</span>${(q.explanation && q.explanation.trim()) ? `<br/>${q.explanation.trim()}` : ''}`
  }));
  cardSets[`rawCards_s${setIdx}`] = cards;
}

fs.writeFileSync(cardOutFile, JSON.stringify(cardSets, null, 2), 'utf8');
console.log('Flashcards written -> src/sphu_cards.json');
console.log('SETS:', Object.keys(cardSets).length, 'TOTAL CARDS:', Object.values(cardSets).reduce((s, c) => s + c.length, 0));