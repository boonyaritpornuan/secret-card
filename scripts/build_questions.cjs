const fs = require('fs');
const path = require('path');

// Aggregates the raw flashcard chapter files (data/paph/chapters/*.json)
// into a single JSON bundle (src/questions.json) consumed by the app.

const chaptersDir = path.join(__dirname, '../data/paph/chapters');
const outputFile = path.join(__dirname, '../src/questions.json');

const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));

const bundle = {};
let total = 0;

for (const file of files) {
  const key = file.replace('.json', '');
  const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
  bundle[key] = content;
  total += content.length;
}

fs.writeFileSync(outputFile, JSON.stringify(bundle, null, 2), 'utf8');
console.log(`Built src/questions.json with ${files.length} chapters, ${total} cards.`);