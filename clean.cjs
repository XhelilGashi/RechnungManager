const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
code = code.replace(/\\`/g, '\`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('src/pages/Dashboard.tsx', code);
