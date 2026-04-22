import React from 'react';
import { Customer, Product, Project, AppSettings, Invoice } from '../types';
import { Plus, Trash2, X, Receipt, Save, Printer, Mail, Download, AlignLeft, AlignCenter, AlignRight, Minus, Lock, Unlock } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { useAppContext } from '../store/AppContext';
import { generateInvoicePDF } from '../lib/pdf';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceLayoutTemplate } from '../types';

export interface LiveInvoiceEditorProps {
  documentType?: 'invoice' | 'offer';
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSave: (e: React.FormEvent) => void;
  setIsCreating: (val: boolean) => void;
  totals: any;
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  showCustomerDropdown: boolean;
  setShowCustomerDropdown: (val: boolean) => void;
  selectCustomer: (customer: Customer) => void;
  handleItemChange: (index: number, field: string, value: any) => void;
  handleAddItem: () => void;
  removeItem: (index: number) => void;
  activeProductDropdown: number | null;
  setActiveProductDropdown: (val: number | null) => void;
  handleProductSelect: (index: number, product: Product) => void;
}

export function LiveInvoiceEditor({
  documentType = 'invoice',
  formData, setFormData, handleSave, setIsCreating, totals,
  customerSearch, setCustomerSearch, showCustomerDropdown, setShowCustomerDropdown, selectCustomer,
  handleItemChange, handleAddItem, removeItem, activeProductDropdown, setActiveProductDropdown, handleProductSelect
}: LiveInvoiceEditorProps) {
  const { customers, projects, products, logo, settings, setSettings, layoutTemplates, setLayoutTemplates, showToast } = useAppContext();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [zoom, setZoom] = React.useState(100);
  const [dragSnapX, setDragSnapX] = React.useState<number | null>(null);
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);

  const [activeSidebarTab, setActiveSidebarTab] = React.useState<'inhalt' | 'design'>('inhalt');

  const defaultLayout = {
    logo: { x: 550, y: 40, w: 200 },
    companyBlock: { x: 550, y: 140, w: 200 },
    customerBlock: { x: 40, y: 150, w: 300 },
    titleBox: { x: 40, y: 280, w: 300 },
    infoBox: { x: 550, y: 280, w: 200 },
    tableBox: { x: 40, y: 350, w: 714 },
    footerBox: { x: 40, y: 1050, w: 714 }
  };
  
  const layout = (settings as any)?.layoutConfig || defaultLayout;
  const updateLayout = (key: string, data: any) => {
    setSettings({
      ...settings,
      layoutConfig: {
        ...layout,
        [key]: { ...layout[key], ...data }
      }
    } as any);
  };

  // Template handling
  const handleSaveAsTemplate = () => {
     const name = prompt('Geben Sie einen Namen für diese Layout-Vorlage ein:');
     if (!name) return;
     const newTemplate: InvoiceLayoutTemplate = {
         id: uuidv4(),
         name,
         isDefault: layoutTemplates.length === 0,
         logoXPercent: settings?.logoXPercent,
         logoYPercent: settings?.logoYPercent,
         logoWidthPercent: settings?.logoWidthPercent,
         companyInfoXPercent: settings?.companyInfoXPercent,
         companyInfoYPercent: settings?.companyInfoYPercent,
         companyInfoScale: settings?.companyInfoScale,
         titlePos: settings?.titlePos,
         introPos: settings?.introPos,
         paymentPos: settings?.paymentPos,
         thanksPos: settings?.thanksPos,
         footerPos: settings?.footerPos,
         lockLogo: settings?.lockLogo,
         lockCompanyInfo: settings?.lockCompanyInfo,
         lockTitle: settings?.lockTitle,
         lockIntro: settings?.lockIntro,
         lockPayment: settings?.lockPayment,
         lockThanks: settings?.lockThanks,
         lockFooter: settings?.lockFooter,
     };
     setLayoutTemplates([...layoutTemplates, newTemplate]);
     showToast('Layout als Vorlage gespeichert.', 'success');
  };

  const applyTemplate = (templateId: string) => {
     if (!templateId) return;
     const t = layoutTemplates.find(x => x.id === templateId);
     if(!t) return;

     setSettings({
         ...settings!,
         logoXPercent: t.logoXPercent,
         logoYPercent: t.logoYPercent,
         logoWidthPercent: t.logoWidthPercent,
         companyInfoXPercent: t.companyInfoXPercent,
         companyInfoYPercent: t.companyInfoYPercent,
         companyInfoScale: t.companyInfoScale,
         titlePos: t.titlePos,
         introPos: t.introPos,
         paymentPos: t.paymentPos,
         thanksPos: t.thanksPos,
         footerPos: t.footerPos,
         lockLogo: t.lockLogo,
         lockCompanyInfo: t.lockCompanyInfo,
         lockTitle: t.lockTitle,
         lockIntro: t.lockIntro,
         lockPayment: t.lockPayment,
         lockThanks: t.lockThanks,
         lockFooter: t.lockFooter,
     });
     showToast('Layout-Vorlage geladen.', 'success');
  };

  const handleSetDefaultTemplate = (templateId: string) => {
     setLayoutTemplates(layoutTemplates.map(t => ({...t, isDefault: t.id === templateId})));
     showToast('Standard-Vorlage geändert.', 'success');
  };

  const handleDeleteTemplate = (templateId: string) => {
     if(confirm('Möchten Sie diese Layout-Vorlage wirklich löschen?')) {
        setLayoutTemplates(layoutTemplates.filter(t => t.id !== templateId));
     }
  };

  const toggleLock = (key: keyof AppSettings) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  React.useEffect(() => {
    // If opening a new invoice and there is a default template, apply it.
    if (!formData.id && layoutTemplates.length > 0) {
      const def = layoutTemplates.find(t => t.isDefault);
      if (def) {
         applyTemplate(def.id);
      }
    }
  }, [formData.id]); // Only run on mount or id change

  const activeTemplate = formData.template || settings?.invoiceTemplate || 'standard';

  const getTemplateClasses = (template: string) => {
    switch (template) {
      case 'elegant': return 'font-serif text-slate-900 border-none rounded-none shadow-xl';
      case 'modern': return 'font-sans text-slate-800 border-none rounded-none shadow-xl';
      case 'minimal': return 'font-sans font-light text-gray-800 border-none shadow-md rounded-none bg-white';
      case 'bold': return 'font-sans text-black border-4 rounded-none shadow-xl';
      case 'left': return 'font-sans text-slate-800 rounded-sm shadow-2xl';
      case 'center': return 'font-sans text-slate-800 rounded-sm shadow-2xl';
      case 'boxed': return 'font-sans text-slate-800 rounded-sm shadow-2xl';
      default: return 'font-sans text-slate-800 rounded-sm shadow-2xl';
    }
  };

  const [containerSize, setContainerSize] = React.useState({ width: 794, height: 1123 });
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
    
  const getPreviewInvoice = (): Invoice => {
    return {
      ...formData,
      id: formData.id || 'preview',
      number: formData.number || 'ENTWURF',
      subtotal: totals.subtotal,
      total: totals.total,
      vatAmount: totals.vatAmount,
      discountAmount: totals.discountAmount,
      calculatedItems: totals.calculatedItems
    } as Invoice;
  };

  const getMergedCustomer = () => {
    return customers.find(c => c.id === formData.customerId) || {
      id: 'preview',
      name: formData.companyName || formData.lastName || 'Kunde',
      companyName: formData.companyName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      street: formData.street,
      houseNumber: formData.houseNumber,
      zipCode: formData.zipCode,
      city: formData.city,
      email: '',
      phone: ''
    } as Customer;
  };

  
  const handleHeaderDrag = (e: any, d: any, id: string) => {
      setActiveDragId(id);
      const cw = containerSize.width;
      const center = cw / 2;
      const leftEdge = 40; // 20mm roughly
      const rightEdge = cw - 40;
      const thresh = 15;

      let snapX = null;
      
      // We calculate the center of the dragged element
      // Approximate width
      const elWidth = id === 'logo' ? (settings?.logoWidthPercent ? (settings.logoWidthPercent / 100) * cw : 150) : 250;
      
      const elCenter = d.x + (elWidth / 2);
      const elRight = d.x + elWidth;

      if (Math.abs(d.x - leftEdge) < thresh) {
          snapX = leftEdge;
      } else if (Math.abs(elCenter - center) < thresh) {
          snapX = center;
      } else if (Math.abs(elRight - rightEdge) < thresh) {
          snapX = rightEdge;
      }

      setDragSnapX(snapX);
  };

  const handleContentDrag = (e: any, d: any, id: string) => {
      setActiveDragId(id);
      const cw = containerSize.width;
      const center = cw / 2;
      const leftEdge = 40; 
      const rightEdge = cw - 40;
      const thresh = 15;

      let snapX = null;
      let approxWidth = 350;
      if (id === 'intro') approxWidth = 600;
      if (id === 'footer') approxWidth = cw - 80;

      const elCenter = d.x + (approxWidth / 2);
      const elRight = d.x + approxWidth;

      if (Math.abs(d.x - leftEdge) < thresh) snapX = leftEdge;
      else if (Math.abs(elCenter - center) < thresh) snapX = center;
      else if (Math.abs(elRight - rightEdge) < thresh) snapX = rightEdge;

      setDragSnapX(snapX);
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  const handleAction = async (action: 'print' | 'download' | 'email') => {
    const inv = getPreviewInvoice();
    const cust = getMergedCustomer();
    const proj = projects.find(p => p.id === inv.projectId);

    setIsGeneratingPdf(true);
    try {
      if (action === 'print') {
        await generateInvoicePDF(inv, cust, logo, settings, 'print', proj);
      } else if (action === 'download') {
        await generateInvoicePDF(inv, cust, logo, settings, 'save', proj);
      } else if (action === 'email') {
        await generateInvoicePDF(inv, cust, logo, settings, 'save', proj);
        const subject = encodeURIComponent(`${documentType === 'offer' ? 'Angebot' : 'Rechnung'} #${inv.number}`);
        const body = encodeURIComponent(
          `Guten Tag ${cust.firstName ? cust.firstName + ' ' + (cust.lastName || '') : (cust.name || '')},\n\n` +
          `anbei erhalten Sie ${documentType === 'offer' ? 'das Angebot' : 'die Rechnung'} ${inv.number} als PDF-Dokument.\n\n` +
          `Mit freundlichen Grüßen`
        );
        window.location.href = `mailto:${cust.email}?subject=${subject}&body=${body}`;
        showToast('PDF wurde generiert. Bitte fügen Sie es in Ihrem E-Mail-Programm an.', 'success');
      }
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden">
      {/* Action Header */}
      <div className="flex-none sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-slate-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-slate-800">{formData.id ? (documentType === 'offer' ? 'Angebot bearbeiten' : 'Rechnung bearbeiten') : (documentType === 'offer' ? 'Neues Angebot' : 'Neue Rechnung')}</h2>
        </div>
        <div className="flex gap-2 items-center">
          <div className="mr-2">
            <select
              value={formData.template || settings?.invoiceTemplate || 'standard'}
              onChange={(e) => setFormData({...formData, template: e.target.value})}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="standard">Standard</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimalistisch</option>
              <option value="elegant">Elegant</option>
              <option value="bold">Corporate (Fett)</option>
            </select>
          </div>
          {formData.customerId && (
            <>
              <button disabled={isGeneratingPdf} type="button" onClick={() => handleAction('print')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2" title="Drucken">
                <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Drucken</span>
              </button>
              <button disabled={isGeneratingPdf} type="button" onClick={() => handleAction('download')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2" title="PDF">
                <Download className="w-4 h-4" /> <span className="hidden sm:inline">{isGeneratingPdf ? 'Generiert...' : 'PDF'}</span>
              </button>
              <button disabled={isGeneratingPdf} type="button" onClick={() => handleAction('email')} className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors flex items-center gap-2" title="E-Mail">
                <Mail className="w-4 h-4" /> <span className="hidden sm:inline">E-Mail</span>
              </button>
              <div className="w-px h-6 bg-slate-200 self-center mx-1"></div>
            </>
          )}
          <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            Abbrechen
          </button>
          <button type="button" onClick={handleSave} className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 rounded-md shadow-sm transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> Speichern
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex flex-row-reverse overflow-hidden">
        
        {/* Right: A4 Preview Area */}
        <div className="flex-1 overflow-y-auto py-12 px-4 sm:px-8 flex flex-col items-center custom-scrollbar bg-slate-100/50">
          <div className="flex items-center gap-2 mb-6 w-[794px] max-w-full justify-between">
             <div className="flex items-center gap-2">
                <button type="button" onClick={() => setZoom(50)} className={`px-3 py-1 text-sm rounded border shadow-sm ${zoom === 50 ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>50%</button>
                <button type="button" onClick={() => setZoom(75)} className={`px-3 py-1 text-sm rounded border shadow-sm ${zoom === 75 ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>75%</button>
                <button type="button" onClick={() => setZoom(100)} className={`px-3 py-1 text-sm rounded border shadow-sm ${zoom === 100 ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>100%</button>
                <button type="button" onClick={() => setZoom(125)} className={`px-3 py-1 text-sm rounded border shadow-sm ${zoom === 125 ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>125%</button>
             </div>
             <div>
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm hover:bg-slate-50">
                  <input type="checkbox" checked={isEditMode} onChange={e => setIsEditMode(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                  Design bearbeiten
                </label>
             </div>
          </div>
          
          
          
          <div 
             ref={containerRef} 
             id="invoice" 
             className="invoice-print-area shrink-0 relative bg-white mx-auto font-sans text-slate-900"
             style={{ 
               width: '210mm',
               minHeight: '297mm',
               boxSizing: 'border-box',
               transform: `scale(${zoom / 100})`, 
               transformOrigin: 'top center',
             }}
          >
             {/* Print Layout Container - Strict A4 mm */}
             <div className="flex flex-col bg-white" style={{ fontFamily: 'Helvetica, Arial, sans-serif', width: '210mm', minHeight: '297mm', position: 'relative' }}>
                
                {/* Fixed Top/First Page Structure */}
                {/* Sender Address & Return Box (DIN 5008 Address Window) */}
                <div style={{ position: 'absolute', top: '45mm', left: '20mm', width: '85mm', height: '45mm' }}>
                    <div style={{ fontSize: '7pt', color: '#4b5563', borderBottom: '0.5pt solid #9ca3af', display: 'inline-block', paddingBottom: '1mm', marginBottom: '3mm' }}>
                        {settings?.companyName || 'Ihre Firma'} 
                        {settings?.companyStreet ? ` • ${settings.companyStreet}` : ''}
                        {settings?.companyZip || settings?.companyCity ? ` • ${settings.companyZip} ${settings.companyCity}` : ''}
                    </div>
                    
                    <div style={{ fontSize: '10pt', lineHeight: '1.4', color: '#000' }}>
                       {formData.companyName && <div style={{ fontWeight: 'bold' }}>{formData.companyName}</div>}
                       {(!formData.companyName && (formData.firstName || formData.lastName)) && <div style={{ fontWeight: 'bold' }}>{[formData.firstName, formData.lastName].filter(Boolean).join(' ')}</div>}
                       {(formData.companyName && (formData.firstName || formData.lastName)) && <div>{[formData.firstName, formData.lastName].filter(Boolean).join(' ')}</div>}
                       <div>{[formData.street, formData.houseNumber].filter(Boolean).join(' ')}</div>
                       <div>{formData.zipCode} {formData.city}</div>
                       {formData.country && formData.country !== 'Deutschland' && <div style={{ marginTop: '1mm', fontWeight: 'bold', textTransform: 'uppercase' }}>{formData.country}</div>}
                    </div>
                </div>

                {/* Company Info Box (Right Side) */}
                <div style={{ position: 'absolute', top: '25mm', right: '20mm', width: '75mm', fontSize: '9pt', textAlign: 'right', lineHeight: '1.4' }}>
                    {logo && <img src={logo} alt="Logo" style={{ maxWidth: '60mm', maxHeight: '25mm', objectFit: 'contain', marginBottom: '4mm', display: 'inline-block' }} />}
                    <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '1mm', color: '#000' }}>{settings?.companyName || 'Ihre Firma'}</div>
                    {(settings?.companyOwnerFirstName || settings?.companyOwnerLastName) && (
                        <div style={{ color: '#000' }}>Inh.: {[settings?.companyOwnerFirstName, settings?.companyOwnerLastName].filter(Boolean).join(' ')}</div>
                    )}
                    <div style={{ marginBottom: '2mm', color: '#000' }}>
                        <div>{settings?.companyStreet || 'Musterstraße 1'}</div>
                        <div>{settings?.companyZip || '12345'} {settings?.companyCity || 'Musterstadt'}</div>
                    </div>
                    <div style={{ color: '#000' }}>
                        {settings?.companyEmail && <div>{settings.companyEmail}</div>}
                        {settings?.companyPhone && <div>Tel: {settings.companyPhone}</div>}
                        {settings?.companyWebsite && <div>{settings.companyWebsite}</div>}
                        {settings?.companyTaxId && <div style={{ marginTop: '1mm' }}>USt-IdNr.: {settings.companyTaxId}</div>}
                    </div>
                </div>

                {/* Content Area starts below the header - 105mm from top DIN 5008 Type B */}
                <div style={{ marginTop: '105mm', paddingLeft: '20mm', paddingRight: '20mm', paddingBottom: '20mm', width: '100%', boxSizing: 'border-box' }}>
                    
                    {/* Document Title & Meta Box (ERP-Style Grid) */}
                    <div style={{ marginBottom: '8mm' }}>
                        <h1 style={{ fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, color: '#000' }}>
                            {formData.type || (documentType === 'offer' ? 'ANGEBOT' : 'RECHNUNG')}
                            {(formData.type === 'Teilrechnung' || formData.type === 'Schlussrechnung') && formData.partialInvoiceNumber && (
                                <span style={{ fontSize: '14pt', fontWeight: 'normal', color: '#4b5563', marginLeft: '4mm' }}>Nr. {formData.partialInvoiceNumber}</span>
                            )}
                        </h1>
                    </div>

                    {/* Metadata Table */}
                    <div style={{ borderTop: '1.5pt solid #000', borderBottom: '0.5pt solid #000', paddingTop: '3mm', paddingBottom: '3mm', marginBottom: '8mm', display: 'flex', gap: '8mm', fontSize: '9pt' }}>
                        <div>
                            <div style={{ color: '#4b5563', marginBottom: '1mm' }}>Datum</div>
                            <div style={{ fontWeight: 'bold', color: '#000' }}>{formatDate(formData.date, settings?.dateFormat)}</div>
                        </div>
                        <div>
                            <div style={{ color: '#4b5563', marginBottom: '1mm' }}>{documentType === 'offer' ? 'Angebots-Nr.' : 'Rechnungs-Nr.'}</div>
                            <div style={{ fontWeight: 'bold', color: '#000' }}>{formData.number || 'ENTWURF'}</div>
                        </div>
                        {formData.customerId && (
                            <div>
                                <div style={{ color: '#4b5563', marginBottom: '1mm' }}>Kunden-Nr.</div>
                                <div style={{ fontWeight: 'bold', color: '#000' }}>{customers.find(c => c.id === formData.customerId)?.id.substring(0,6).toUpperCase() || 'KD-1002'}</div>
                            </div>
                        )}
                        {(formData.servicePeriodStart || formData.servicePeriodEnd) && (
                            <div>
                                <div style={{ color: '#4b5563', marginBottom: '1mm' }}>Leistungszeitraum</div>
                                <div style={{ fontWeight: 'bold', color: '#000' }}>
                                    {formData.servicePeriodStart ? formatDate(formData.servicePeriodStart, settings?.dateFormat) : '...'} - {formData.servicePeriodEnd ? formatDate(formData.servicePeriodEnd, settings?.dateFormat) : '...'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Subject & Message */}
                    <div style={{ marginBottom: '8mm', fontSize: '10pt', lineHeight: '1.5', color: '#000' }}>
                        {formData.subject && <div style={{ fontWeight: 'bold', marginBottom: '3mm' }}>{formData.subject}</div>}
                        {formData.message && <div style={{ whiteSpace: 'pre-wrap' }}>{formData.message}</div>}
                    </div>

                    {/* Line Items Table (ERP Style) */}
                    <div style={{ marginBottom: '8mm' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', pageBreakInside: 'auto' }}>
                            <thead style={{ display: 'table-header-group' }}>
                                <tr style={{ borderBottom: '1pt solid #000', pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
                                    <th style={{ width: '12mm', padding: '2mm 1mm', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>Pos.</th>
                                    <th style={{ padding: '2mm 1mm', textAlign: 'left', fontWeight: 'bold', color: '#000' }}>Bezeichnung</th>
                                    <th style={{ width: '22mm', padding: '2mm 1mm', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>Menge</th>
                                    <th style={{ width: '25mm', padding: '2mm 1mm', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>Einzelpreis</th>
                                    {settings?.showItemTaxes !== false && <th style={{ width: '15mm', padding: '2mm 1mm', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>USt.</th>}
                                    <th style={{ width: '28mm', padding: '2mm 1mm', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>Gesamt</th>
                                </tr>
                            </thead>
                            <tbody>
                               {formData.items.length === 0 ? (
                                   <tr>
                                       <td colSpan={6} style={{ padding: '5mm 1mm', textAlign: 'center', fontStyle: 'italic', color: '#6b7280' }}>Keine Positionen hinzugefügt</td>
                                   </tr>
                               ) : (
                                   formData.items.map((item: any, index: number) => {
                                      const price = Number(item.price) || 0;
                                      const qty = Number(item.quantity) || 0;
                                      const disc = Number(item.discount) || 0;
                                      const lineTotal = (price * qty) - disc;
                                      return (
                                         <tr key={index} style={{ borderBottom: '0.5pt solid #d1d5db', verticalAlign: 'top', pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
                                            <td style={{ padding: '3mm 1mm', color: '#000' }}>{index + 1}</td>
                                            <td style={{ padding: '3mm 1mm', paddingRight: '4mm' }}>
                                                <div style={{ fontWeight: 'bold', color: '#000' }}>{item.name || 'Position'}</div>
                                                {item.description && <div style={{ fontSize: '8pt', color: '#4b5563', whiteSpace: 'pre-wrap', marginTop: '1mm', lineHeight: '1.4' }}>{item.description}</div>}
                                            </td>
                                            <td style={{ padding: '3mm 1mm', textAlign: 'right', whiteSpace: 'nowrap', color: '#000' }}>
                                                {item.quantity} <span style={{ color: '#4b5563' }}>{item.unit || 'Stk'}</span>
                                            </td>
                                            <td style={{ padding: '3mm 1mm', textAlign: 'right', whiteSpace: 'nowrap', color: '#000' }}>
                                                {formatCurrency(price, settings?.currency)}
                                                {disc > 0 && <div style={{ fontSize: '8pt', color: '#4b5563', marginTop: '1mm' }}>abzgl. {formatCurrency(disc, settings?.currency)}</div>}
                                            </td>
                                            {settings?.showItemTaxes !== false && <td style={{ padding: '3mm 1mm', textAlign: 'right', color: '#4b5563' }}>{item.vatRate || formData.vatRate || 19}%</td>}
                                            <td style={{ padding: '3mm 1mm', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap', color: '#000' }}>
                                                {formatCurrency(lineTotal, settings?.currency)}
                                            </td>
                                         </tr>
                                      );
                                   })
                               )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Box (Strict alignment) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10mm', pageBreakInside: 'avoid' }}>
                        <div style={{ width: '80mm' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5mm 0', fontSize: '9pt', color: '#000' }}>
                                <span>Zwischensumme (Netto)</span>
                                <span>{formatCurrency(totals.subtotal, settings?.currency)}</span>
                            </div>
                            {totals.discountAmount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5mm 0', fontSize: '9pt', color: '#dc2626' }}>
                                    <span>Rabatt</span>
                                    <span>-{formatCurrency(totals.discountAmount, settings?.currency)}</span>
                                </div>
                            )}
                            {Object.entries(totals.calculatedItems.reduce((acc: any, item: any) => {
                               if (!acc[item.vatRate]) acc[item.vatRate] = 0;
                               acc[item.vatRate] += item.vatAmount;
                               return acc;
                            }, {})).map(([rate, amount]: [string, any]) => amount > 0 && (
                               <div key={rate} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5mm 0', fontSize: '9pt', color: '#000' }}>
                                  <span>zzgl. {rate}% USt.</span>
                                  <span>{formatCurrency(amount, settings?.currency)}</span>
                               </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3mm 0', marginTop: '1.5mm', fontSize: '11pt', fontWeight: 'bold', color: '#000', borderTop: '1.5pt solid #000', borderBottom: '1.5pt double #000' }}>
                                <span>Gesamtbetrag</span>
                                <span>{formatCurrency(totals.total, settings?.currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Terms */}
                    <div style={{ fontSize: '9pt', color: '#000', lineHeight: '1.5', pageBreakInside: 'avoid' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '1mm' }}>Zahlungsbedingungen</div>
                        <div>
                            {formData.paymentTermsDays 
                               ? `Zahlbar innerhalb von ${formData.paymentTermsDays} Tagen ohne Abzug.` 
                               : 'Zahlbar sofort nach Erhalt ohne Abzug.'}
                        </div>
                        <div>Fällig am: {formatDate(formData.dueDate || Date.now() + 14 * 24 * 60 * 60 * 1000, settings?.dateFormat)}</div>
                        {formData.paymentNote && <div style={{ whiteSpace: 'pre-wrap', marginTop: '3mm' }}>{formData.paymentNote}</div>}
                        
                        <div style={{ marginTop: '8mm', fontStyle: 'italic' }}>
                            Vielen Dank für Ihren Auftrag!
                        </div>
                    </div>

                </div>

                {/* Footer (Bank Details etc) */}
                <div style={{ marginTop: 'auto', paddingLeft: '20mm', paddingRight: '20mm', paddingBottom: '15mm', width: '100%', boxSizing: 'border-box', pageBreakInside: 'avoid' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: '7pt', color: '#6b7280', borderTop: '0.5pt solid #d1d5db', paddingTop: '3mm', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                        {settings?.companyBankName && <div><span style={{ fontWeight: 'bold', color: '#4b5563' }}>Bank:</span> {settings.companyBankName}</div>}
                        {settings?.companyIban && <div><span style={{ fontWeight: 'bold', color: '#4b5563' }}>IBAN:</span> {settings.companyIban}</div>}
                        {settings?.companyBic && <div><span style={{ fontWeight: 'bold', color: '#4b5563' }}>BIC:</span> {settings.companyBic}</div>}
                        {settings?.companyTaxId && <div><span style={{ fontWeight: 'bold', color: '#4b5563' }}>USt-IdNr.:</span> {settings.companyTaxId}</div>}
                    </div>
                </div>

             </div>
          </div>
        </div>

        {/* Left: Input Form Sidebar */}
        <div className="w-[450px] bg-white border-r border-border flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.1)] z-30 shrink-0">
           {/* Sidebar Tabs */}
           <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setActiveSidebarTab('inhalt')} 
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${activeSidebarTab === 'inhalt' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                Inhalt
              </button>
              <button 
                onClick={() => setActiveSidebarTab('design')} 
                className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${activeSidebarTab === 'design' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                Design / Layout
              </button>
           </div>

           <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              
              {activeSidebarTab === 'design' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                  {/* Template Controls */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="font-semibold text-lg">Layout Vorlagen</h3>
                      <button type="button" onClick={handleSaveAsTemplate} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded">
                        + Als Vorlage speichern
                      </button>
                    </div>
                    {layoutTemplates.length > 0 ? (
                      <div className="space-y-2">
                        {layoutTemplates.map((t) => (
                          <div key={t.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded p-2">
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => applyTemplate(t.id)} className="font-medium text-sm text-slate-800 hover:text-blue-600 transition-colors">
                                {t.name}
                              </button>
                              {t.isDefault && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-1 rounded">Standard</span>}
                            </div>
                            <div className="flex gap-2">
                              {!t.isDefault && (
                                <button type="button" onClick={() => handleSetDefaultTemplate(t.id)} className="text-xs text-slate-500 hover:text-emerald-600" title="Als Standard setzen">
                                  Set Default
                                </button>
                              )}
                              <button type="button" onClick={() => handleDeleteTemplate(t.id)} className="text-xs text-red-400 hover:text-red-600" title="Löschen">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                        Bisher keine eigenen Layout-Vorlagen gespeichert. Verschieben Sie Textblöcke und speichern Sie Ihr eigenes Layout.
                      </div>
                    )}
                  </div>

                  {/* Design Settings Panels */}
                  <div className="space-y-8">
                    
                    {/* Colors & Typography */}
                    <div className="space-y-4 border border-slate-200 p-4 rounded-xl shadow-sm bg-white">
                      <h4 className="font-semibold text-slate-800 flex items-center justify-between">
                         Farben & Designstil
                      </h4>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">Akzentfarbe</label>
                        <div className="flex gap-2 flex-wrap">
                          {['#000000', '#2563EB', '#16A34A', '#DC2626', '#4F46E5', '#0891B2', '#D97706'].map(c => (
                            <button
                               key={c}
                               onClick={() => setSettings({...settings, invoiceColor: c} as any)}
                               className={`w-8 h-8 rounded-full border-2 transition-transform ${settings?.invoiceColor === c ? 'border-slate-400 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                               style={{ backgroundColor: c }}
                            />
                          ))}
                          <div className="relative w-8 h-8 rounded-full border-2 border-slate-200 overflow-hidden cursor-pointer hover:border-slate-400 transition-colors">
                              <input type="color" value={settings?.invoiceColor || '#000000'} onChange={(e) => setSettings({...settings, invoiceColor: e.target.value} as any)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                         <label className="block text-xs font-semibold text-slate-500 mb-2">Design-Vorlage</label>
                         <div className="grid grid-cols-2 gap-2">
                           {[
                              { id: 'standard', name: 'Klassisch' },
                              { id: 'modern', name: 'Modern (Linie)' },
                              { id: 'minimal', name: 'Minimalistisch' },
                              { id: 'elegant', name: 'Elegant (Serif)' },
                              { id: 'bold', name: 'Corporate (Fett)' },
                              { id: 'left', name: 'Linksbündig' },
                              { id: 'center', name: 'Zentriert' },
                              { id: 'boxed', name: 'Kastenform' }
                           ].map(t => (
                              <button 
                                key={t.id}
                                onClick={() => setFormData({...formData, template: t.id})}
                                className={`px-3 py-2 text-sm text-left border rounded transition-all ${formData.template === t.id || (!formData.template && t.id === 'standard' && !settings?.invoiceTemplate) ? 'border-blue-500 bg-blue-50 shadow-sm text-blue-700 font-medium' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                              >
                                {t.name}
                              </button>
                           ))}
                         </div>
                      </div>
                    </div>

                    {/* Logo & Briefpapier */}
                    <div className="space-y-4 border border-slate-200 p-4 rounded-xl shadow-sm bg-white">
                      <h4 className="font-semibold text-slate-800">Logo & Briefpapier</h4>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">Briefpapier Hintergrund</label>
                        <select 
                           value={settings?.briefpapierImage ? 'custom' : 'none'} 
                           onChange={(e) => {
                             if(e.target.value === 'none') {
                               setSettings({...settings, briefpapierImage: undefined} as any)
                             }
                           }}
                           className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                        >
                          <option value="none">Ohne Briefpapier (Weiß)</option>
                          <option value="custom">Eigenes Briefpapier</option>
                        </select>
                        <label className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-xs transition-colors flex justify-center items-center cursor-pointer">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                               const file = e.target.files?.[0];
                               if(file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                      setSettings({...settings, briefpapierImage: ev.target?.result as string} as any);
                                  };
                                  reader.readAsDataURL(file);
                               }
                            }} />
                            Neu hochladen
                        </label>
                      </div>

                      <div className="pt-2">
                        <label className="block text-xs font-semibold text-slate-500 mb-2">Logo Ausrichtung (Schnell)</label>
                        <div className="flex bg-slate-100 rounded p-1">
                           <button onClick={() => updateLayout('logo', { x: 40 })} className="flex-1 py-1.5 text-xs font-medium bg-white rounded shadow-sm">Links</button>
                           <button onClick={() => updateLayout('logo', { x: 300 })} className="flex-1 py-1.5 text-xs font-medium hover:bg-white/50 rounded transition-colors">Mittig</button>
                           <button onClick={() => updateLayout('logo', { x: 554 })} className="flex-1 py-1.5 text-xs font-medium hover:bg-white/50 rounded transition-colors">Rechts</button>
                        </div>
                      </div>
                    </div>

                    {/* Visibility Options */}
                    <div className="space-y-3 border border-slate-200 p-4 rounded-xl shadow-sm bg-white">
                      <h4 className="font-semibold text-slate-800">Sichtbarkeit</h4>
                      
                      {[
                        { key: 'showSenderLine', label: 'Absenderzeile über Adresse' },
                        { key: 'showCustomerNumber', label: 'Kundennummer anzeigen' },
                        { key: 'showContactPerson', label: 'Kontaktperson anzeigen' },
                        { key: 'showItemNumber', label: 'Artikelnummer anzeigen' },
                        { key: 'showItemDescription', label: 'Positionsbeschreibung' },
                        { key: 'showItemTaxes', label: 'USt. pro Position ausweisen' },
                        { key: 'showQRCode', label: 'QR-Code (GiroCode) anzeigen' },
                        { key: 'showFooter', label: 'Fußzeile anzeigen' },
                        { key: 'showPageNumbers', label: 'Seitenzahlen (1/2) anzeigen' },
                        { key: 'showFoldMarks', label: 'Falz- und Lochmarken' }
                      ].map(opt => (
                        <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                           <div className="relative">
                             <input 
                               type="checkbox" 
                               checked={(settings as any)?.[opt.key] ?? true} 
                               onChange={(e) => setSettings({...settings, [opt.key]: e.target.checked} as any)} 
                               className="sr-only peer" 
                             />
                             <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                           </div>
                           <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* General Settings */}
                    <div className="space-y-4 border border-slate-200 p-4 rounded-xl shadow-sm bg-white">
                      <h4 className="font-semibold text-slate-800">Dokumentensprache</h4>
                      <select 
                         value={settings?.language || 'de'} 
                         onChange={(e) => setSettings({...settings, language: e.target.value} as any)}
                         className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                         <option value="de">Deutsch</option>
                         <option value="en">Englisch</option>
                         <option value="fr">Französisch</option>
                         <option value="es">Spanisch</option>
                      </select>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Category & Setup Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Dokument</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Typ</label>
                    <select value={formData.type || 'Standard'} onChange={(e) => setFormData({...formData, type: e.target.value as any})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="Standard">Rechnung</option>
                      <option value="Teilrechnung">Teilrechnung</option>
                      <option value="Schlussrechnung">Schlussrechnung</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Kategorie</label>
                    <select value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                       <option value="">Keine</option>
                       <option value="Dienstleistung">Dienstleistung</option>
                       <option value="Produktverkauf">Produktverkauf</option>
                       <option value="Beratung">Beratung</option>
                       <option value="Sonstiges">Sonstiges</option>
                    </select>
                  </div>
                  {(formData.type === 'Teilrechnung' || formData.type === 'Schlussrechnung') && (
                     <div className="col-span-2">
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Teilrechnungs-Nr.</label>
                       <input type="number" min="1" value={formData.partialInvoiceNumber || ''} onChange={(e) => setFormData({...formData, partialInvoiceNumber: e.target.value ? parseInt(e.target.value) : undefined})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1" />
                     </div>
                  )}
                </div>
              </div>

              {/* Customer Input */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Kunde & Referenz</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kunde suchen</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowCustomerDropdown(true);
                        setFormData({...formData, customerId: ''});
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                      placeholder="Name des Kunden..."
                      className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {showCustomerDropdown && customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-48 overflow-y-auto">
                        {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map((customer: any) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => selectCustomer(customer)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-xs text-slate-500 truncate">{customer.address.replace(/\n/g, ', ')}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {formData.customerId && (
                   <div className="bg-slate-50 p-3 rounded border border-slate-200">
                     <label className="block text-xs font-semibold text-slate-500 mb-2">Kundenangaben bearbeiten</label>
                     <div className="space-y-2">
                       <input value={formData.companyName || ''} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm" placeholder="Firmenname" />
                       <div className="flex gap-2">
                         <input value={formData.firstName || ''} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm" placeholder="Vorname" />
                         <input value={formData.lastName || ''} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm" placeholder="Nachname" />
                       </div>
                       <div className="flex gap-2">
                         <input value={formData.street || ''} onChange={(e) => setFormData({...formData, street: e.target.value})} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm" placeholder="Straße" />
                         <input value={formData.houseNumber || ''} onChange={(e) => setFormData({...formData, houseNumber: e.target.value})} className="w-20 border border-slate-300 px-2 py-1.5 rounded text-sm" placeholder="Nr." />
                       </div>
                       <div className="flex gap-2">
                         <input value={formData.zipCode || ''} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="w-24 border border-slate-300 px-2 py-1.5 rounded text-sm" placeholder="PLZ" />
                         <input value={formData.city || ''} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm" placeholder="Stadt" />
                       </div>
                     </div>
                   </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Projekt (Optional)</label>
                  <select
                    value={formData.projectId || ''}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                  >
                    <option value="">Kein Projekt</option>
                    {projects.filter(p => !formData.customerId || p.customerId === formData.customerId).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Referenznummer</label>
                  <input value={formData.referenceNumber || ''} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="z.B. Bestellung #123" />
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Zeitraum & Fristen</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{documentType === 'offer' ? 'Angebotsdatum' : 'Rechnungsdatum'}</label>
                    <input type="date" value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, date: e.target.value ? new Date(e.target.value).getTime() : undefined})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Lieferdatum</label>
                    <input type="date" value={formData.deliveryDate ? new Date(formData.deliveryDate).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, deliveryDate: e.target.value ? new Date(e.target.value).getTime() : undefined})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Leistungszeitraum (Von - Bis)</label>
                    <div className="flex items-center gap-2">
                      <input type="date" value={formData.servicePeriodStart ? new Date(formData.servicePeriodStart).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, servicePeriodStart: e.target.value ? new Date(e.target.value).getTime() : undefined})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      <span className="text-slate-400">-</span>
                      <input type="date" value={formData.servicePeriodEnd ? new Date(formData.servicePeriodEnd).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, servicePeriodEnd: e.target.value ? new Date(e.target.value).getTime() : undefined})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Zahlungsziel (Tage)</label>
                    <input type="number" min="0" value={formData.paymentTermsDays || 0} onChange={(e) => setFormData({...formData, paymentTermsDays: parseInt(e.target.value) || 0})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Text Form */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Texte & Optionen</h3>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                  <input type="checkbox" id="bruttoToggle" checked={formData.pricesIncludeVat || false} onChange={e => setFormData({...formData, pricesIncludeVat: e.target.checked})} className="w-4 h-4 cursor-pointer" />
                  <label htmlFor="bruttoToggle" className="text-sm font-medium text-slate-700 cursor-pointer">Preise sind Brutto (inkl. MwSt)</label>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Betreff</label>
                  <input value={formData.subject || ''} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder={documentType === 'offer' ? "z.B. Angebot über Handwerksleistungen" : "z.B. Rechnung für Handwerksleistungen"} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nachricht</label>
                  <textarea value={formData.message || ''} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full border border-slate-300 px-3 py-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Vielen Dank für Ihren Auftrag..." />
                </div>
              </div>

              {/* Items Form */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-semibold text-lg">Positionen</h3>
                  <button onClick={handleAddItem} className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded transition-colors">+ Neu</button>
                </div>
                
                <div className="space-y-4">
                  {formData.items.map((item: any, index: number) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50 relative group shadow-sm">
                      <button onClick={() => removeItem(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="space-y-3">
                        <div className="pr-8 relative">
                           <input 
                             value={item.name || ''} 
                             onChange={(e) => {
                               handleItemChange(index, 'name', e.target.value);
                               setActiveProductDropdown(index);
                             }}
                             onFocus={() => setActiveProductDropdown(index)}
                             onBlur={() => setTimeout(() => setActiveProductDropdown(null), 200)}
                             className="w-full font-medium border border-slate-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                             placeholder="Position / Artikel (tippen zum Suchen)" 
                           />
                           {activeProductDropdown === index && (
                             <div className="absolute top-10 left-0 w-full z-10 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                               {products.filter(p => !item.name || p.name.toLowerCase().includes(item.name.toLowerCase())).map(p => (
                                 <div 
                                   key={p.id} 
                                   className="p-2 hover:bg-slate-50 cursor-pointer text-sm border-b border-slate-100 last:border-0"
                                   onMouseDown={(e) => {
                                     e.preventDefault();
                                     handleProductSelect(index, p);
                                     setActiveProductDropdown(null);
                                   }}
                                 >
                                   <div className="font-medium text-slate-800">{p.name}</div>
                                   <div className="text-xs text-slate-500">{formatCurrency(p.price, settings.currency)} / {p.unit}</div>
                                 </div>
                               ))}
                               {products.filter(p => !item.name || p.name.toLowerCase().includes(item.name.toLowerCase())).length === 0 && (
                                  <div className="p-3 text-xs text-slate-500 italic text-center">Kein Artikel gefunden</div>
                               )}
                             </div>
                           )}
                        </div>
                        <div>
                           <textarea value={item.description || ''} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full border border-slate-300 px-2 py-1.5 rounded text-xs text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none h-16" placeholder="Details (Optional)" />
                        </div>
                        <div className="flex gap-2">
                           <div className="w-1/3">
                             <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Menge</label>
                             <input type="number" value={item.quantity || ''} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm" />
                           </div>
                           <div className="w-1/3">
                             <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Einheit</label>
                             <input value={item.unit || ''} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm" placeholder="Stk" />
                           </div>
                           <div className="w-1/3">
                             <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Preis</label>
                             <input type="number" value={item.price || ''} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm" />
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <div className="w-1/2">
                             <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Rabatt Total {settings?.currency}</label>
                             <input type="number" value={item.discount || ''} onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || undefined)} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm text-red-600" placeholder="0.00" />
                           </div>
                           <div className="w-1/2">
                             <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1">Steuer %</label>
                             <select value={item.vatRate || 19} onChange={(e) => handleItemChange(index, 'vatRate', parseFloat(e.target.value))} className="w-full border border-slate-300 px-2 py-1.5 rounded text-sm">
                               <option value="19">19%</option>
                               <option value="7">7%</option>
                               <option value="0">0%</option>
                             </select>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.items.length === 0 && (
                    <div className="text-center py-6 text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                      Noch keine Positionen
                    </div>
                  )}
                  <button onClick={handleAddItem} className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition-colors flex justify-center items-center gap-2">
                    <Plus className="w-4 h-4" /> Position hinzufügen
                  </button>
                </div>
              </div>
            </div>
            )}
           </div>
        </div>
      </div>
    </div>
  );
}
