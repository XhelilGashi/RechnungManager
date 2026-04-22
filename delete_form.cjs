const fs = require('fs');

const path = 'src/pages/Rechnungen.tsx';
let content = fs.readFileSync(path, 'utf8');

const strToFind = '      {isCreating && (\n        <div className="bg-card shadow-md border border-border';
const strToEnd = '      {!isCreating && (\n        <div className="bg-card shadow-sm hover:shadow-md';

const startIndex = content.indexOf(strToFind);
const endIndex = content.indexOf(strToEnd);

if (startIndex === -1) {
  console.log("Could not find start block");
  process.exit(1);
}
if (endIndex === -1) {
  console.log("Could not find end block");
  process.exit(1);
}

content = content.substring(0, startIndex) + content.substring(endIndex);

fs.writeFileSync(path, content, 'utf8');
console.log("Deleted old form block");
