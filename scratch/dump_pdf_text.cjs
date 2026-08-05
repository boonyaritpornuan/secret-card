const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfPath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ/พรบ ป้องกันและบรรเทาสาธารณภัย.pdf';
const outputPath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/secret-card-นักวิเคราะห์นโยบายและแผน-2569/scratch/dump_pb.txt';

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    let fullText = '';
    
    for (let i = 0; i < pdfData.Pages.length; i++) {
        const page = pdfData.Pages[i];
        const texts = page.Texts.map(t => ({
            text: decodeURIComponent(t.R[0].T),
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
        
        fullText += `--- Page ${i + 1} ---\n` + lines.join('\n') + '\n';
    }
    
    fs.writeFileSync(outputPath, fullText, 'utf8');
    console.log("Saved PDF dump to scratch/dump_pb.txt");
});

pdfParser.loadPDF(pdfPath);
