const fs = require('fs');

function fixPdfSettings() {
    const filePath = 'src/lib/pdf.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(/if \(settings\?\.bankName\)/g, "if (settings?.companyName)");
    content = content.replace(/settings\.bankName/g, "settings.companyName");
    
    content = content.replace(/if \(settings\?\.iban\)/g, "if (settings?.companyIban)");
    content = content.replace(/settings\.iban/g, "settings.companyIban");

    content = content.replace(/if \(settings\?\.bic\)/g, "if (settings?.companyBic)");
    content = content.replace(/settings\.bic/g, "settings.companyBic");
    
    content = content.replace(/if \(settings\?\.vatId\) doc\.text\(\`USt-IdNr\.: \$\{settings\.vatId\}\`, 170, pageHeight - 28\);\n    if \(settings\?\.taxId\) doc\.text\(\`St\.-Nr\.: \$\{settings\.taxId\}\`, 170, pageHeight - 24\);\n    if \(settings\?\.commercialRegister\) doc\.text\(\`Register: \$\{settings\.commercialRegister\}\`, 170, pageHeight - 20\);/g, 
        "if (settings?.companyTaxId) doc.text(`St.-Nr.: ${settings.companyTaxId}`, 170, pageHeight - 24);");

    fs.writeFileSync(filePath, content, 'utf8');
}

fixPdfSettings();
