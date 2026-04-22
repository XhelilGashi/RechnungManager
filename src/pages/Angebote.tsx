import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Offer, Customer, Product, LineItem, Invoice } from '../types';
import { Plus, Trash2, Download, Search, FileText, ArrowRightLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { generateInvoicePDF } from '../lib/pdf';
import { LiveInvoiceEditor } from '../components/LiveInvoiceEditor';

export function Angebote() {
  const { offers, setOffers, invoices, setInvoices, customers, settings, logo, projects, showToast } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Live Editor state
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [activeProductDropdown, setActiveProductDropdown] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<Offer>>({
    customerId: '', items: []
  });

  const selectCustomer = (customer: Customer) => {
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    setFormData({
      ...formData, 
      customerId: customer.id,
      companyName: customer.companyName,
      firstName: customer.firstName,
      lastName: customer.lastName,
      street: customer.street,
      houseNumber: customer.houseNumber,
      zipCode: customer.zipCode,
      city: customer.city,
      country: customer.country,
      email: customer.email,
      vatId: customer.vatId,
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), { id: uuidv4(), description: '', quantity: 1, unit: 'Stück', price: 0, total: 0 } as LineItem]
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleProductSelect = (index: number, product: Product) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { 
      ...newItems[index], 
      name: product.name,
      price: product.price,
      unit: product.unit || 'Stück',
      vatRate: product.vatRate || 19
    };
    setFormData({ ...formData, items: newItems });
    setActiveProductDropdown(null);
  };

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: (formData.items || []).filter((_, i) => i !== index) });
  };

  const totals = useMemo(() => {
    if (!formData.items) return { subtotal: 0, vatRate: 19, vatAmount: 0, subtotalWithVat: 0, discountRate: 0, discountAmount: 0, total: 0, calculatedItems: [] };

    let subtotal = 0;
    let totalVatAmount = 0;

    const calculatedItems = formData.items.map((item: any) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.price || 0;
      const itemVatRate = item.vatRate !== undefined ? item.vatRate : (formData.vatRate !== undefined ? formData.vatRate : 19);
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
        vatRate: itemVatRate,
        vatAmount: itemVatAmount,
        total: itemDiscountedNetTotal
      };
    });

    const subtotalWithVat = subtotal + totalVatAmount;
    
    // Global discount
    const discountRate = formData.discountRate || 0;
    const globalDiscountAmount = subtotalWithVat * (discountRate / 100);
    
    const total = subtotalWithVat - globalDiscountAmount;
    
    return { 
      subtotal, 
      vatRate: formData.vatRate !== undefined ? formData.vatRate : 19, 
      vatAmount: totalVatAmount, 
      subtotalWithVat, 
      discountRate, 
      discountAmount: globalDiscountAmount, 
      total,
      pricesIncludeVat: formData.pricesIncludeVat,
      calculatedItems
    };
  }, [formData]);

  const generateOfferNumber = () => {
    const nextNum = offers.length + 1;
    return `ANG-${new Date().getFullYear()}-${nextNum.toString().padStart(3, '0')}`;
  };

  const generateInvoiceNumber = () => {
    const nextNum = invoices.length + 1;
    return `RE-${new Date().getFullYear()}-${nextNum.toString().padStart(3, '0')}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.items || formData.items.length === 0) return;

    const offerDate = formData.date || Date.now();

    const offerPayload: Offer = {
      ...(formData as Offer),
      id: formData.id || uuidv4(),
      number: formData.number || generateOfferNumber(),
      date: offerDate,
      status: formData.status || 'Entwurf',
      items: formData.items.map(item => ({
        ...item,
        id: item.id || uuidv4(),
        total: item.quantity * item.price
      })),
      subtotal: totals.subtotal,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      discountRate: totals.discountRate,
      discountAmount: totals.discountAmount,
      total: totals.total
    };

    if (formData.id) {
       setOffers(offers.map(o => o.id === formData.id ? offerPayload : o));
       showToast('Angebot aktualisiert', 'success');
    } else {
       setOffers([offerPayload, ...offers]);
       showToast('Angebot erstellt', 'success');
    }
    
    setIsCreating(false);
  };

  const convertToInvoice = (offer: Offer, e: React.MouseEvent) => {
      e.stopPropagation();
      
      const newInvoice: Invoice = {
          ...offer,
          id: uuidv4(),
          number: generateInvoiceNumber(),
          date: Date.now(),
          status: 'offen',
          type: 'Standard',
          vatRate: offer.vatRate || 19,
          vatAmount: offer.vatAmount || 0
      };

      setInvoices([newInvoice, ...invoices]);
      
      // Update offer status to Accepted if it gets converted
      setOffers(offers.map(o => o.id === offer.id ? { ...o, status: 'Angenommen' } : o));
      
      showToast('Erfolgreich zu Rechnung konvertiert!', 'success');
  };

  const openEditor = (offer?: Offer) => {
     setIsEditorLoading(true);
     // Simulate slight delay to allow React to paint loading spinner instead of freezing
     setTimeout(() => {
         if(offer) {
            setFormData(offer);
            const c = customers.find(c => c.id === offer.customerId);
            setCustomerSearch(c ? (c.companyName || c.name) : '');
         } else {
            setFormData({ 
               id: '',
               customerId: customers[0]?.id || '', 
               items: [{ id: uuidv4(), description: '', quantity: 1, unit: 'Stück', price: 0, total: 0 }],
               vatRate: 19,
               status: 'Entwurf'
            });
            const firstCust = customers[0];
            if (firstCust) {
               setCustomerSearch(firstCust.companyName || firstCust.name || '');
               setFormData(prev => ({
                  ...prev,
                  companyName: firstCust.companyName,
                  firstName: firstCust.firstName,
                  lastName: firstCust.lastName,
                  street: firstCust.street,
                  houseNumber: firstCust.houseNumber,
                  zipCode: firstCust.zipCode,
                  city: firstCust.city,
                  country: firstCust.country,
                  email: firstCust.email,
                  vatId: firstCust.vatId
               }));
            }
         }
         setIsCreating(true);
         setIsEditorLoading(false);
         window.scrollTo({ top: 0, behavior: 'smooth' });
     }, 50);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Angebot wirklich löschen?")) {
      setOffers(offers.filter(o => o.id !== id));
      showToast('Angebot gelöscht', 'success');
    }
  };

  const handleUpdateStatus = (id: string, status: Offer['status'], e?: React.MouseEvent) => {
    if(e) e.stopPropagation();
    setOffers(offers.map(o => o.id === id ? { ...o, status } : o));
    showToast(`Status auf ${status} geändert`, 'success');
  };

  const exportPDF = (offer: Offer, e: React.MouseEvent) => {
    e.stopPropagation();
    const customer = customers.find(c => c.id === offer.customerId);
    if (!customer) return;
    const proj = projects.find(p => p.id === offer.projectId);
    
    // Switch to edit view so the DOM element exists
    openEditor(offer);
    
    setTimeout(() => {
        const tempOffer = {...offer, type: 'ANGEBOT'} as any; 
        generateInvoicePDF(tempOffer, customer, logo, settings, 'save', proj);
    }, 500);
  };

  const filteredOffers = offers.filter(o => {
     const custMatch = customers.find(c => c.id === o.customerId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
     const numMatch = o.number.toLowerCase().includes(searchTerm.toLowerCase());
     return custMatch || numMatch;
  });

  if (isEditorLoading) {
     return (
       <div className="flex-1 p-8 flex flex-col justify-center items-center h-full">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-800">Lade Dokumenten-Editor...</h2>
          <p className="text-slate-500 text-sm mt-2">Bitte haben Sie einen Moment Geduld.</p>
       </div>
     );
  }

  if (isCreating) {
     return (
        <LiveInvoiceEditor 
          documentType="offer"
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
     )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Angebote</h1>
           <p className="text-sm text-slate-500">Erstellen und verwalten Sie Angebote für Ihre Kunden.</p>
        </div>
        <button 
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm bg-blue-600 shadow-sm text-white hover:bg-blue-700 hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Neues Angebot
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Angebote durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="font-semibold py-3 px-4">Angebotsnr.</th>
                <th className="font-semibold py-3 px-4">Datum</th>
                <th className="font-semibold py-3 px-4">Kunde</th>
                <th className="font-semibold py-3 px-4 text-right">Betrag</th>
                <th className="font-semibold py-3 px-4 text-center">Status</th>
                <th className="font-semibold py-3 px-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-600">Keine Angebote gefunden</p>
                      <p className="text-sm">Erstelle dein erstes Angebot, um loszulegen.</p>
                      <button onClick={() => openEditor()} className="mt-4 text-blue-600 font-medium hover:underline">
                        Neues Angebot erstellen
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => {
                  const customer = customers.find(c => c.id === offer.customerId);
                  return (
                    <tr 
                      key={offer.id} 
                      onClick={() => openEditor(offer)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">{offer.number}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(offer.date, settings.dateFormat)}</td>
                      <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">{customer?.companyName || customer?.name || 'Unbekannt'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-right">{formatCurrency(offer.total, settings.currency)}</td>
                      <td className="py-3 px-4 text-center">
                        <select
                           value={offer.status || 'Entwurf'}
                           onChange={(e) => handleUpdateStatus(offer.id, e.target.value as Offer['status'], e as any)}
                           onClick={(e) => e.stopPropagation()}
                           className={`text-xs font-semibold px-2 py-1 rounded-full outline-none border focus:ring-2 focus:ring-blue-500 ${
                             offer.status === 'Angenommen' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                             offer.status === 'Abgelehnt' ? 'bg-red-100 text-red-700 border-red-200' :
                             offer.status === 'Gesendet' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                             'bg-slate-100 text-slate-700 border-slate-200'
                           }`}
                        >
                           <option value="Entwurf">Entwurf</option>
                           <option value="Gesendet">Gesendet</option>
                           <option value="Angenommen">Angenommen</option>
                           <option value="Abgelehnt">Abgelehnt</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          
                          <button 
                            onClick={(e) => convertToInvoice(offer, e)}
                            className="p-1.5 md:p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded flex items-center justify-center"
                            title="In Rechnung umwandeln"
                          >
                            <ArrowRightLeft className="w-5 h-5 md:w-4 md:h-4" />
                          </button>

                          <button 
                            onClick={(e) => exportPDF(offer, e)}
                            className="p-1.5 md:p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="PDF Herunterladen"
                          >
                            <Download className="w-5 h-5 md:w-4 md:h-4" />
                          </button>
                          
                          <button 
                            onClick={(e) => handleDelete(offer.id, e)} 
                            className="p-1.5 md:p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Löschen"
                          >
                            <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
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
    </>
  );
}
