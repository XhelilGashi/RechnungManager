import { Invoice, Customer, AppSettings, Offer } from "../types";
import html2pdf from "html2pdf.js";

function getClonedElement(originalElement: HTMLElement) {
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Copy input/textarea values because cloneNode(true) does not copy dynamic values
    const origInputs = originalElement.querySelectorAll('input, textarea, select');
    const cloneInputs = clone.querySelectorAll('input, textarea, select');
    origInputs.forEach((orig, index) => {
        const cl = cloneInputs[index] as any;
        if (orig.tagName === 'INPUT' && (orig as HTMLInputElement).type === 'checkbox') {
            cl.checked = (orig as HTMLInputElement).checked;
        } else {
            cl.value = (orig as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
        }
    });

    // Create an invisible container to hold the clone securely off-screen
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "-9999px"; // Render completely off-screen
    container.style.zIndex = "-9999";
    container.style.opacity = "1"; // Need opacity 1 for html2canvas
    container.style.pointerEvents = "none";
    
    // Strip unnecessary elements from clone
    const elementsToRemove = clone.querySelectorAll(
      'button, .resize-handle, .react-draggable-transparent-selection, .no-print, [data-html2canvas-ignore]'
    );
    elementsToRemove.forEach(el => el.remove());
    
    // Clean up visual helpers
    clone.style.transform = "none";
    clone.style.boxShadow = "none";
    clone.style.border = "none";
    clone.style.margin = "0";
    clone.style.padding = "0";
    // Important for multi-page to not have fixed heights
    clone.style.minHeight = "auto";
    clone.style.height = "auto";
    
    container.appendChild(clone);
    document.body.appendChild(container);

    return { clone, container };
}

function showGlobalLoader() {
    hideGlobalLoader(); // Ensure no duplicates
    
    const el = document.createElement("div");
    el.id = "global-pdf-loader";
    el.innerHTML = `
      <div style="position: fixed; inset: 0; background: rgba(255,255,255,0.7); z-index: 99999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
         <div style="background: white; padding: 24px 48px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-direction: column; align-items: center; gap: 16px;">
             <div style="width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top: 3px solid #3b82f6; border-radius: 50%; animation: pdf-spin 1s linear infinite;"></div>
             <style>@keyframes pdf-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
             <div style="font-weight: 600; color: #1e293b; font-family: system-ui, sans-serif;">Generiere PDF...</div>
         </div>
      </div>
    `;
    document.body.appendChild(el);
}

function hideGlobalLoader() {
    const el = document.getElementById("global-pdf-loader");
    if (el) el.remove();
}

export async function generateInvoicePDF(
  invoice: Invoice | Offer, 
  customer: Customer, 
  logo?: string | null, 
  settings?: AppSettings, 
  action: 'save' | 'print' | 'blob' = 'save',
  project?: any
): Promise<Blob | undefined> {
  
  const element = document.getElementById("invoice") || document.getElementById("invoice-preview-capture");
  
  if (!element) {
    console.error("Invoice element not found");
    alert("Fehler: Rechnungselement konnte nicht gefunden werden.");
    return;
  }

  if (action === 'print') {
     window.print();
     return;
  }

  showGlobalLoader();

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      let containerToRemove: HTMLElement | null = null;
      try {
        const { clone, container } = getClonedElement(element);
        containerToRemove = container;

        const opt = {
          margin: 0,
          filename: `${invoice.number || 'Rechnung'}.pdf`,
          image: { type: "jpeg" as const, quality: 1.0 },
          html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            // A4 mm relative to browser px parsing ensures scaling fits exactly 210mm
            windowWidth: 794 // 210mm @ 96 DPI
          },
          // Core pagebreak trigger relies natively on inline CSS
          pagebreak: { mode: ['css', 'legacy'] },
          jsPDF: { 
            unit: "mm" as const, 
            format: "a4" as const, 
            orientation: "portrait" as const 
          }
        };
        
        const worker = html2pdf().set(opt).from(clone).toPdf().get('pdf').then((pdf: any) => {
           const totalPages = pdf.internal.getNumberOfPages();
           for (let i = 1; i <= totalPages; i++) {
              pdf.setPage(i);
              pdf.setFontSize(8);
              pdf.setTextColor(150);
              pdf.text(`Seite ${i} / ${totalPages}`, pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 8, { align: 'center' });
           }
           return pdf;
        });
        
        const pdfDoc = await worker;
        if (action === 'blob') {
          const res = await pdfDoc.output('blob');
          resolve(res);
        } else {
          await pdfDoc.save(opt.filename);
          resolve(undefined);
        }
      } catch (error) {
        console.error("Failed to generate PDF", error);
        alert("Beim Erstellen der PDF ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
        reject(error);
      } finally {
        if (containerToRemove && containerToRemove.parentNode) {
          containerToRemove.parentNode.removeChild(containerToRemove);
        }
        hideGlobalLoader();
      }
    }, 100); 
  });
}

export const generateOfferPDF = generateInvoicePDF;
