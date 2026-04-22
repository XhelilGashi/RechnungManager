const fs = require('fs');

function updateLiveEditor() {
    const filePath = 'src/components/LiveInvoiceEditor.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add Rnd import
    if (!content.includes('import { Rnd } from \'react-rnd\';')) {
        content = content.replace("import { useAppContext }", "import { Rnd } from 'react-rnd';\nimport { useAppContext }");
    }
    
    // 2. Add useRef and state for container size
    const containerStateRepl = `  const [containerSize, setContainerSize] = React.useState({ width: 794, height: 1123 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
        setContainerSize({
            width: entries[0].contentRect.width,
            height: entries[0].contentRect.height
        });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
    
  const getPreviewInvoice = (): Invoice => {`;
    content = content.replace("  const getPreviewInvoice = (): Invoice => {", containerStateRepl);

    // 3. Add ref to container
    content = content.replace(
        `<div className={\`bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] relative transition-all duration-500 \${getTemplateClasses(formData.template || settings?.invoiceTemplate || 'standard')}\`}>`,
        `<div ref={containerRef} className={\`bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] relative transition-all duration-500 \${getTemplateClasses(formData.template || settings?.invoiceTemplate || 'standard')}\`}>`
    );

    // 4. Replace Editable Logo Container
    const logoSearchRegex = /\{\/\* Editable Logo Container \*\/\}\s*\{logo && \([\s\S]*?\}\s*\)\}/m;
    const rndReplace = `{/* Editable Draggable & Resizable Logo */}
          {logo && (
            <Rnd
              bounds="parent"
              className="group z-50 hover:bg-black/5 rounded-sm transition-colors border border-transparent hover:border-blue-400 hover:border-dashed"
              size={{
                  width: \`\${settings?.logoWidthPercent ?? 20}%\`,
                  height: 'auto'
              }}
              position={{
                  x: ((settings?.logoXPercent ?? 75) / 100) * containerSize.width,
                  y: ((settings?.logoYPercent ?? 5) / 100) * containerSize.height
              }}
              onDragStop={(e, d) => {
                  setSettings({
                      ...(settings || {}),
                      language: settings?.language || 'de',
                      currency: settings?.currency || 'EUR',
                      dateFormat: settings?.dateFormat || 'DD.MM.YYYY',
                      darkMode: settings?.darkMode || false,
                      primaryColor: settings?.primaryColor || '#2563EB',
                      invoiceTemplate: settings?.invoiceTemplate || 'standard',
                      invoiceColor: settings?.invoiceColor || '#2563EB',
                      logoXPercent: (d.x / containerSize.width) * 100,
                      logoYPercent: (d.y / containerSize.height) * 100
                  });
              }}
              onResizeStop={(e, dir, ref, delta, position) => {
                  setSettings({
                      ...(settings || {}),
                      language: settings?.language || 'de',
                      currency: settings?.currency || 'EUR',
                      dateFormat: settings?.dateFormat || 'DD.MM.YYYY',
                      darkMode: settings?.darkMode || false,
                      primaryColor: settings?.primaryColor || '#2563EB',
                      invoiceTemplate: settings?.invoiceTemplate || 'standard',
                      invoiceColor: settings?.invoiceColor || '#2563EB',
                      logoXPercent: (position.x / containerSize.width) * 100,
                      logoYPercent: (position.y / containerSize.height) * 100,
                      logoWidthPercent: (parseFloat(ref.style.width) / containerSize.width) * 100
                  });
              }}
            >
              <div className="absolute -inset-1 border-2 border-blue-500 opacity-0 group-hover:opacity-100 pointer-events-none rounded transition-opacity">
                {/* Resize handle visual cues */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              <img src={logo} className="w-full h-full object-contain cursor-move" draggable="false" alt="Company Logo" />
            </Rnd>
          )}`;

    content = content.replace(logoSearchRegex, rndReplace);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated LiveInvoiceEditor.tsx for Rnd");
}

function updatePDFGenerator() {
    const filePath = 'src/lib/pdf.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    const searchLogoRightBlock = `  if (logo) {
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

    const rndReplace = `  if (logo) {
    try {
      const props = doc.getImageProperties(logo);
      const aspect = props.height / props.width;
      
      const xPercent = settings?.logoXPercent ?? 75;
      const yPercent = settings?.logoYPercent ?? 5;
      const wPercent = settings?.logoWidthPercent ?? 20;

      const logoX = (xPercent / 100) * pageWidth;
      const logoY = (yPercent / 100) * pageHeight;
      const logoWidth = (wPercent / 100) * pageWidth;
      const logoHeight = logoWidth * aspect;

      doc.addImage(logo, logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');

      // Adjust text if logo is overlapping the right column area
      if (logoX + logoWidth > pageWidth - 80 && logoY < 60) {
         companyY = Math.max(companyY, logoY + logoHeight + 7);
      }
    } catch(e) {
      // Fallback
      doc.addImage(logo, pageWidth - 60, companyY, 40, 15, undefined, 'FAST');
      companyY += 22;
    }
  }`;

    content = content.replace(searchLogoRightBlock, rndReplace);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated pdf.ts for Rnd percentages");
}

updateLiveEditor();
updatePDFGenerator();
