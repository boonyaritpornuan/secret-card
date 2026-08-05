const fs = require('fs');
const path = require('path');

const SRC = 'C:\\Users\\boony\\AppData\\Local\\Temp\\opencode\\comwork\\full700.txt';
const OUT_DIR = 'C:\\Users\\boony\\OneDrive\\เอกสาร\\GitHub\\FlashTesting\\COM\\output';

const PUA_MAP = { 0xF70A: '\u0E48', 0xF70B: '\u0E49', 0xF70C: '\u0E4A', 0xF70D: '\u0E4B', 0xF70E: '\u0E4C' };

function decodePua(text) {
    let out = '';
    for (const c of text) {
        const cp = c.codePointAt(0);
        out += PUA_MAP[cp] || c;
    }
    return out
        .replace(/\u0E4D\u0E32/g, '\u0E33')
        .normalize('NFC');
}

function normalizeLine(line) {
    return line.trim()
        .replace(/^--\s*\d+\s*of\s+\d+\s*--$/, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseSection(block, topicName) {
    const lines = block.split('\n');
    let currentSection = topicName;
    const questions = [];
    let current = null;

    const flush = () => {
        if (current) {
            current.question = current.question.replace(/\s+/g, ' ').trim();
            for (const k of Object.keys(current.options)) {
                current.options[k] = current.options[k].replace(/\s+/g, ' ').trim();
            }
            let exp = current.explanation.replace(/\s+/g, ' ').trim();
            if (exp.endsWith(')') && !exp.includes('(')) exp = exp.slice(0, -1);
            current.explanation = exp.trim();
            questions.push(current);
        }
        current = null;
    };

    for (const rawLine of lines) {
        const line = rawLine.trim().replace(/\s+/g, ' ').replace(/^--\s*\d+\s*of\s+\d+\s*--$/, '').trim();
        if (!line) continue;

        const secMatch = line.match(/^ส่วนที่\s*\d+\s*:\s*(.*)$/);
        if (secMatch) {
            flush();
            currentSection = secMatch[1];
            continue;
        }

        if (/^คำชี้แจง/.test(line) || /^ข้อสอบความจำ/.test(line) || /^หัวข้อ/.test(line)) { flush(); continue; }

        const qMatch = line.match(/^(\d+)[\.\s]\s+(.*)$/);
        if (qMatch) {
            const isStart = !current || Object.keys(current.options).length > 0 || !!current.answer;
            if (isStart) {
                flush();
                current = {
                    id: parseInt(qMatch[1]),
                    context: currentSection,
                    question: qMatch[2],
                    options: {},
                    answer: '',
                    answer_text: '',
                    explanation: ''
                };
                continue;
            }
        }

        if (current) {
            const optMatch = line.match(/^([ก-ง])[\.\s]\s*(.*)$/);
            if (optMatch && !current.answer) {
                const parts = [...line.matchAll(/([ก-ง])[\.\s]\s*/g)];
                for (let p = 0; p < parts.length; p++) {
                    const letter = parts[p][1];
                    const segStart = parts[p].index + parts[p][0].length;
                    const segEnd = p + 1 < parts.length ? parts[p + 1].index : line.length;
                    current.options[letter] = (current.options[letter] ? current.options[letter] + ' ' : '') + line.slice(segStart, segEnd).trim();
                }
                continue;
            }

            const ansMatch = line.match(/^เฉลย:\s*([ก-ง])[\.\s:]*(.*)$/);
            if (ansMatch) {
                current.answer = ansMatch[1];
                current.answer_text = current.options[ansMatch[1]] || '';
                current.explanation = ansMatch[2].replace(/^\((.*)$/, '$1');
                continue;
            }

            const keys = Object.keys(current.options);
            if (keys.length === 0) current.question += ' ' + line;
            else if (current.answer) current.explanation += ' ' + line;
            else current.options[keys[keys.length - 1]] += ' ' + line;
        }
    }
    flush();
    return questions.map((q, i) => ({ ...q, id: i + 1 }));
}

const topics = [
    { name: 'พ.ร.บ. คอมพิวเตอร์ และกฎหมายที่เกี่ยวข้อง', mark: 'ข้อสอบความจำ: พ.ร.บ. คอมพิวเตอร์' },
    { name: 'ระบบสารสนเทศ การวิเคราะห์ระบบ และฐานข้อมูล', mark: 'ข้อสอบความจำ: ระบบสารสนเทศ' },
    { name: 'ภาษาคอมพิวเตอร์ และการเขียนโปรแกรม', mark: 'ข้อสอบความจำ: ภาษาคอมพิวเตอร์' },
    { name: 'การติดตั้งและบำรุงรักษาคอมพิวเตอร์ส่วนบุคคล', mark: 'ข้อสอบความจำ: การติดตั้งและบำรุงรักษา' },
    { name: 'ระบบปฏิบัติการและซอฟต์แวร์สำเร็จรูป', mark: 'ข้อสอบความจำ: ระบบปฏิบัติการและซอฟต์แวร์' },
    { name: 'ระบบเครือข่ายคอมพิวเตอร์ และอุปกรณ์ที่เกี่ยวข้อง', mark: 'ข้อสอบความจำ: ระบบเครือข่ายคอมพิวเตอร์' },
    { name: 'ความมั่นคงปลอดภัยสารสนเทศ และการบริหารความเสี่ยง', mark: 'ข้อสอบความจำ: ความมั่นคงปลอดภัย' }
];

let raw = fs.readFileSync(SRC, 'utf8');
raw = decodePua(raw)
    .replace(/^--\s*\d+\s*of\s+\d+\s*--$/gm, '')
    .replace(/(?<=[\u0E00-\u0E7F]) (?=[\u0E00-\u0E7F])/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let total = 0;
const warnings = [];

const headerStarts = [];
{
    const lines = raw.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (/^ข้อสอบความจำ/.test(lines[i].trim())) headerStarts.push(i);
    }
}

if (headerStarts.length !== topics.length) {
    console.log('Header matches:', headerStarts.length);
}

for (let t = 0; t < topics.length; t++) {
    const topic = topics[t];
    const startLine = headerStarts[t];
    const endLine = t + 1 < headerStarts.length ? headerStarts[t + 1] : null;
    if (startLine === undefined) { warnings.push('HEADER NOT FOUND: ' + topic.name); continue; }

    const allLines = raw.split('\n');
    const blockLines = endLine !== null ? allLines.slice(startLine, endLine) : allLines.slice(startLine);
    while (blockLines.length && (/^ข้อสอบความจำ/.test(blockLines[0].trim()) || !blockLines[0].trim() || /\(\d+\s*ข้อ\)/.test(blockLines[0]) && /^ส่วนที่/.test(blockLines[1]?.trim() || ''))) blockLines.shift();
    while (blockLines.length && (/^ส่วนที่/.test(blockLines[0].trim()) || /^คำชี้แจง/.test(blockLines[0].trim()) || /^ข้อสอบความจำ/.test(blockLines[0].trim()) || !blockLines[0].trim())) blockLines.shift();
    const block = blockLines.join('\n');

    const questions = parseSection(block, topic.name);
    total += questions.length;

    const bad = questions.filter(q => !q.answer || Object.keys(q.options).length !== 4);
    if (bad.length) warnings.push(`${topic.name}: ${bad.length} ข้อไม่มีคำตอบ/ตัวเลือกไม่ครบ (${bad.slice(0, 8).map(q => q.id).join(',')})`);

    const outFile = path.join(OUT_DIR, topic.name + '.json');
    fs.writeFileSync(outFile, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`OK ${topic.name}: ${questions.length} ข้อ -> ${path.basename(outFile)}`);
}

console.log('TOTAL:', total);
console.log('WARNINGS:', warnings.length ? warnings.join('\n') : 'none');
