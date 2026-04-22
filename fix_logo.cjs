const fs = require('fs');

function updateLiveEditor() {
    const filePath = 'src/components/LiveInvoiceEditor.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // Make logo container absolute so it doesn't push down the address block
    const searchBlock = `          {/* Editable Logo Container */}
          {logo && (
            <div className={\`w-full flex mb-12 group relative \${settings?.logoPosition === 'center' ? 'justify-center' : settings?.logoPosition === 'left' ? 'justify-start' : 'justify-end'}\`}>`;

    const replaceBlock = `          {/* Editable Logo Container */}
          {logo && (
            <div className={\`absolute top-[15mm] left-[20mm] right-[20mm] flex group z-20 \${settings?.logoPosition === 'center' ? 'justify-center' : settings?.logoPosition === 'left' ? 'justify-start' : 'justify-end'}\`}>`;

    content = content.replace(searchBlock, replaceBlock);
    
    // push down the customer address wrapper slightly if it collides? No, if it's absolute, it just floats above. We give the main content appropriate top padding so it doesn't collide with a normal sized logo. Wait, p-[20mm] is 20mm padding. Let's make main padding top 45mm, and address starts early? 
    // Actually the easiest is just letting the logo float at top-0 and address start.
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated LiveEditor logo wrapper");
}

function updatePDFLogic() {
    const filePath = 'src/lib/pdf.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    const searchLogoRightBlock = `  if (logo) {
    doc.addImage(logo, pageWidth - 60, companyY, 40, 15, undefined, 'FAST');
    companyY += 22;
  }`;

    const replaceBlock = `  if (logo) {
    try {
      const props = doc.getImageProperties(logo);
      const aspect = props.width / props.height;
      
      let logoHeight = (settings?.logoSize || 80) * 0.264583;
      let logoWidth = logoHeight * aspect;

      let logoX = pageWidth - 20 - logoWidth; // Default right
      if (settings?.logoPosition === 'left') {
        logoX = 20;
      } else if (settings?.logoPosition === 'center') {
        logoX = (pageWidth - logoWidth) / 2;
      }
      
      doc.addImage(logo, logoX, 15, logoWidth, logoHeight, undefined, 'FAST');
      
      // If right aligned, push company text down
      if (settings?.logoPosition !== 'left' && settings?.logoPosition !== 'center') {
         companyY = 15 + logoHeight + 7;
      }
    } catch(e) {
      // Fallback
      doc.addImage(logo, pageWidth - 60, companyY, 40, 15, undefined, 'FAST');
      companyY += 22;
    }
  }`;

    content = content.split(searchLogoRightBlock).join(replaceBlock);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated PDF logic");
}

updateLiveEditor();
updatePDFLogic();
