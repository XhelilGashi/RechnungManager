const fs = require('fs');

function fixBankName() {
    const filePath = 'src/lib/pdf.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    const searchBlock = `    // Column 3
    if (settings?.companyName) doc.text(\`Bank: \${settings.companyName}\`, 130, pageHeight - 28);`;
    
    const replaceBlock = `    // Column 3
    if (settings?.companyBankName) doc.text(\`Bank: \${settings.companyBankName}\`, 130, pageHeight - 28);`;

    if (content.includes(searchBlock)) {
        content = content.split(searchBlock).join(replaceBlock);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Successfully fixed bank name in pdf");
    } else {
        console.log("Could not find block to replace.");
    }
}

fixBankName();
