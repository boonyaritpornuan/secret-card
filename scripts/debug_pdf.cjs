const pdfParse = require('pdf-parse');
console.log('Type of pdfParse:', typeof pdfParse);
if (typeof pdfParse === 'object') {
    console.log('Keys:', Object.keys(pdfParse));
    console.log('Default type:', typeof pdfParse.default);
}
