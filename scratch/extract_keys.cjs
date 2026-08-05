const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const inputDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ';
const outputDir = 'C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/scratch';
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

async function run() {
    let results = {};
    for (const file of files) {
        const filePath = path.join(inputDir, file);
        try {
            console.log(`Parsing ${file}...`);
            const pages = await parsePDF(filePath);
            
            // Collect page text that looks like answers
            let potentialAnswerPages = [];
            for (let i = 0; i < pages.length; i++) {
                const text = pages[i];
                const cleanText = text.replace(/\s+/g, ' ');
                // Check if page contains keywords or patterns of grid
                if (text.includes('เฉลย') || text.includes('Answer') || cleanText.match(/\b\d+\s+[ก-งa-d]\s+\d+/i) || cleanText.match(/1\s+[ก-งa-d]\s+2\s+[ก-งa-d]/i)) {
                    potentialAnswerPages.push({
                        pageNumber: i + 1,
                        text: text
                    });
                }
            }
            
            results[file] = {
                totalPages: pages.length,
                potentialAnswers: potentialAnswerPages,
                // also save last page text just in case
                lastPageText: pages[pages.length - 1]
            };
        } catch (e) {
            console.error(`Error parsing ${file}:`, e);
        }
    }
    
    fs.writeFileSync(path.join(outputDir, 'all_pdf_answers.json'), JSON.stringify(results, null, 2), 'utf8');
    console.log("Done extracting potential answers to scratch/all_pdf_answers.json");
}

run();
