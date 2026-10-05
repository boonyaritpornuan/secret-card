const fs = require('fs');
const path = require('path');
const { parsePDF, parseExamFromPages } = require('./parse_and_test_all_new_exams.cjs');

const baseDir = 'C:/Users/boony/Downloads/คอมพิวเตอร์ สพฐ 38 ค(2)/ข้อสอบ';
const examOutDir = path.join(__dirname, '../data/sphu/exams');
const cardOutFile = path.join(__dirname, '../data/sphu/cards.json');

if (!fs.existsSync(examOutDir)) {
  fs.mkdirSync(examOutDir, { recursive: true });
}

// Map Latin keys A-D back to Thai text if needed, or lookup choice
const LATIN_TO_THAI = { 'A': 'ก', 'B': 'ข', 'C': 'ค', 'D': 'ง', 'E': 'จ' };

async function run() {
  console.log('=== STARTING IMPORT OF NEW EXAMS & FLASHCARDS ===');
  
  // 1. Read existing flashcards to preserve them
  let existingCards = {};
  if (fs.existsSync(cardOutFile)) {
    try {
      existingCards = JSON.parse(fs.readFileSync(cardOutFile, 'utf8'));
      console.log(`Loaded existing cards with keys: ${Object.keys(existingCards).length}`);
    } catch (e) {
      console.warn('Could not parse existing cards.json:', e);
    }
  }

  const newCards = { ...existingCards };
  const categories = [
    { name: 'ภาค ก', prefix: 'k', partNum: 2 },
    { name: 'ภาค ข 1', prefix: 'kb1', partNum: 3 },
    { name: 'ภาค ข 2', prefix: 'kb2', partNum: 4 }
  ];

  const partMetadata = [];

  for (const cat of categories) {
    const dir = path.join(baseDir, cat.name);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
    console.log(`\nProcessing ${cat.name} (${files.length} files)...`);

    const catSets = [];
    let fileIdx = 0;

    for (const file of files) {
      fileIdx++;
      const filePath = path.join(dir, file);
      const title = file.replace('.pdf', '').trim();
      const examTitle = `[${cat.name}] ${title}`;
      const examOutName = `${examTitle}.json`;
      const examOutPath = path.join(examOutDir, examOutName);

      const pages = await parsePDF(filePath);
      const res = parseExamFromPages(pages, examTitle);

      // Write exam JSON
      fs.writeFileSync(examOutPath, JSON.stringify(res.questions, null, 2), 'utf8');

      // Create flashcards
      const cardKey = `rawCards_${cat.prefix}_${fileIdx}`;
      const cards = res.questions.map(q => {
        const ansKey = q.answer || '';
        const thaiLetter = LATIN_TO_THAI[ansKey] || ansKey;
        const choiceText = q.choices[ansKey] || '';
        
        let answerHtml = `<span class='hl'>${thaiLetter ? `${thaiLetter}. ` : ''}${choiceText}</span>`;
        if (q.explanation && q.explanation.trim()) {
          answerHtml += `<br/><span style="color: #94a3b8; font-size: 13px;">${q.explanation.trim()}</span>`;
        }

        let questionText = q.q;
        if (q.passage && q.passage.trim()) {
          questionText = `[บทความประกอบ]\n${q.passage.trim()}\n\nคำถาม: ${questionText}`;
        }

        return {
          q: questionText,
          a: answerHtml
        };
      });

      newCards[cardKey] = cards;
      catSets.push({
        id: `sp-${cat.prefix}-${fileIdx}`,
        label: title,
        cardKey: cardKey,
        count: cards.length
      });

      console.log(`  ✓ ${examOutName}: ${res.questions.length} ข้อ -> ${cardKey}`);
    }

    partMetadata.push({
      catName: cat.name,
      partNum: cat.partNum,
      prefix: cat.prefix,
      sets: catSets
    });
  }

  // 2. Save merged cards.json
  fs.writeFileSync(cardOutFile, JSON.stringify(newCards, null, 2), 'utf8');
  console.log(`\nSuccessfully saved cards.json with ${Object.keys(newCards).length} total card sets!`);

  // 3. Save part metadata for App.tsx integration
  const metaOutFile = path.join(__dirname, '../data/sphu/new_parts_meta.json');
  fs.writeFileSync(metaOutFile, JSON.stringify(partMetadata, null, 2), 'utf8');
  console.log(`Saved metadata to ${metaOutFile}`);

  console.log('\n=== IMPORT COMPLETE ===');
}

run().catch(console.error);
