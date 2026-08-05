const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser();
const pdfPath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ/พรบ ป้องกันและบรรเทาสาธารณภัย.pdf';

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    
    // Sort text blocks from first page
    const page = pdfData.Pages[0];
    const texts = page.Texts.map(t => ({
        text: decodeURIComponent(t.R[0].T),
        x: t.x,
        y: t.y
    }));
    
    // Sort by Y first, then X
    texts.sort((a, b) => {
        if (Math.abs(a.y - b.y) < 0.5) {
            return a.x - b.x;
        }
        return a.y - b.y;
    });
    
    // Group into lines
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
    
    console.log("Reconstructed Text for Page 1:");
    console.log(lines.join('\n'));
});

pdfParser.loadPDF(pdfPath);
