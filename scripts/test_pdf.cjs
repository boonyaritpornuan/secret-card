const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:/Users/boony/OneDrive/เอกสาร/workspace/Exam_Prep_ปภ_นักวิเคราะห์นโยบายและแผน/ข้อสอบ/พรบ ป้องกันและบรรเทาสาธารณภัย.pdf';
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('C:/Users/boony/.gemini/antigravity-ide/brain/804e8a81-b0b4-4de2-8145-393aa163c023/scratch/test_pdf_output.txt', data.text, 'utf8');
    console.log('PDF text extracted. Length:', data.text.length);
    console.log('First 500 characters:');
    console.log(data.text.substring(0, 500));
}).catch(function(error) {
    console.error('Error parsing PDF:', error);
});
