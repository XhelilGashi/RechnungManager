const fs = require('fs');

const code = fs.readFileSync('src/components/LiveInvoiceEditor.tsx', 'utf8');

const invoiceStart = code.indexOf('<div \n             ref={containerRef} \n             id="invoice"');
if (invoiceStart === -1) {
    console.error("Could not find start");
    process.exit(1);
}

const invoiceEndStr = '{/* Left: Input Form Sidebar */}';
const invoiceEnd = code.indexOf(invoiceEndStr, invoiceStart);
if (invoiceEnd === -1) {
    console.error("Could not find end");
    process.exit(1);
}

const newInvoiceHTML = `
          <div 
             ref={containerRef} 
             id="invoice" 
             className="invoice-print-area shrink-0 w-[794px] min-h-[1123px] relative bg-white shadow-2xl mx-auto overflow-hidden font-sans text-slate-800"
             style={{ 
               transform: \`scale($\{zoom / 100})\`, 
               transformOrigin: 'top center',
             }}
          >
             {/* Print Layout Container */}
             <div className="pt-16 pr-16 pl-16 pb-16 min-h-full flex flex-col bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
                
                {/* Header (Top Level) */}
                <div className="flex justify-between items-start mb-16">
                    {/* Left side: Address Window */}
                    <div className="mt-8 w-1/2">
                        {/* Sender Line */}
                        <div className="text-[8px] text-slate-500 mb-4 border-b border-slate-300 inline-block pb-0.5">
                            {settings?.companyName || 'Ihre Firma'} 
                            {settings?.companyStreet ? \` • \${settings.companyStreet}\` : ''}
                            {settings?.companyZip || settings?.companyCity ? \` • \${settings.companyZip} \${settings.companyCity}\` : ''}
                        </div>
                        
                        {/* Receiver Address */}
                        <div className="text-sm leading-relaxed text-slate-900 mt-2">
                           {formData.companyName && <div className="font-bold">{formData.companyName}</div>}
                           {(!formData.companyName && (formData.firstName || formData.lastName)) && <div className="font-bold">{[formData.firstName, formData.lastName].filter(Boolean).join(' ')}</div>}
                           {(formData.companyName && (formData.firstName || formData.lastName)) && <div>{[formData.firstName, formData.lastName].filter(Boolean).join(' ')}</div>}
                           <div>{[formData.street, formData.houseNumber].filter(Boolean).join(' ')}</div>
                           <div>{formData.zipCode} {formData.city}</div>
                           {formData.country && formData.country !== 'Deutschland' && <div className="mt-1 font-bold uppercase text-slate-700">{formData.country}</div>}
                        </div>
                    </div>

                    {/* Right side: Company Details */}
                    <div className="w-1/2 flex flex-col items-end text-right text-xs leading-relaxed">
                        {logo && <img src={logo} alt="Logo" className="w-40 object-contain mb-4" />}
                        <div className="font-bold text-slate-900 text-sm mb-1">{settings?.companyName || 'Ihre Firma'}</div>
                        {(settings?.companyOwnerFirstName || settings?.companyOwnerLastName) && (
                            <div className="text-slate-600 mb-2">Inh.: {[settings?.companyOwnerFirstName, settings?.companyOwnerLastName].filter(Boolean).join(' ')}</div>
                        )}
                        <div className="text-slate-600 mb-2">
                            <div>{settings?.companyStreet || 'Musterstraße 1'}</div>
                            <div>{settings?.companyZip || '12345'} {settings?.companyCity || 'Musterstadt'}</div>
                        </div>
                        <div className="text-slate-600">
                            {settings?.companyEmail && <div>{settings.companyEmail}</div>}
                            {settings?.companyPhone && <div>Tel: {settings.companyPhone}</div>}
                            {settings?.companyWebsite && <div>{settings.companyWebsite}</div>}
                            {settings?.companyTaxId && <div className="mt-1">St.-Nr.: {settings.companyTaxId}</div>}
                        </div>
                    </div>
                </div>

                {/* Document Title & Meta Data */}
                <div className="mb-10">
                   <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase mb-6">
                       {formData.type || (documentType === 'offer' ? 'ANGEBOT' : 'RECHNUNG')}
                       {(formData.type === 'Teilrechnung' || formData.type === 'Schlussrechnung') && formData.partialInvoiceNumber && (
                           <span className="text-xl ml-4 font-normal text-slate-500">Nr. {formData.partialInvoiceNumber}</span>
                       )}
                   </h1>
                   
                   {/* Meta Grid */}
                   <div className="flex gap-12 text-sm">
                      <div>
                         <div className="text-slate-500 text-xs mb-1">Datum</div>
                         <div className="text-slate-900 font-medium">{formatDate(formData.date, settings?.dateFormat)}</div>
                      </div>
                      <div>
                         <div className="text-slate-500 text-xs mb-1">{documentType === 'offer' ? 'Angebotsnummer' : 'Rechnungsnummer'}</div>
                         <div className="text-slate-900 font-medium">{formData.number || 'ENTWURF'}</div>
                      </div>
                      {formData.customerId && (
                         <div>
                            <div className="text-slate-500 text-xs mb-1">Kundennummer</div>
                            <div className="text-slate-900 font-medium">{customers.find(c => c.id === formData.customerId)?.id.substring(0,6).toUpperCase() || 'KD-1002'}</div>
                         </div>
                      )}
                      {(formData.servicePeriodStart || formData.servicePeriodEnd) && (
                         <div>
                            <div className="text-slate-500 text-xs mb-1">Leistungszeitraum</div>
                            <div className="text-slate-900 font-medium">
                               {formData.servicePeriodStart ? formatDate(formData.servicePeriodStart, settings?.dateFormat) : '...'} - {formData.servicePeriodEnd ? formatDate(formData.servicePeriodEnd, settings?.dateFormat) : '...'}
                            </div>
                         </div>
                      )}
                   </div>
                </div>

                {/* Subjet & Message */}
                <div className="mb-10 text-sm leading-relaxed text-slate-800">
                    {formData.subject && <div className="font-bold mb-4 text-base">{formData.subject}</div>}
                    {formData.message && <div className="whitespace-pre-wrap">{formData.message}</div>}
                </div>

                {/* Line Items Table */}
                <div className="mb-10">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-800">
                                <th className="py-2.5 font-bold text-slate-900 w-[10%]">Pos.</th>
                                <th className="py-2.5 font-bold text-slate-900">Beschreibung</th>
                                <th className="py-2.5 font-bold text-slate-900 text-right w-[15%]">Menge</th>
                                <th className="py-2.5 font-bold text-slate-900 text-right w-[15%]">Einzelpreis</th>
                                {settings?.showItemTaxes !== false && <th className="py-2.5 font-bold text-slate-900 text-right w-[10%]">USt.</th>}
                                <th className="py-2.5 font-bold text-slate-900 text-right w-[15%]">Gesamt</th>
                            </tr>
                        </thead>
                        <tbody>
                           {formData.items.length === 0 ? (
                               <tr>
                                   <td colSpan={6} className="py-8 text-center text-slate-400 italic">Keine Positionen hinzugefügt</td>
                               </tr>
                           ) : (
                               formData.items.map((item: any, index: number) => {
                                  const price = Number(item.price) || 0;
                                  const qty = Number(item.quantity) || 0;
                                  const disc = Number(item.discount) || 0;
                                  const lineTotal = (price * qty) - disc;
                                  return (
                                     <tr key={index} className="border-b border-slate-200 align-top">
                                        <td className="py-4 text-slate-500">{index + 1}</td>
                                        <td className="py-4 pr-4">
                                            <div className="font-bold text-slate-900">{item.name || 'Position'}</div>
                                            {item.description && <div className="text-slate-600 text-xs mt-1 whitespace-pre-wrap leading-relaxed">{item.description}</div>}
                                        </td>
                                        <td className="py-4 text-right whitespace-nowrap">
                                            {item.quantity} <span className="text-slate-500">{item.unit || 'Stk'}</span>
                                        </td>
                                        <td className="py-4 text-right whitespace-nowrap">
                                            {formatCurrency(price, settings?.currency)}
                                            {disc > 0 && <div className="text-slate-500 text-xs mt-1">abzgl. {formatCurrency(disc, settings?.currency)}</div>}
                                        </td>
                                        {settings?.showItemTaxes !== false && <td className="py-4 text-right text-slate-500">{item.vatRate || formData.vatRate || 19}%</td>}
                                        <td className="py-4 text-right font-bold whitespace-nowrap text-slate-900">
                                            {formatCurrency(lineTotal, settings?.currency)}
                                        </td>
                                     </tr>
                                  );
                               })
                           )}
                        </tbody>
                    </table>
                </div>

                {/* Totals Box */}
                <div className="flex justify-end mb-16">
                    <div className="w-[50%]">
                        <div className="flex justify-between py-2 text-sm text-slate-600">
                            <span>Zwischensumme (Netto)</span>
                            <span>{formatCurrency(totals.subtotal, settings?.currency)}</span>
                        </div>
                        {totals.discountAmount > 0 && (
                            <div className="flex justify-between py-2 text-sm text-red-600">
                                <span>Rabatt</span>
                                <span>-{formatCurrency(totals.discountAmount, settings?.currency)}</span>
                            </div>
                        )}
                        {Object.entries(totals.calculatedItems.reduce((acc: any, item: any) => {
                           if (!acc[item.vatRate]) acc[item.vatRate] = 0;
                           acc[item.vatRate] += item.vatAmount;
                           return acc;
                        }, {})).map(([rate, amount]: [string, any]) => amount > 0 && (
                           <div key={rate} className="flex justify-between py-2 text-sm text-slate-600">
                              <span>zzgl. {rate}% USt.</span>
                              <span>{formatCurrency(amount, settings?.currency)}</span>
                           </div>
                        ))}
                        <div className="flex justify-between py-3 mt-2 text-base font-bold text-slate-900 border-t-2 border-slate-900">
                            <span>Gesamtbetrag</span>
                            <span>{formatCurrency(totals.total, settings?.currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Dynamic Footer spacer so content pushes footer down */}
                <div className="flex-grow"></div>

                {/* Notes & Bank Details (Footer) */}
                <div className="mt-8 text-sm border-t border-slate-200 pt-6">
                    <div className="flex justify-between items-start mb-6 text-slate-800">
                        <div className="w-2/3 pr-8">
                            <div className="font-bold mb-1 text-slate-900">Zahlungsbedingungen</div>
                            <div className="leading-relaxed">
                                {formData.paymentTermsDays 
                                   ? \`Zahlbar innerhalb von \${formData.paymentTermsDays} Tagen ohne Abzug.\` 
                                   : 'Zahlbar sofort nach Erhalt ohne Abzug.'}
                            </div>
                            <div className="mt-1 text-slate-500">Fällig am: {formatDate(formData.dueDate || Date.now() + 14 * 24 * 60 * 60 * 1000, settings?.dateFormat)}</div>
                            
                            {formData.paymentNote && <div className="mt-4 whitespace-pre-wrap leading-relaxed">{formData.paymentNote}</div>}
                        </div>
                        <div className="w-1/3 text-right text-slate-500 font-medium italic">
                            Vielen Dank für Ihren Auftrag!
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-5 border-t border-slate-100 font-sans">
                        {settings?.companyBankName && <div><span className="font-semibold text-slate-500">Bank:</span> {settings.companyBankName}</div>}
                        {settings?.companyIban && <div><span className="font-semibold text-slate-500">IBAN:</span> {settings.companyIban}</div>}
                        {settings?.companyBic && <div><span className="font-semibold text-slate-500">BIC:</span> {settings.companyBic}</div>}
                        {settings?.companyTaxId && <div><span className="font-semibold text-slate-500">St.-Nr.:</span> {settings.companyTaxId}</div>}
                    </div>
                </div>

             </div>
          </div>
        </div>

        `;

// Replace
const newCode = code.slice(0, invoiceStart) + newInvoiceHTML + code.slice(invoiceEnd);

// Also remove `import { Rnd } from 'react-rnd';`
const cleanedCode = newCode.replace("import { Rnd } from 'react-rnd';\n", "");

fs.writeFileSync('src/components/LiveInvoiceEditor.tsx', cleanedCode, 'utf8');
console.log("Successfully updated LiveInvoiceEditor.tsx");

