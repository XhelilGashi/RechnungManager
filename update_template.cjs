const fs = require('fs');

function updateLiveEditor() {
    const filePath = 'src/components/LiveInvoiceEditor.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Add getTemplateClasses function inside LiveInvoiceEditor
    const fnSearch = `  const getPreviewInvoice = (): Invoice => {`;
    const fnReplace = `  const getTemplateClasses = (template: string) => {
    switch (template) {
      case 'elegant': return 'font-serif text-slate-900 border-none rounded-none shadow-xl';
      case 'modern': return 'font-sans text-slate-800 border-t-[12px] border-blue-600 rounded-none shadow-xl';
      case 'minimal': return 'font-sans font-light text-gray-800 border-none shadow-md rounded-none bg-white';
      case 'bold': return 'font-sans font-extrabold text-black border-4 border-black rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] uppercase tracking-tight';
      default: return 'font-sans text-slate-800 rounded-sm shadow-2xl';
    }
  };

  const getPreviewInvoice = (): Invoice => {`;

    content = content.replace(fnSearch, fnReplace);

    // 2. Modify container
    const containerSearch = `<div className="bg-white shadow-2xl rounded-sm w-full max-w-[210mm] min-h-[297mm] p-[20mm] relative">`;
    const containerReplace = `<div className={\`bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] relative transition-all duration-500 \${getTemplateClasses(formData.template || settings?.invoiceTemplate || 'standard')}\`}>`;

    content = content.replace(containerSearch, containerReplace);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated LiveEditor for template styles");
}

function updatePDFGenerator() {
    const filePath = 'src/lib/pdf.ts';
    let content = fs.readFileSync(filePath, 'utf8');

    const searchStr = `  const primaryRgb = hexToRgb(primaryColor);`;
    const replaceStr = `  const template = invoice.template || settings?.invoiceTemplate || 'standard';
  const primaryRgb = hexToRgb(primaryColor);
  
  const baseFont = template === 'elegant' ? 'times' : 'helvetica';
  
  if (template === 'modern') {
     doc.setFillColor(...primaryRgb);
     doc.rect(0, 0, pageWidth, 5, 'F');
  }
  if (template === 'bold') {
     doc.setDrawColor(0, 0, 0);
     doc.setLineWidth(1.5);
     doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  }`;

    // replace in generateInvoicePDF
    const invoiceFuncStart = `export function generateInvoicePDF(invoice: Invoice, customer: Customer, logo?: string | null, settings?: AppSettings, action: 'save' | 'print' | 'blob' = 'save', project?: import('../types').Project) {`;
    
    // We will do a generic replacement after replacing the exact block via split
    const parts = content.split("export function generateInvoicePDF");
    if (parts.length > 1) {
        let pdfFunc = parts[1];
        pdfFunc = pdfFunc.replace(searchStr, replaceStr);
        // Replace all "helvetica" with baseFont inside pdfFunc
        // Actually, just let's manually write "baseFont" in place of "helvetica"
        pdfFunc = pdfFunc.replace(/"helvetica"/g, "baseFont");
        
        content = parts[0] + "export function generateInvoicePDF" + pdfFunc;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated PDF Generator for template styles");
    } else {
        console.log("generateInvoicePDF not found");
    }
}

updateLiveEditor();
updatePDFGenerator();
