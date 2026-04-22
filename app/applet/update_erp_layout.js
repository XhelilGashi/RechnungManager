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
             className="invoice-print-area shrink-0 relative bg-white mx-auto font-sans text-slate-900"
             style={{ 
               width: '210mm',
               minHeight: '297mm',
               boxSizing: 'border-box',
               transform: \`scale($\{zoom / 100})\`, 
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
                        {settings?.companyStreet ? \` • \${settings.companyStreet}\` : ''}
                        {settings?.companyZip || settings?.companyCity ? \` • \${settings.companyZip} \${settings.companyCity}\` : ''}
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
                               ? \`Zahlbar innerhalb von \${formData.paymentTermsDays} Tagen ohne Abzug.\` 
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

        `;

const newCode = code.slice(0, invoiceStart) + newInvoiceHTML + code.slice(invoiceEnd);
fs.writeFileSync('src/components/LiveInvoiceEditor.tsx', newCode, 'utf8');
console.log("Successfully updated LiveInvoiceEditor.tsx to ERP layout!");
