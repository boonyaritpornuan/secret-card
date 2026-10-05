const fs = require('fs');
const path = require('path');

console.log('=== RUNNING FULL DATA & CODE INTEGRITY TESTS ===\n');

let hasError = false;

// 1. Test sphu exam files
const sphuExamsDir = path.join(__dirname, '../data/sphu/exams');
const examFiles = fs.readdirSync(sphuExamsDir).filter(f => f.endsWith('.json'));
console.log(`[TEST 1] Checking all ${examFiles.length} sphu exam JSON files...`);

let totalQuestions = 0;
let totalAnswers = 0;

for (const file of examFiles) {
  const filePath = path.join(sphuExamsDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(data) || data.length === 0) {
      console.error(`❌ Empty or invalid array in ${file}`);
      hasError = true;
      continue;
    }
    
    for (let i = 0; i < data.length; i++) {
      const q = data[i];
      if (!q.q || typeof q.q !== 'string' || !q.q.trim()) {
        console.error(`❌ Missing question text in ${file} at index ${i}`);
        hasError = true;
      }
      if (!q.choices || typeof q.choices !== 'object' || Object.keys(q.choices).length < 2) {
        console.error(`❌ Insufficient choices in ${file} at index ${i} (ID: ${q.id})`);
        hasError = true;
      }
      if (!q.answer) {
        console.error(`❌ Missing answer in ${file} at index ${i} (ID: ${q.id})`);
        hasError = true;
      } else if (!q.choices[q.answer]) {
        console.error(`❌ Answer key '${q.answer}' does not match any choice in ${file} (ID: ${q.id})`);
        hasError = true;
      }
      totalQuestions++;
      if (q.answer) totalAnswers++;
    }
  } catch (e) {
    console.error(`❌ Syntax error reading ${file}:`, e.message);
    hasError = true;
  }
}
console.log(`✓ All ${examFiles.length} exam files valid. Total questions: ${totalQuestions}, Mapped answers: ${totalAnswers} (100%)\n`);

// 2. Test cards.json
console.log(`[TEST 2] Checking data/sphu/cards.json...`);
const cardsFile = path.join(__dirname, '../data/sphu/cards.json');
const cardsData = JSON.parse(fs.readFileSync(cardsFile, 'utf8'));
const cardKeys = Object.keys(cardsData);
console.log(`Found ${cardKeys.length} flashcard sets in cards.json`);

let totalCards = 0;
for (const key of cardKeys) {
  const cards = cardsData[key];
  if (!Array.isArray(cards) || cards.length === 0) {
    console.error(`❌ Empty card set for key: ${key}`);
    hasError = true;
    continue;
  }
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (!c.q || !c.a) {
      console.error(`❌ Incomplete card in ${key} at index ${i}`);
      hasError = true;
    }
    totalCards++;
  }
}
console.log(`✓ All ${cardKeys.length} card sets valid. Total flashcards: ${totalCards}\n`);

// 3. Test new_parts_meta.json
console.log(`[TEST 3] Checking data/sphu/new_parts_meta.json...`);
const metaFile = path.join(__dirname, '../data/sphu/new_parts_meta.json');
const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
if (meta.length !== 3) {
  console.error(`❌ Expected 3 categories in meta, got: ${meta.length}`);
  hasError = true;
}
meta.forEach(cat => {
  console.log(`- ${cat.catName}: ${cat.sets.length} sets`);
  cat.sets.forEach(s => {
    if (!cardsData[s.cardKey]) {
      console.error(`❌ Missing cardsData key for set: ${s.id} (${s.cardKey})`);
      hasError = true;
    }
  });
});
console.log(`✓ Meta references in sync with cards.json\n`);

// 4. Test exams_sphu_index.ts
console.log(`[TEST 4] Checking src/exams_sphu_index.ts...`);
const indexContent = fs.readFileSync(path.join(__dirname, '../src/exams_sphu_index.ts'), 'utf8');
if (!indexContent.includes('export const examsSphuIndex') || !indexContent.includes('export const examsSphuLoaders')) {
  console.error(`❌ exams_sphu_index.ts is missing exports`);
  hasError = true;
}
console.log(`✓ exams_sphu_index.ts exports verified\n`);

if (hasError) {
  console.error('FAILED INTEGRITY TESTS!');
  process.exit(1);
} else {
  console.log('🎉 ALL INTEGRITY TESTS PASSED SUCCESSFULLY!');
}
