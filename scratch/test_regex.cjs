const line = "1 .   ค   11 .   ง   21 .   ง   31 .   ข   41 .   ข";
const normLine = line.replace(/(\d)\s+(\d)/g, '$1$2').replace(/\s+/g, ' ').trim();
console.log("normLine:", normLine);

const ansMatchRegex = /(\d{1,3})\s*[\.\s]\s*([ก-ฮa-dA-D])/gi;
const matches = [];
let match;
while ((match = ansMatchRegex.exec(normLine)) !== null) {
    matches.push({
        num: parseInt(match[1]),
        ans: match[2]
    });
}
console.log("Matches found:", matches);
