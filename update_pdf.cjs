const fs = require('fs');

function addOwnerToPdf() {
    const filePath = 'src/lib/pdf.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    const replaceBlock = `    if (settings?.companyName) {
      doc.setFont("helvetica", "bold");
      doc.text(settings.companyName, companyRightX, companyY, { align: "right" });
      companyY += 5;
    }
    doc.setFont("helvetica", "normal");
    if (settings?.companyOwnerFirstName || settings?.companyOwnerLastName) {
      const ownerName = [settings?.companyOwnerFirstName, settings?.companyOwnerLastName].filter(Boolean).join(" ");
      doc.setTextColor(100, 100, 100);
      doc.text(\`Inh.: \${ownerName}\`, companyRightX, companyY, { align: "right" });
      doc.setTextColor(0, 0, 0);
      companyY += 4;
    }
    if (settings?.companyStreet) {`;

    const searchBlock = `    if (settings?.companyName) {
      doc.setFont("helvetica", "bold");
      doc.text(settings.companyName, companyRightX, companyY, { align: "right" });
      companyY += 5;
    }
    doc.setFont("helvetica", "normal");
    if (settings?.companyStreet) {`;

    // split and join because it exists twice (offer & invoice)
    if (content.includes(searchBlock)) {
        content = content.split(searchBlock).join(replaceBlock);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Successfully wrote PDF owner info updates");
    } else {
        console.log("Could not find blocks to replace.");
    }
}

addOwnerToPdf();
