const fs = require('fs');

function rewritePdfHeaders() {
    const filePath = 'src/lib/pdf.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. GENERATE OFFER PDF REWRITE
    // Find Logo to Intro Text
    const offerLogoStart = content.indexOf('  // Logo top right\n  if (logo) {');
    const offerIntroStart = content.indexOf('  // --- INTRO TEXT ---', offerLogoStart);
    
    if (offerLogoStart !== -1 && offerIntroStart !== -1) {
        const replacement = `  // --- COMPANY DATA (Right aligned under logo) ---
  const companyRightX = pageWidth - 20;
  let companyY = 20;

  if (logo) {
    doc.addImage(logo, pageWidth - 60, companyY, 40, 15, undefined, 'FAST');
    companyY += 22;
  }
  
  const hasCompanyData = settings?.companyName || settings?.companyStreet || settings?.companyEmail || settings?.companyPhone;
  if (!hasCompanyData) {
    doc.setFontSize(8);
    doc.setTextColor(200, 100, 0); // Amber warning
    doc.text("Bitte Firmendaten in Einstellungen ausfüllen", companyRightX, companyY, { align: "right" });
    companyY += 5;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    if (settings?.companyName) {
      doc.setFont("helvetica", "bold");
      doc.text(settings.companyName, companyRightX, companyY, { align: "right" });
      companyY += 5;
    }
    doc.setFont("helvetica", "normal");
    if (settings?.companyStreet) {
      doc.text(settings.companyStreet, companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
    if (settings?.companyZip || settings?.companyCity) {
      doc.text(\`\${settings?.companyZip || ""} \${settings?.companyCity || ""}\`.trim(), companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
    companyY += 2;
    doc.setTextColor(100, 100, 100);
    if (settings?.companyEmail) {
      doc.text(settings.companyEmail, companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
    if (settings?.companyPhone) {
      doc.text(\`Tel: \${settings.companyPhone}\`, companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
    if (settings?.companyWebsite) {
      doc.text(settings.companyWebsite, companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
  }

  // --- CUSTOMER SECTION ---
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(customer.companyName || customer.name || "", 20, currentY);
  currentY += 5;
  
  doc.setFont("helvetica", "normal");
  if (customer.firstName || customer.lastName) {
    doc.text([customer.firstName, customer.lastName].filter(Boolean).join(" "), 20, currentY);
    currentY += 5;
  }
  if (customer.street) {
    doc.text(\`\${customer.street} \${customer.houseNumber || ""}\`.trim(), 20, currentY);
    currentY += 5;
  }
  if (customer.zipCode || customer.city) {
    doc.text(\`\${customer.zipCode || ""} \${customer.city || ""}\`.trim(), 20, currentY);
    currentY += 5;
  }
  if (customer.country) {
    doc.text(customer.country, 20, currentY);
    currentY += 5;
  }

  // --- INVOICE DETAILS SECTION (Moved to Left Column) ---
  currentY += 10;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryRgb);
  doc.text("ANGEBOT", 20, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Angebotsnr.:", 20, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(offer.number || "", 55, currentY);
  
  currentY += 5;
  doc.setTextColor(100, 100, 100);
  doc.text("Datum:", 20, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(formatDate(offer.date, settings?.dateFormat), 55, currentY);
  
  currentY = Math.max(companyY + 15, currentY + 15);
`;
        content = content.substring(0, offerLogoStart) + replacement + content.substring(offerIntroStart);
    }


    // 2. GENERATE INVOICE PDF REWRITE
    const invLogoStart = content.indexOf('  // Logo top right\n  if (logo) {', offerLogoStart + 1000);
    const invIntroStart = content.indexOf('  // --- INTRO TEXT ---', invLogoStart);

    if (invLogoStart !== -1 && invIntroStart !== -1) {
        const replacement = `  // --- COMPANY DATA (Right aligned under logo) ---
  const companyRightX = pageWidth - 20;
  let companyY = 20;

  if (logo) {
    doc.addImage(logo, pageWidth - 60, companyY, 40, 15, undefined, 'FAST');
    companyY += 22;
  }
  
  const hasCompanyData = settings?.companyName || settings?.companyStreet || settings?.companyEmail || settings?.companyPhone;
  if (!hasCompanyData) {
    doc.setFontSize(8);
    doc.setTextColor(200, 100, 0); // Amber warning
    doc.text("Bitte Firmendaten in Einstellungen ausfüllen", companyRightX, companyY, { align: "right" });
    companyY += 5;
  } else {
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    if (settings?.companyName) {
      doc.setFont("helvetica", "bold");
      doc.text(settings.companyName, companyRightX, companyY, { align: "right" });
      companyY += 5;
    }
    doc.setFont("helvetica", "normal");
    if (settings?.companyStreet) {
      doc.text(settings.companyStreet, companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
    if (settings?.companyZip || settings?.companyCity) {
      doc.text(\`\${settings?.companyZip || ""} \${settings?.companyCity || ""}\`.trim(), companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
    companyY += 2;
    doc.setTextColor(100, 100, 100);
    if (settings?.companyEmail) {
      doc.text(settings.companyEmail, companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
    if (settings?.companyPhone) {
      doc.text(\`Tel: \${settings.companyPhone}\`, companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
    if (settings?.companyWebsite) {
      doc.text(settings.companyWebsite, companyRightX, companyY, { align: "right" });
      companyY += 4;
    }
  }

  // --- CUSTOMER SECTION ---
  currentY = 45;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text(customer.companyName || customer.name || "", 20, currentY);
  currentY += 5;
  
  doc.setFont("helvetica", "normal");
  if (customer.firstName || customer.lastName) {
    doc.text([customer.firstName, customer.lastName].filter(Boolean).join(" "), 20, currentY);
    currentY += 5;
  }
  if (customer.street) {
    doc.text(\`\${customer.street} \${customer.houseNumber || ""}\`.trim(), 20, currentY);
    currentY += 5;
  }
  if (customer.zipCode || customer.city) {
    doc.text(\`\${customer.zipCode || ""} \${customer.city || ""}\`.trim(), 20, currentY);
    currentY += 5;
  }
  if (customer.country) {
    doc.text(customer.country, 20, currentY);
    currentY += 5;
  }

  // --- INVOICE DETAILS SECTION (Moved to Left Column) ---
  currentY += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryRgb);

  let title = "RECHNUNG";
  if (invoice.type === 'Teilrechnung') {
    title = \`TEILRECHNUNG \${invoice.partialInvoiceNumber || ''}\`.trim();
  } else if (invoice.type === 'Schlussrechnung') {
    title = "SCHLUSSRECHNUNG";
    if (invoice.partialInvoiceNumber) title += \` \${invoice.partialInvoiceNumber}\`;
  }
  
  // Left-align the title
  doc.text(title, 20, currentY);

  currentY += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Rechnungs-Nr.:", 20, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(invoice.number || "", 55, currentY);
  
  currentY += 5;
  doc.setTextColor(100, 100, 100);
  doc.text("Datum:", 20, currentY);
  doc.setTextColor(0, 0, 0);
  doc.text(formatDate(invoice.date, settings?.dateFormat), 55, currentY);

  if (invoice.deliveryDate) {
    currentY += 5;
    doc.setTextColor(100, 100, 100);
    doc.text("Leistungsdatum:", 20, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text(formatDate(invoice.deliveryDate, settings?.dateFormat), 55, currentY);
  }
  
  if (invoice.dueDate) {
    currentY += 5;
    doc.setTextColor(100, 100, 100);
    doc.text("Fälligkeit:", 20, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text(formatDate(invoice.dueDate, settings?.dateFormat), 55, currentY);
  }

  if (invoice.referenceNumber) {
    currentY += 5;
    doc.setTextColor(100, 100, 100);
    doc.text("Referenz-Nr.:", 20, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.referenceNumber, 55, currentY);
  }

  if (project?.name) {
    currentY += 5;
    doc.setTextColor(100, 100, 100);
    doc.text("Projekt:", 20, currentY);
    doc.setTextColor(0, 0, 0);
    doc.text(project.name.length > 35 ? project.name.substring(0, 32) + "..." : project.name, 55, currentY);
  }

  if (invoice.servicePeriodStart && invoice.servicePeriodEnd) {
    currentY += 5;
    doc.setTextColor(100, 100, 100);
    doc.text("Zeitraum:", 20, currentY);
    doc.setTextColor(0, 0, 0);
    const dateStr = \`\${formatDate(invoice.servicePeriodStart, settings?.dateFormat)} - \${formatDate(invoice.servicePeriodEnd, settings?.dateFormat)}\`;
    doc.text(dateStr, 55, currentY);
  }

  currentY = Math.max(companyY + 15, currentY + 15);
`;

        content = content.substring(0, invLogoStart) + replacement + content.substring(invIntroStart);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully rewrote headers");
}

rewritePdfHeaders();
