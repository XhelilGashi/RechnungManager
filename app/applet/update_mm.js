import fs from 'fs';

let code = fs.readFileSync('src/components/LiveInvoiceEditor.tsx', 'utf8');

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
             className="invoice-print-area shrink-0 relative bg-white mx-auto font-sans text-slate-800"
             style={{ 
               width: '210mm',
               minHeight: '297mm',
               padding: '10mm',
               boxSizing: 'border-box',
               transform: \`scale($\{zoom / 100})\`, 
               transformOrigin: 'top center',
             }}
          >
             {/* Print Layout Container */}
             <div className="flex flex-col bg-white" style={{ fontFamily: 'Arial, sans-serif', width: '190mm', margin: '0 auto' }}>
                
                {/* Header (Top Level) */}
                <div className="flex justify-between items-start" style={{ marginBottom: '15mm' }}>
                    {/* Left side: Address Window */}
                    <div style={{ marginTop: '5mm', width: '90mm' }}>
                        {/* Sender Line */}
                        <div className="text-[8px] text-slate-500 border-b border-slate-300 inline-block" style={{ paddingBottom: '1mm', marginBottom: '4mm' }}>
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
                    <div className="flex flex-col items-end text-right text-xs leading-relaxed" style={{ width: '90mm' }}>
                        {logo && <img src={logo} alt="Logo" className="object-contain" style={{ width: '45mm', marginBottom: '4mm' }} />}
                        <div className="font-bold text-slate-900 text-sm" style={{ marginBottom: '1mm' }}>{settings?.companyName || 'Ihre Firma'}</div>
                        {(settings?.companyOwnerFirstName || settings?.companyOwnerLastName) && (
                            <div className="text-slate-600" style={{ marginBottom: '2mm' }}>Inh.: {[settings?.companyOwnerFirstName, settings?.companyOwnerLastName].filter(Boolean).join(' ')}</div>
                        )}
                        <div className="text-slate-600" style={{ marginBottom: '2mm' }}>
                            <div>{settings?.companyStreet || 'Musterstraße 1'}</div>
                            <div>{settings?.companyZip || '12345'} {settings?.companyCity || 'Musterstadt'}</div>
                        </div>
                        <div className="text-slate-600">
                            {settings?.companyEmail && <div>{settings.companyEmail}</div>}
                            {settings?.companyPhone && <div>Tel: {settings.companyPhone}</div>}
                            {settings?.companyWebsite && <div>{settings.companyWebsite}</div>}
                            {settings?.companyTaxId && <div style={{ marginTop: '1mm' }}>St.-Nr.: {settings.companyTaxId}</div>}
                        </div>
                    </div>
                </div>

                {/* Document Title & Meta Data */}
                <div style={{ marginBottom: '10mm' }}>
                   <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase" style={{ marginBottom: '6mm' }}>
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
                <div className="text-sm leading-relaxed text-slate-800" style={{ marginBottom: '10mm' }}>
                    {formData.subject && <div className="font-bold text-base" style={{ marginBottom: '4mm' }}>{formData.subject}</div>}
                    {formData.message && <div className="whitespace-pre-wrap">{formData.message}</div>}
                </div>

                {/* Line Items Table */}
                <div style={{ marginBottom: '10mm' }}>
                    <table className="text-sm text-left border-collapse" style={{ width: '190mm', pageBreakInside: 'auto' }}>
                        <thead style={{ display: 'table-header-group' }}>
                            <tr className="border-b-2 border-slate-800" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
                                <th className="font-bold text-slate-900" style={{ width: '15mm', paddingBottom: '2.5mm' }}>Pos.</th>
                                <th className="font-bold text-slate-900" style={{ paddingBottom: '2.5mm' }}>Beschreibung</th>
                                <th className="font-bold text-slate-900 text-right" style={{ width: '25mm', paddingBottom: '2.5mm' }}>Menge</th>
                                <th className="font-bold text-slate-900 text-right" style={{ width: '30mm', paddingBottom: '2.5mm' }}>Einzelpreis</th>
                                {settings?.showItemTaxes !== false && <th className="font-bold text-slate-900 text-right" style={{ width: '20mm', paddingBottom: '2.5mm' }}>USt.</th>}
                                <th className="font-bold text-slate-900 text-right" style={{ width: '30mm', paddingBottom: '2.5mm' }}>Gesamt</th>
                            </tr>
                        </thead>
                        <tbody>
                           {formData.items.length === 0 ? (
                               <tr>
                                   <td colSpan={6} className="text-center text-slate-400 italic" style={{ paddingTop: '8mm', paddingBottom: '8mm' }}>Keine Positionen hinzugefügt</td>
                               </tr>
                           ) : (
                               formData.items.map((item: any, index: number) => {
                                  const price = Number(item.price) || 0;
                                  const qty = Number(item.quantity) || 0;
                                  const disc = Number(item.discount) || 0;
                                  const lineTotal = (price * qty) - disc;
                                  return (
                                     <tr key={index} className="border-b border-slate-200 align-top" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'auto' }}>
                                        <td className="text-slate-500" style={{ paddingTop: '4mm', paddingBottom: '4mm' }}>{index + 1}</td>
                                        <td style={{ paddingTop: '4mm', paddingBottom: '4mm', paddingRight: '4mm' }}>
                                            <div className="font-bold text-slate-900">{item.name || 'Position'}</div>
                                            {item.description && <div className="text-slate-600 text-xs whitespace-pre-wrap leading-relaxed" style={{ marginTop: '1mm' }}>{item.description}</div>}
                                        </td>
                                        <td className="text-right whitespace-nowrap" style={{ paddingTop: '4mm', paddingBottom: '4mm' }}>
                                            {item.quantity} <span className="text-slate-500">{item.unit || 'Stk'}</span>
                                        </td>
                                        <td className="text-right whitespace-nowrap" style={{ paddingTop: '4mm', paddingBottom: '4mm' }}>
                                            {formatCurrency(price, settings?.currency)}
                                            {disc > 0 && <div className="text-slate-500 text-xs" style={{ marginTop: '1mm' }}>abzgl. {formatCurrency(disc, settings?.currency)}</div>}
                                        </td>
                                        {settings?.showItemTaxes !== false && <td className="text-right text-slate-500" style={{ paddingTop: '4mm', paddingBottom: '4mm' }}>{item.vatRate || formData.vatRate || 19}%</td>}
                                        <td className="text-right font-bold whitespace-nowrap text-slate-900" style={{ paddingTop: '4mm', paddingBottom: '4mm' }}>
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
                <div className="flex justify-end" style={{ marginBottom: '16mm', pageBreakInside: 'avoid' }}>
                    <div style={{ width: '90mm' }}>
                        <div className="flex justify-between text-sm text-slate-600" style={{ paddingTop: '2mm', paddingBottom: '2mm' }}>
                            <span>Zwischensumme (Netto)</span>
                            <span>{formatCurrency(totals.subtotal, settings?.currency)}</span>
                        </div>
                        {totals.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-red-600" style={{ paddingTop: '2mm', paddingBottom: '2mm' }}>
                                <span>Rabatt</span>
                                <span>-{formatCurrency(totals.discountAmount, settings?.currency)}</span>
                            </div>
                        )}
                        {Object.entries(totals.calculatedItems.reduce((acc: any, item: any) => {
                           if (!acc[item.vatRate]) acc[item.vatRate] = 0;
                           acc[item.vatRate] += item.vatAmount;
                           return acc;
                        }, {})).map(([rate, amount]: [string, any]) => amount > 0 && (
                           <div key={rate} className="flex justify-between text-sm text-slate-600" style={{ paddingTop: '2mm', paddingBottom: '2mm' }}>
                              <span>zzgl. {rate}% USt.</span>
                              <span>{formatCurrency(amount, settings?.currency)}</span>
                           </div>
                        ))}
                        <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900" style={{ paddingTop: '3mm', marginTop: '2mm' }}>
                            <span>Gesamtbetrag</span>
                            <span>{formatCurrency(totals.total, settings?.currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes & Bank Details (Footer) */}
                <div className="text-sm border-t border-slate-200" style={{ marginTop: '8mm', paddingTop: '6mm', pageBreakInside: 'avoid' }}>
                    <div className="flex justify-between items-start text-slate-800" style={{ marginBottom: '6mm' }}>
                        <div style={{ width: '120mm', paddingRight: '8mm' }}>
                            <div className="font-bold text-slate-900" style={{ marginBottom: '1mm' }}>Zahlungsbedingungen</div>
                            <div className="leading-relaxed">
                                {formData.paymentTermsDays 
                                   ? \`Zahlbar innerhalb von \${formData.paymentTermsDays} Tagen ohne Abzug.\` 
                                   : 'Zahlbar sofort nach Erhalt ohne Abzug.'}
                            </div>
                            <div className="text-slate-500" style={{ marginTop: '1mm' }}>Fällig am: {formatDate(formData.dueDate || Date.now() + 14 * 24 * 60 * 60 * 1000, settings?.dateFormat)}</div>
                            
                            {formData.paymentNote && <div className="whitespace-pre-wrap leading-relaxed" style={{ marginTop: '4mm' }}>{formData.paymentNote}</div>}
                        </div>
                        <div className="text-right text-slate-500 font-medium italic" style={{ width: '60mm' }}>
                            Vielen Dank für Ihren Auftrag!
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-100 font-sans" style={{ paddingTop: '5mm' }}>
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

const newCode = code.slice(0, invoiceStart) + newInvoiceHTML + code.slice(invoiceEnd);
fs.writeFileSync('src/components/LiveInvoiceEditor.tsx', newCode, 'utf8');
console.log("Successfully updated LiveInvoiceEditor.tsx to use mm!");
