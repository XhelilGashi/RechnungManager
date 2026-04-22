const fs = require('fs');

function replaceFooter() {
    const filePath = 'src/lib/pdf.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace first footer (Offer)
    content = content.replace(
        'doc.text("Bankverbindung:", 130, pageHeight - 28);\n    if (settings?.companyIban) doc.text(`IBAN: ${settings.companyIban}`, 130, pageHeight - 24);\n    if (settings?.companyBic) doc.text(`BIC: ${settings.companyBic}`, 130, pageHeight - 20);\n    if (settings?.companyTaxId) doc.text(`St.-Nr.: ${settings.companyTaxId}`, 130, pageHeight - 16);\n    \n    // Column 4\n    doc.text(`Seite ${i} von ${pageCount}`, pageWidth - 20, pageHeight - 15, { align: \'right\' });',
        `if (settings?.bankName) doc.text(\`Bank: \${settings.bankName}\`, 130, pageHeight - 28);\n    if (settings?.iban) doc.text(\`IBAN: \${settings.iban}\`, 130, pageHeight - 24);\n    if (settings?.bic) doc.text(\`BIC: \${settings.bic}\`, 130, pageHeight - 20);\n    \n    // Column 4\n    if (settings?.vatId) doc.text(\`USt-IdNr.: \${settings.vatId}\`, 170, pageHeight - 28);\n    if (settings?.taxId) doc.text(\`St.-Nr.: \${settings.taxId}\`, 170, pageHeight - 24);\n    if (settings?.commercialRegister) doc.text(\`Register: \${settings.commercialRegister}\`, 170, pageHeight - 20);\n\n    doc.text(\`Seite \${i} von \${pageCount}\`, pageWidth - 20, pageHeight - 10, { align: 'right' });`
    );

    // Replace second footer (Invoice)
    content = content.replace(
        'doc.text("Bankverbindung:", 130, pageHeight - 28);\n    if (settings?.companyIban) doc.text(`IBAN: ${settings.companyIban}`, 130, pageHeight - 24);\n    if (settings?.companyBic) doc.text(`BIC: ${settings.companyBic}`, 130, pageHeight - 20);\n    if (settings?.companyTaxId) doc.text(`St.-Nr.: ${settings.companyTaxId}`, 130, pageHeight - 16);\n    \n    // Column 4\n    doc.text(`Seite ${i} von ${pageCount}`, pageWidth - 20, pageHeight - 15, { align: \'right\' });',
        `if (settings?.bankName) doc.text(\`Bank: \${settings.bankName}\`, 130, pageHeight - 28);\n    if (settings?.iban) doc.text(\`IBAN: \${settings.iban}\`, 130, pageHeight - 24);\n    if (settings?.bic) doc.text(\`BIC: \${settings.bic}\`, 130, pageHeight - 20);\n    \n    // Column 4\n    if (settings?.vatId) doc.text(\`USt-IdNr.: \${settings.vatId}\`, 170, pageHeight - 28);\n    if (settings?.taxId) doc.text(\`St.-Nr.: \${settings.taxId}\`, 170, pageHeight - 24);\n    if (settings?.commercialRegister) doc.text(\`Register: \${settings.commercialRegister}\`, 170, pageHeight - 20);\n\n    doc.text(\`Seite \${i} von \${pageCount}\`, pageWidth - 20, pageHeight - 10, { align: 'right' });`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced block");
}

replaceFooter();
