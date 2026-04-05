import fs from 'fs';
const text = fs.readFileSync('build_log.txt', 'utf8');
console.log(text.replace(/\x1b\[.*?m/g, ''));
