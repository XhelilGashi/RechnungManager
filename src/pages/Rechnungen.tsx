import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Invoice, LineItem, Customer, InvoiceStatus, InvoiceType } from '../types';
import { Plus, Trash2, X, Download, Receipt, Pencil, Printer, Mail } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { generateInvoicePDF } from '../lib/pdf';
import { LiveInvoiceEditor } from '../components/LiveInvoiceEditor';

export function Rechnungen() {
  const { invoices, setInvoices, customers, projects, products, logo, settings, showToast, payments, setPayments } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [activeProductDropdown, setActiveProductDropdown] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const selectCustomer = (customer: Customer) => {
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    setFormData(prev => ({
      ...prev,
      customerId: customer.id,
      companyName: customer.companyName || customer.name || '',
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      street: customer.street || '',
      houseNumber: customer.houseNumber || '',
      zipCode: customer.zipCode || '',
      city: customer.city || '',
      country: customer.country || '',
      email: customer.email || '',
      vatId: customer.vatId || '',
    }));
  };
  
  const generateInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const invoicesThisYear = invoices.filter(inv => inv.number?.includes(`-${currentYear}-`));
    const nextNum = invoicesThisYear.length + 1;
    return `RE-${currentYear}-${nextNum.toString().padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<{
    id?: string;
    number?: string;
    date?: number;
    dueDate?: number;
    status?: InvoiceStatus;
    customerId: string;
    
    // Customer Snapshot
    companyName?: string;
    firstName?: string;
    lastName?: string;
    street?: string;
    houseNumber?: string;
    zipCode?: string;
    city?: string;
    country?: string;
    email?: string;
    vatId?: string;

    // Project fields
    projectId?: string;
    type?: InvoiceType;
    partialInvoiceNumber?: number;
    servicePeriodStart?: number;
    servicePeriodEnd?: number;

    // Professional fields
    deliveryDate?: number;
    referenceNumber?: string;
    paymentTermsDays?: number;
    subject?: string;
    message?: string;
    pricesIncludeVat: boolean;

    items: { id?: string; description: string; quantity: number; unit?: string; price: number; discountPercent?: number; vatRate?: number }[];
    applyVat: boolean;
    applyDiscount: boolean;
  }>({ 
    customerId: '', 
    type: 'Standard', 
    items: [], 
    applyVat: true, 
    applyDiscount: false,
    pricesIncludeVat: false,
    paymentTermsDays: 14,
    subject: '',
    message: 'Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihren Auftrag.\nHiermit stellen wir Ihnen die folgenden Leistungen in Rechnung:'
  });

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const customer = customers.find(c => c.id === selectedId);
    
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedId,
        companyName: customer.companyName || customer.name || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        street: customer.street || '',
        houseNumber: customer.houseNumber || '',
        zipCode: customer.zipCode || '',
        city: customer.city || '',
        country: customer.country || '',
        email: customer.email || '',
        vatId: customer.vatId || '',
      }));
    } else {
      setFormData(prev => ({ ...prev, customerId: selectedId }));
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit: 'Stück', price: 0 }]
    });
  };

  const handleItemChange = (index: number, field: keyof { description: string; quantity: number; unit?: string; price: number; discountPercent?: number; vatRate?: number }, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleProductSelect = (index: number, product: any) => {
    const newItems = [...formData.items];
    newItems[index] = { 
      ...newItems[index], 
      name: product.name,
      price: product.price,
      unit: product.unit,
      vatRate: product.vatRate || 19
    };
    setFormData({ ...formData, items: newItems });
    setActiveProductDropdown(null);
  };

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const totals = (() => {
    let subtotal = 0;
    let totalVatAmount = 0;

    const calculatedItems = formData.items.map(item => {
      const quantity = item.quantity || 0;
      const unitPrice = item.price || 0;
      const itemVatRate = item.vatRate !== undefined ? item.vatRate : (formData.applyVat ? 19 : 0);
      const itemDiscountPercent = item.discountPercent || 0;
      
      let itemNetPrice;

      if (formData.pricesIncludeVat) {
        itemNetPrice = unitPrice / (1 + itemVatRate / 100);
      } else {
        itemNetPrice = unitPrice;
      }

      const itemNetTotal = itemNetPrice * quantity;
      const itemDiscountedNetTotal = itemNetTotal * (1 - itemDiscountPercent / 100);
      const itemVatAmount = itemDiscountedNetTotal * (itemVatRate / 100);
      
      subtotal += itemDiscountedNetTotal;
      totalVatAmount += itemVatAmount;

      return {
        ...item,
        total: itemDiscountedNetTotal
      };
    });

    const subtotalWithVat = subtotal + totalVatAmount;
    
    // Apply discount on Gross (Brutto)
    const discountRate = formData.applyDiscount ? 3 : 0;
    const globalDiscountAmount = subtotalWithVat * (discountRate / 100);
    
    const total = subtotalWithVat - globalDiscountAmount;
    
    return { 
      subtotal, 
      vatRate: formData.applyVat ? 19 : 0, 
      vatAmount: totalVatAmount, 
      subtotalWithVat, 
      discountRate, 
      discountAmount: globalDiscountAmount, 
      total,
      calculatedItems
    };
  })();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || formData.items.length === 0) return;

    const newInvoice: Invoice = {
      id: formData.id || uuidv4(),
      number: formData.number || generateInvoiceNumber(),
      date: formData.date || Date.now(),
      dueDate: formData.dueDate || (Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: formData.status || 'offen',
      customerId: formData.customerId,
      
      companyName: formData.companyName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      street: formData.street,
      houseNumber: formData.houseNumber,
      zipCode: formData.zipCode,
      city: formData.city,
      country: formData.country,
      email: formData.email,
      vatId: formData.vatId,
      
      projectId: formData.projectId,
      type: formData.type || 'Standard',
      partialInvoiceNumber: formData.partialInvoiceNumber,
      servicePeriodStart: formData.servicePeriodStart,
      servicePeriodEnd: formData.servicePeriodEnd,
      
      deliveryDate: formData.deliveryDate,
      referenceNumber: formData.referenceNumber,
      paymentTermsDays: formData.paymentTermsDays,
      subject: formData.subject,
      message: formData.message,
      pricesIncludeVat: formData.pricesIncludeVat,

      items: totals.calculatedItems.map(item => ({
        id: item.id || uuidv4(),
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || 'Stück',
        price: item.price,
        discountPercent: item.discountPercent,
        vatRate: item.vatRate,
        total: item.total
      })),
      subtotal: totals.subtotal,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      discountRate: totals.discountRate,
      discountAmount: totals.discountAmount,
      total: totals.total
    };

    if (formData.id) {
      setInvoices(invoices.map(i => i.id === formData.id ? newInvoice : i));
      showToast('Rechnung erfolgreich aktualisiert');
    } else {
      setInvoices([newInvoice, ...invoices]);
      showToast('Rechnung erfolgreich erstellt');
    }
    
    setIsCreating(false);
    setFormData({ 
      customerId: '', 
      type: 'Standard', 
      items: [], 
      applyVat: true, 
      applyDiscount: false,
      pricesIncludeVat: false,
      paymentTermsDays: 14,
      subject: '',
      message: 'Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihren Auftrag.\nHiermit stellen wir Ihnen die folgenden Leistungen in Rechnung:'
    });
  };

  const handleEdit = (invoice: Invoice) => {
    setIsEditorLoading(true);
    setTimeout(() => {
        const customer = customers.find(c => c.id === invoice.customerId);
        setCustomerSearch(customer ? customer.name : '');
        setFormData({
          id: invoice.id,
          number: invoice.number,
          date: invoice.date,
          dueDate: invoice.dueDate,
          status: invoice.status,
          customerId: invoice.customerId,
          
          companyName: invoice.companyName || '',
          firstName: invoice.firstName || '',
          lastName: invoice.lastName || '',
          street: invoice.street || '',
          houseNumber: invoice.houseNumber || '',
          zipCode: invoice.zipCode || '',
          city: invoice.city || '',
          country: invoice.country || '',
          email: invoice.email || '',
          vatId: invoice.vatId || '',

          projectId: invoice.projectId || '',
          type: invoice.type || 'Standard',
          partialInvoiceNumber: invoice.partialInvoiceNumber,
          servicePeriodStart: invoice.servicePeriodStart,
          servicePeriodEnd: invoice.servicePeriodEnd,
          
          deliveryDate: invoice.deliveryDate,
          referenceNumber: invoice.referenceNumber || '',
          paymentTermsDays: invoice.paymentTermsDays || 14,
          subject: invoice.subject || '',
          message: invoice.message || '',
          pricesIncludeVat: invoice.pricesIncludeVat || false,

          items: invoice.items.map(item => ({ ...item })),
          applyVat: invoice.vatRate > 0 || invoice.items.some(i => (i.vatRate || 0) > 0),
          applyDiscount: !!invoice.discountRate && invoice.discountRate > 0
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsCreating(true);
        setIsEditorLoading(false);
    }, 50);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Rechnung wirklich löschen?")) {
      setInvoices(invoices.filter(i => i.id !== id));
      showToast('Rechnung gelöscht');
    }
  };

  const getMergedCustomer = (invoice: Invoice): Customer | null => {
    const originalCustomer = customers.find(c => c.id === invoice.customerId);
    if (!originalCustomer && !invoice.companyName) return null;
    
    const contactName = [invoice.firstName || originalCustomer?.firstName || '', invoice.lastName || originalCustomer?.lastName || ''].filter(Boolean).join(' ');
    
    return {
      ...originalCustomer,
      id: invoice.customerId,
      name: invoice.companyName || originalCustomer?.name || '',
      address: [
          contactName,
          `${invoice.street || originalCustomer?.street || ''} ${invoice.houseNumber || originalCustomer?.houseNumber || ''}`.trim(),
          `${invoice.zipCode || originalCustomer?.zipCode || ''} ${invoice.city || originalCustomer?.city || ''}`.trim(),
          invoice.country || originalCustomer?.country || ''
      ].filter(Boolean).join('\n'),
      email: invoice.email || originalCustomer?.email || '',
      companyName: invoice.companyName || originalCustomer?.companyName,
      firstName: invoice.firstName || originalCustomer?.firstName,
      lastName: invoice.lastName || originalCustomer?.lastName,
      street: invoice.street || originalCustomer?.street,
      houseNumber: invoice.houseNumber || originalCustomer?.houseNumber,
      zipCode: invoice.zipCode || originalCustomer?.zipCode,
      city: invoice.city || originalCustomer?.city,
      country: invoice.country || originalCustomer?.country,
      vatId: invoice.vatId || originalCustomer?.vatId,
      createdAt: originalCustomer?.createdAt || Date.now(),
    } as Customer;
  };

  const exportPDF = async (invoice: Invoice) => {
    const mergedCustomer = getMergedCustomer(invoice);
    if (!mergedCustomer) {
      alert("Kunde nicht gefunden.");
      return;
    }
    const project = projects.find(p => p.id === invoice.projectId);
    
    // Switch to edit view so the DOM element exists
    handleEdit(invoice);
    await new Promise(r => setTimeout(r, 500)); // give it time to render
    await generateInvoicePDF(invoice, mergedCustomer, logo, settings, 'save', project);
  };

  const handlePrint = async (invoice: Invoice) => {
    const mergedCustomer = getMergedCustomer(invoice);
    if (!mergedCustomer) return;
    const project = projects.find(p => p.id === invoice.projectId);
    
    // Switch to edit view
    handleEdit(invoice);
    await new Promise(r => setTimeout(r, 500));
    await generateInvoicePDF(invoice, mergedCustomer, logo, settings, 'print', project);
  };

  const handleEmail = async (invoice: Invoice) => {
    const mergedCustomer = getMergedCustomer(invoice);
    if (!mergedCustomer) return;
    const project = projects.find(p => p.id === invoice.projectId);
    
    handleEdit(invoice);
    await new Promise(r => setTimeout(r, 500));
    await generateInvoicePDF(invoice, mergedCustomer, logo, settings, 'save', project);
    
    const subject = encodeURIComponent(`Rechnung #${invoice.number}`);
    const body = encodeURIComponent(
      `Guten Tag ${mergedCustomer.firstName ? mergedCustomer.firstName + ' ' + (mergedCustomer.lastName || '') : (mergedCustomer.name || '')},\n\n` +
      `anbei erhalten Sie die Rechnung ${invoice.number} als PDF-Dokument.\n\n` +
      `Mit freundlichen Grüßen`
    );
    window.location.href = `mailto:${mergedCustomer.email}?subject=${subject}&body=${body}`;
    showToast('PDF wurde heruntergeladen. Bitte fügen Sie es manuell in Ihrem E-Mail-Programm als Anhang hinzu.', 'success');
  };

  const handleStatusChange = (id: string, newStatus: InvoiceStatus) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: newStatus } : i));
    showToast(`Status auf "${newStatus === 'bezahlt' ? 'Bezahlt' : newStatus === 'ueberfaellig' ? 'Überfällig' : 'Offen'}" geändert`);
  };

  const getDerivedStatus = (invoice: Invoice): InvoiceStatus => {
    if (invoice.status === 'bezahlt') return 'bezahlt';
    if (invoice.status === 'ueberfaellig') return 'ueberfaellig';
    
    // Default fallback to 14 days if dueDate not set on old records
    const dueTime = invoice.dueDate || (invoice.date + 14 * 24 * 60 * 60 * 1000);
    if (Date.now() > dueTime) {
      return 'ueberfaellig';
    }
    
    return invoice.status || 'offen';
  };

  const getStatusStyle = (status: InvoiceStatus) => {
    switch(status) {
      case 'bezahlt': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'ueberfaellig': return 'bg-red-100 text-red-700 hover:bg-red-200';
      case 'offen': 
      default: return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
    }
  };

  if (isEditorLoading) {
    return (
      <div className="flex-1 p-8 flex flex-col justify-center items-center h-full">
         <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
         <h2 className="text-xl font-semibold text-slate-800">Lade Dokumenten-Editor...</h2>
         <p className="text-slate-500 text-sm mt-2">Bitte haben Sie einen Moment Geduld.</p>
      </div>
    );
  }

  if (customers.length === 0 && isCreating) {
    return (
      <div className="bg-card shadow-sm border border-border p-6 rounded-xl text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">Keine Kunden vorhanden</h3>
        <p className="text-slate-500 mb-4">Bitte lege zuerst einen Kunden an, bevor du eine Rechnung erstellst.</p>
        <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 rounded transition-colors shadow-sm font-medium">Zurück</button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Rechnungen</h1>
        {!isCreating && (
          <button 
            onClick={() => { 
              setIsEditorLoading(true);
              setTimeout(() => {
                  const formattedNumber = generateInvoiceNumber();
                  setFormData({ 
                    customerId: customers[0]?.id || '', 
                    number: formattedNumber,
                    date: Date.now(),
                    dueDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
                    items: [{ description: '', quantity: 1, price: 0 }], 
                    applyVat: true, 
                    applyDiscount: false,
                    pricesIncludeVat: false,
                    paymentTermsDays: 14,
                    subject: `Rechnung ${formattedNumber}`,
                    message: 'Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihren Auftrag.\nHiermit stellen wir Ihnen die folgenden Leistungen in Rechnung:'
                  }); 
                  setIsCreating(true); 
                  setIsEditorLoading(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' }); 
              }, 50);
            }}
            className="px-5 py-2.5 rounded-md font-medium text-sm bg-primary shadow-sm text-primary-foreground hover:bg-blue-600 hover:shadow active:scale-95 transition-all duration-200"
          >
            + Neue Rechnung
          </button>
        )}
      </div>

      {isCreating && (
        <LiveInvoiceEditor 
          formData={formData}
          setFormData={setFormData}
          handleSave={handleSave}
          setIsCreating={setIsCreating}
          totals={totals}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          showCustomerDropdown={showCustomerDropdown}
          setShowCustomerDropdown={setShowCustomerDropdown}
          selectCustomer={selectCustomer}
          handleItemChange={handleItemChange}
          handleAddItem={handleAddItem}
          removeItem={removeItem}
          activeProductDropdown={activeProductDropdown}
          setActiveProductDropdown={setActiveProductDropdown}
          handleProductSelect={handleProductSelect}
        />
      )}

      {!isCreating && (
        <div className="bg-card shadow-sm hover:shadow-md border border-border rounded-xl overflow-hidden flex-grow flex flex-col transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-border bg-slate-50 flex justify-between items-center">
            <h3 className="text-base font-semibold text-foreground">Rechnungsliste</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">Nr.</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">Kunde</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">Datum</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">Betrag</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">Status</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                      Keine Rechnungen vorhanden
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => {
                    const customer = customers.find(c => c.id === invoice.customerId);
                    const derivedStatus = getDerivedStatus(invoice);
                    return (
                      <tr key={invoice.id} className="group hover:bg-slate-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm border-b border-border">
                          <div className="font-medium text-foreground">{invoice.number}</div>
                          {invoice.type !== 'Standard' && (
                            <div className="text-[10px] uppercase font-semibold text-primary/70 mt-0.5">
                              {invoice.type} {invoice.partialInvoiceNumber || ''}
                            </div>
                          )}
                          {invoice.projectId && (
                            <div className="text-xs text-slate-500 truncate mt-0.5 max-w-[150px]" title={projects.find(p => p.id === invoice.projectId)?.name}>
                              {projects.find(p => p.id === invoice.projectId)?.name || 'Gelöschtes Projekt'}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-border text-slate-700">{customer?.name || 'Unbekannt'}</td>
                        <td className="px-6 py-4 text-sm border-b border-border text-slate-700">{formatDate(invoice.date, settings.dateFormat)}</td>
                        <td className="px-6 py-4 text-sm font-medium border-b border-border text-slate-700">{formatCurrency(invoice.total, settings.currency)}</td>
                        <td className="px-6 py-4 text-sm border-b border-border">
                          <select 
                            value={derivedStatus}
                            onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border-0 cursor-pointer appearance-none outline-none text-center transform transition-transform active:scale-95 ${getStatusStyle(derivedStatus)}`}
                            title="Status ändern"
                          >
                            <option value="offen">Offen</option>
                            <option value="bezahlt">Bezahlt</option>
                            <option value="ueberfaellig">Überfällig</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm border-b border-border text-right min-w-[200px]">
                          <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-wrap">
                            {derivedStatus !== 'bezahlt' && (
                              <button 
                                onClick={() => {
                                  // Auto-record a payment matching the total
                                  const newPayment = {
                                    id: uuidv4(),
                                    invoiceId: invoice.id,
                                    amount: invoice.total,
                                    date: Date.now(),
                                    method: 'Überweisung', // standard method
                                    note: `Automatische Zahlungserfassung`
                                  };
                                  setPayments([...payments, newPayment]);
                                  handleStatusChange(invoice.id, 'bezahlt');
                                }}
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:scale-95 rounded-md transition-all flex items-center gap-1"
                                title="Schnell als bezahlt markieren"
                              >
                                Bezahlt melden
                              </button>
                            )}
                            <button 
                              onClick={() => handlePrint(invoice)}
                              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-md transition-all flex items-center gap-1"
                              title="Drucken"
                            >
                              <Printer className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleEmail(invoice)}
                              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-md transition-all flex items-center gap-1"
                              title="Per Email senden"
                            >
                              <Mail className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => exportPDF(invoice)}
                              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-md transition-all flex items-center gap-1"
                              title="Als PDF exportieren"
                            >
                              <Download className="w-3 h-3" /> PDF
                            </button>
                            <button 
                              onClick={() => handleEdit(invoice)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 active:scale-95 rounded-md transition-all"
                              title="Rechnung bearbeiten"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(invoice.id, e)}
                              className="text-xs font-medium text-destructive hover:text-destructive px-2 py-1.5 bg-red-50 hover:bg-red-100 active:scale-95 rounded-md transition-all"
                              title="Rechnung löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
