const test1 = '1 1   1 2   1 3';
const test2 = '1   2   3   4   5   6   7   8   9   10';
const norm = s => s.replace(/(\d) (\d)/g, '$1$2').replace(/\s+/g, ' ').trim();
console.log('test1:', norm(test1));
console.log('test2:', norm(test2));
