import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { Offer, Customer, Product, LineItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { AlertCircle, ChevronDown, ChevronUp, Save, X, Plus, Trash2, Search, Settings } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface AngebotEditorProps {
  formData: Partial<Offer>;
  setFormData: (data: Partial<Offer>) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  totals: any;
}

export function AngebotEditor({ formData, setFormData, onSave, onCancel, totals }: AngebotEditorProps) {
  const { customers, products, settings } = useAppContext();
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showExtraOptions, setShowExtraOptions] = useState(false);

  // Initialize search input if customer is already selected
  useEffect(() => {
    if (formData.customerId) {
       const c = customers.find(c => c.id === formData.customerId);
       if (c) setCustomerSearch(c.companyName || c.name);
    }
  }, [formData.customerId, customers]);

  const selectCustomer = (customer: Customer) => {
    setCustomerSearch(customer.companyName || customer.name);
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
      country: customer.country || 'Deutschland',
      email: customer.email,
      vatId: customer.vatId,
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), { id: uuidv4(), description: '', quantity: 1, unit: 'Stk.', price: 0, discountPercent: 0, vatRate: formData.vatRate || 19, total: 0 } as LineItem]
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...(formData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: (formData.items || []).filter((_, i) => i !== index) });
  };

  const isCompanyProfileIncomplete = !settings?.companyName || !settings?.companyStreet || (!settings?.companyTaxId && !settings?.companyVatId);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white min-h-screen pb-20 shadow-sm border border-slate-200 rounded-b-xl">
      
      {/* Sticky Header Actions */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
         <h2 className="text-xl font-bold text-slate-800">
            {formData.id ? 'Angebot bearbeiten' : 'Neues Angebot erstellen'}
         </h2>
         <div className="flex items-center gap-3">
            <button onClick={onCancel} type="button" className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2">
               <X className="w-4 h-4" /> Abbrechen
            </button>
            <button onClick={onSave} type="button" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2">
               <Save className="w-4 h-4" /> Speichern
            </button>
         </div>
      </div>

      <div className="p-8 space-y-10">
        
        {/* 1. TOP WARNING BAR */}
        {isCompanyProfileIncomplete && (
           <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3">
                 <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                 <div>
                    <h3 className="text-sm font-bold text-amber-800">Achtung: Fehlende Angaben</h3>
                    <p className="text-sm text-amber-700 mt-1">Ihr Firmenprofil ist unvollständig. Für rechtssichere Dokumente fehlen: {!settings?.companyName && 'Firmenname, '} {!settings?.companyStreet && 'Adresse, '} {(!settings?.companyTaxId && !settings?.companyVatId) && 'Steuer-ID / USt-IdNr.'}</p>
                 </div>
              </div>
              <button onClick={() => window.location.hash = '#einstellungen'} className="shrink-0 px-4 py-2 bg-amber-100 text-amber-800 hover:bg-amber-200 font-semibold text-sm rounded-lg transition-colors flex items-center gap-2">
                 <Settings className="w-4 h-4" /> Einstellungen vervollständigen
              </button>
           </div>
        )}

        {/* 2. CUSTOMER & OFFER INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           
           {/* LEFT: Customer */}
           <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Kunde</h3>
              <div className="relative">
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-4 w-4 text-slate-400" />
                   </div>
                   <input
                     type="text"
                     value={customerSearch}
                     onChange={(e) => {
                       setCustomerSearch(e.target.value);
                       setShowCustomerDropdown(true);
                     }}
                     onFocus={() => setShowCustomerDropdown(true)}
                     onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 250)}
                     placeholder="Kunden suchen oder auswählen..."
                     className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
                   />
                 </div>
                 {showCustomerDropdown && (
                   <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                     {customers.filter(c => (c.name||'').toLowerCase().includes(customerSearch.toLowerCase()) || (c.companyName||'').toLowerCase().includes(customerSearch.toLowerCase())).map((customer: any) => (
                       <button
                         key={customer.id}
                         type="button"
                         onMouseDown={(e) => { e.preventDefault(); selectCustomer(customer); }}
                         className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors"
                       >
                         <div className="font-semibold text-slate-800">{customer.companyName || customer.name}</div>
                         <div className="text-xs text-slate-500 mt-0.5">{customer.street} {customer.houseNumber}, {customer.zipCode} {customer.city}</div>
                       </button>
                     ))}
                     {customers.length === 0 && (
                        <div className="px-4 py-3 text-sm text-slate-500 italic">Keine Kunden gefunden</div>
                     )}
                   </div>
                 )}
              </div>

              {formData.customerId && (
                 <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
                    <input 
                      value={formData.companyName || ''} 
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                      placeholder="Firmenname (Optional)"
                      className="w-full bg-transparent border-b border-transparent focus:border-slate-300 px-1 py-1 text-sm font-semibold outline-none"
                    />
                    <div className="flex gap-2">
                       <input 
                         value={formData.firstName || ''} 
                         onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                         placeholder="Vorname"
                         className="w-full bg-transparent border-b border-transparent focus:border-slate-300 px-1 py-1 text-sm outline-none"
                       />
                       <input 
                         value={formData.lastName || ''} 
                         onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                         placeholder="Nachname"
                         className="w-full bg-transparent border-b border-transparent focus:border-slate-300 px-1 py-1 text-sm outline-none"
                       />
                    </div>
                    <div className="flex gap-2">
                       <input 
                         value={formData.street || ''} 
                         onChange={(e) => setFormData({...formData, street: e.target.value})} 
                         placeholder="Straße"
                         className="w-full bg-transparent border-b border-transparent focus:border-slate-300 px-1 py-1 text-sm outline-none"
                       />
                       <input 
                         value={formData.houseNumber || ''} 
                         onChange={(e) => setFormData({...formData, houseNumber: e.target.value})} 
                         placeholder="Nr."
                         className="w-16 bg-transparent border-b border-transparent focus:border-slate-300 px-1 py-1 text-sm outline-none"
                       />
                    </div>
                    <div className="flex gap-2">
                       <input 
                         value={formData.zipCode || ''} 
                         onChange={(e) => setFormData({...formData, zipCode: e.target.value})} 
                         placeholder="PLZ"
                         className="w-24 bg-transparent border-b border-transparent focus:border-slate-300 px-1 py-1 text-sm outline-none"
                       />
                       <input 
                         value={formData.city || ''} 
                         onChange={(e) => setFormData({...formData, city: e.target.value})} 
                         placeholder="Stadt"
                         className="w-full bg-transparent border-b border-transparent focus:border-slate-300 px-1 py-1 text-sm outline-none"
                       />
                    </div>
                    <input 
                       value={formData.country || ''} 
                       onChange={(e) => setFormData({...formData, country: e.target.value})} 
                       placeholder="Land"
                       className="w-full bg-transparent border-b border-transparent focus:border-slate-300 px-1 py-1 text-sm outline-none text-slate-500"
                    />
                 </div>
              )}
           </div>

           {/* RIGHT: Meta Details */}
           <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Angebotsdetails</h3>
              
              <div className="grid grid-cols-3 items-center gap-4">
                 <label className="text-sm font-medium text-slate-600">Betreff</label>
                 <div className="col-span-2">
                    <input 
                       value={formData.subject || ''} 
                       onChange={(e) => setFormData({...formData, subject: e.target.value})}
                       placeholder="z.B. Angebot über Webdesign"
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                 <label className="text-sm font-medium text-slate-600">Angebotsnummer</label>
                 <div className="col-span-2">
                    <input 
                       value={formData.number || ''} 
                       onChange={(e) => setFormData({...formData, number: e.target.value})}
                       placeholder="Auto-generiert"
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-slate-50 font-medium"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                 <label className="text-sm font-medium text-slate-600">Datum</label>
                 <div className="col-span-2">
                    <input 
                       type="date"
                       value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} 
                       onChange={(e) => setFormData({...formData, date: e.target.value ? new Date(e.target.value).getTime() : undefined})}
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                 <label className="text-sm font-medium text-slate-600">Referenz</label>
                 <div className="col-span-2">
                    <input 
                       value={formData.referenceNumber || ''} 
                       onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
                       placeholder="z.B. PO-10294"
                       className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* 3. HEADER TEXT */}
        <div className="space-y-2">
           <label className="text-sm font-bold text-slate-700">Kopftext</label>
           <textarea 
              value={formData.message !== undefined ? formData.message : "Sehr geehrte Damen und Herren,\nvielen Dank für Ihre Anfrage. Gerne bieten wir Ihnen Folgendes an:"}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full h-24 p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-sans leading-relaxed resize-y"
              placeholder="Einleitungssatz für das Angebot eingeben..."
           />
        </div>

        {/* 4. PRODUKTE / POSITIONEN */}
        <div className="space-y-4">
           <h3 className="text-sm font-bold text-slate-700">Positionen</h3>
           <div className="w-full overflow-x-auto border border-slate-200 rounded-lg shadow-sm">
             <table className="w-full text-left text-sm min-w-[800px]">
               <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                 <tr>
                   <th className="font-semibold py-3 px-4 w-[40%]">Pos. / Beschreibung</th>
                   <th className="font-semibold py-3 px-4 w-[10%] text-right">Menge</th>
                   <th className="font-semibold py-3 px-4 w-[10%]">Einh.</th>
                   <th className="font-semibold py-3 px-4 w-[15%] text-right">Preis</th>
                   <th className="font-semibold py-3 px-4 w-[10%] text-right">USt. %</th>
                   <th className="font-semibold py-3 px-4 w-[10%] text-right">Rabatt %</th>
                   <th className="font-semibold py-3 px-4 w-[15%] text-right">Gesamt</th>
                   <th className="py-3 px-4 w-[5%]"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {formData.items?.map((item: any, index: number) => {
                    const price = Number(item.price) || 0;
                    const qty = Number(item.quantity) || 0;
                    const disc = Number(item.discountPercent) || 0;
                    const vat = Number(item.vatRate ?? formData.vatRate ?? 19);
                    
                    const isGross = formData.pricesIncludeVat;
                    const netPrice = isGross ? price / (1 + vat / 100) : price;
                    const lineNetTotal = netPrice * qty * (1 - disc / 100);

                    return (
                       <tr key={index} className="bg-white hover:bg-slate-50/50 group transition-colors">
                          <td className="p-2 align-top">
                             <div className="flex flex-col gap-2">
                                <div className="relative">
                                  <input 
                                     value={item.description || ''} 
                                     onChange={(e) => {
                                        handleItemChange(index, 'description', e.target.value);
                                        // Activate dropdown whenever typing
                                        if (!item.isProductDropdownOpen) {
                                           handleItemChange(index, 'isProductDropdownOpen', true);
                                        }
                                     }}
                                     onFocus={() => handleItemChange(index, 'isProductDropdownOpen', true)}
                                     onBlur={() => setTimeout(() => handleItemChange(index, 'isProductDropdownOpen', false), 200)}
                                     placeholder="Produkt oder Service"
                                     className="w-full px-2 py-1.5 border border-slate-200 rounded font-medium text-sm outline-none focus:border-blue-500"
                                  />
                                  {item.isProductDropdownOpen && products.length > 0 && (
                                     <div className="absolute z-30 top-full left-0 mt-1 w-[300px] bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {products.filter(p => !item.description || p.name.toLowerCase().includes((item.description).toLowerCase())).map(p => (
                                           <div 
                                              key={p.id}
                                              className="px-3 py-2 border-b border-slate-100 last:border-0 hover:bg-blue-50 cursor-pointer text-sm"
                                              onMouseDown={(e) => {
                                                 e.preventDefault();
                                                 handleItemChange(index, 'description', p.name);
                                                 handleItemChange(index, 'price', p.price);
                                                 handleItemChange(index, 'unit', p.unit || 'Stk.');
                                                 handleItemChange(index, 'isProductDropdownOpen', false);
                                              }}
                                           >
                                              <div className="font-semibold text-slate-800">{p.name}</div>
                                              <div className="text-xs text-slate-500">{formatCurrency(p.price, settings.currency)} / {p.unit}</div>
                                           </div>
                                        ))}
                                        {products.filter(p => !item.description || p.name.toLowerCase().includes((item.description).toLowerCase())).length === 0 && (
                                           <div className="px-3 py-2 text-xs text-slate-500 italic">Keine passenden Produkte</div>
                                        )}
                                     </div>
                                  )}
                                </div>
                             </div>
                          </td>
                          <td className="p-2 align-top">
                             <input 
                                type="number" step="0.01" min="0"
                                value={item.quantity === 0 ? '' : item.quantity} 
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm text-right outline-none focus:border-blue-500"
                             />
                          </td>
                          <td className="p-2 align-top">
                             <input 
                                value={item.unit || ''} 
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                placeholder="Stk."
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm outline-none focus:border-blue-500"
                             />
                          </td>
                          <td className="p-2 align-top">
                             <input 
                                type="number" step="0.01"
                                value={item.price === 0 ? '' : item.price} 
                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm text-right outline-none focus:border-blue-500"
                             />
                          </td>
                          <td className="p-2 align-top">
                             <select 
                                value={item.vatRate ?? formData.vatRate ?? 19} 
                                onChange={(e) => handleItemChange(index, 'vatRate', parseFloat(e.target.value))}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm text-right outline-none focus:border-blue-500 text-slate-600 bg-white"
                             >
                                <option value="19">19%</option>
                                <option value="7">7%</option>
                                <option value="0">0%</option>
                             </select>
                          </td>
                          <td className="p-2 align-top">
                             <input 
                                type="number" step="0.5" min="0" max="100"
                                value={item.discountPercent === 0 ? '' : item.discountPercent} 
                                onChange={(e) => handleItemChange(index, 'discountPercent', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm text-right outline-none focus:border-blue-500 text-slate-600"
                                placeholder="0"
                             />
                          </td>
                          <td className="p-2 align-top font-semibold text-right pt-4 text-slate-800">
                             {formatCurrency(lineNetTotal, settings.currency)}
                          </td>
                          <td className="p-2 align-top text-center pt-3">
                             <button onClick={() => removeItem(index)} className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    );
                 })}
               </tbody>
             </table>
             {(!formData.items || formData.items.length === 0) && (
               <div className="p-8 text-center text-slate-500 bg-slate-50 text-sm">
                 Aktuell sind keine Positionen vorhanden.
               </div>
             )}
             <div className="p-3 bg-slate-50 border-t border-slate-200">
                <button onClick={handleAddItem} type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
                   <Plus className="w-4 h-4" /> Position hinzufügen
                </button>
             </div>
           </div>
        </div>

        {/* 5. FOOTER TEXT */}
        <div className="space-y-2">
           <label className="text-sm font-bold text-slate-700">Fußtext</label>
           <textarea 
              value={formData.paymentNote !== undefined ? formData.paymentNote : "Für Rückfragen stehen wir Ihnen jederzeit gerne zur Verfügung.\nMit freundlichen Grüßen"}
              onChange={(e) => setFormData({ ...formData, paymentNote: e.target.value })}
              className="w-full h-20 p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-sans leading-relaxed resize-y"
              placeholder="Abschlusstext für das Angebot eingeben..."
           />
        </div>

        {/* 6. EXTRA OPTIONS & 7. TOTAL SECTION (Side by side) */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-t border-slate-200 pt-8">
           
           {/* Extra Options */}
           <div className="w-full md:w-1/2 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0">
              <button 
                 onClick={() => setShowExtraOptions(!showExtraOptions)}
                 className="w-full flex justify-between items-center px-4 py-3 bg-slate-100/50 hover:bg-slate-100 transition-colors text-sm font-bold text-slate-700"
              >
                 <span className="flex items-center gap-2"><Settings className="w-4 h-4 text-slate-500" /> Erweiterte Optionen</span>
                 {showExtraOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showExtraOptions && (
                 <div className="p-4 space-y-4">
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Zahlungsbedingungen (Tage)</label>
                       <input 
                         type="number" min="0"
                         value={formData.paymentTermsDays || 14} 
                         onChange={(e) => setFormData({...formData, paymentTermsDays: parseInt(e.target.value) || 0})}
                         className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-blue-500 outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Sprache</label>
                       <select 
                         value={settings.language || 'de'} 
                         disabled
                         className="w-full px-3 py-2 border border-slate-300 rounded text-sm bg-slate-100 text-slate-500 outline-none"
                       >
                         <option value="de">Deutsch (Standard)</option>
                         <option value="en">English</option>
                       </select>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                       <input 
                          type="checkbox" 
                          id="pricesIncludeVat"
                          checked={formData.pricesIncludeVat || false}
                          onChange={(e) => setFormData({...formData, pricesIncludeVat: e.target.checked})}
                          className="w-4 h-4 cursor-pointer"
                       />
                       <label htmlFor="pricesIncludeVat" className="text-sm font-medium text-slate-700 cursor-pointer">
                          Preise am Artikel sind Brutto (inkl. MwSt.)
                       </label>
                    </div>
                 </div>
              )}
           </div>

           {/* Total Section */}
           <div className="w-full md:w-1/3 space-y-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm shrink-0">
              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                 <span>Zwischensumme (Netto)</span>
                 <span>{formatCurrency(totals.subtotal, settings.currency)}</span>
              </div>

              {totals.discountRate > 0 && (
                <div className="flex justify-between items-center text-sm font-medium text-red-500">
                   <span>Rabatt ({totals.discountRate}%)</span>
                   <span>-{formatCurrency(totals.discountAmount, settings.currency)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-medium text-slate-600 border-b border-slate-100 pb-3">
                 <span>zzgl. MwSt.</span>
                 <span>{formatCurrency(totals.vatAmount, settings.currency)}</span>
              </div>

              <div className="flex justify-between items-center text-lg font-extrabold text-slate-900 pt-1">
                 <span>Gesamtbetrag</span>
                 <span>{formatCurrency(totals.total, settings.currency)}</span>
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
