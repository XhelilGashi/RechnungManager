const fs = require('fs');

function replaceBlock() {
    const filePath = 'src/components/LiveInvoiceEditor.tsx';
    let content = fs.readFileSync(filePath, 'utf8');

    const startStr = '          <div className="flex justify-between items-start mb-16">';
    const endStr = '          {/* Subject & Message */}';
    
    const startIdx = content.indexOf(startStr);
    const endIdx = content.indexOf(endStr);
    
    if (startIdx === -1 || endIdx === -1) {
        console.log("Could not find start or end block");
        process.exit(1);
    }

    const replacement = `          <div className="flex justify-between items-start mb-12">
            {/* Left: Customer Data & Invoice Details */}
            <div className="w-[55%] pr-8 flex flex-col gap-10">
              {/* Customer Data */}
              <div>
                {!formData.customerId ? (
                  <div className="bg-blue-50/50 p-5 border border-blue-100 rounded-lg">
                    <label className="block text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">Kunde auswählen</label>
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
                        className="w-full bg-white border border-blue-200 rounded-md px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                      {showCustomerDropdown && customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-48 overflow-y-auto">
                          {customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map(customer => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => selectCustomer(customer)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 focus:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                            >
                              <div className="font-medium text-slate-800">{customer.name}</div>
                              <div className="text-xs text-slate-500 truncate">{customer.address.replace(/\\n/g, ', ')}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute -inset-4 bg-slate-50 border border-slate-200 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rechnungsempfänger</span>
                        <button onClick={() => setFormData({...formData, customerId: ''})} className="text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">Kunde ändern</button>
                      </div>
                      <input 
                        value={formData.companyName} 
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
                        className="font-bold text-lg w-full outline-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -ml-1 transition-colors" 
                        placeholder="Firmenname" 
                      />
                      <div className="flex gap-2 mt-1">
                        <input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full text-sm outline-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -ml-1 transition-colors" placeholder="Vorname" />
                        <input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full text-sm outline-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -ml-1 transition-colors" placeholder="Nachname" />
                      </div>
                      <div className="flex gap-2">
                        <input value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="w-full text-sm outline-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -ml-1 transition-colors" placeholder="Straße" />
                        <input value={formData.houseNumber} onChange={(e) => setFormData({...formData, houseNumber: e.target.value})} className="w-16 text-sm outline-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -ml-1 transition-colors" placeholder="Nr." />
                      </div>
                      <div className="flex gap-2">
                        <input value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="w-20 text-sm outline-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -ml-1 transition-colors" placeholder="PLZ" />
                        <input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full text-sm outline-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 -ml-1 transition-colors" placeholder="Stadt" />
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        USt-IdNr.: <input value={formData.vatId} onChange={(e) => setFormData({...formData, vatId: e.target.value})} className="w-32 outline-none bg-transparent hover:bg-white focus:bg-white focus:ring-1 focus:ring-slate-200 rounded px-1 transition-colors" placeholder="(Optional)" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Invoice Metadata (Moved to Left Column) */}
              <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                <div className="mb-6 border-b border-slate-200 pb-4">
                  <select
                    value={formData.type || 'Standard'}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full font-bold text-3xl uppercase tracking-wider text-slate-900 bg-transparent outline-none appearance-none cursor-pointer hover:text-blue-600 transition-colors p-0 m-0"
                  >
                    <option value="Standard">RECHNUNG</option>
                    <option value="Teilrechnung">TEILRECHNUNG</option>
                    <option value="Schlussrechnung">SCHLUSSRECHNUNG</option>
                  </select>
                  {(formData.type === 'Teilrechnung' || formData.type === 'Schlussrechnung') && (
                     <div className="flex items-center mt-2 gap-2">
                       <span className="text-xs text-slate-500 font-semibold uppercase">Nr.</span>
                       <input type="number" min="1" value={formData.partialInvoiceNumber || ''} onChange={(e) => setFormData({...formData, partialInvoiceNumber: e.target.value ? parseInt(e.target.value) : undefined})} className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-400" placeholder="-" />
                     </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div className="flex flex-col group">
                    <span className="text-slate-500 text-xs mb-1">Rechnungs-Nr.</span>
                    <input value={formData.number || ''} onChange={(e) => setFormData({...formData, number: e.target.value})} className="font-semibold text-slate-800 bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-400 outline-none transition-colors px-1 -mx-1" placeholder="RE-2026-001" />
                  </div>
                  <div className="flex flex-col group">
                    <span className="text-slate-500 text-xs mb-1">Datum</span>
                    <input type="date" value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, date: new Date(e.target.value).getTime()})} className="text-slate-800 bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-400 outline-none transition-colors px-1 -mx-1" />
                  </div>
                  <div className="flex flex-col group">
                    <span className="text-slate-500 text-xs mb-1">Liefer-/Leistungsdatum</span>
                    <input type="date" value={formData.deliveryDate ? new Date(formData.deliveryDate).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, deliveryDate: e.target.value ? new Date(e.target.value).getTime() : undefined})} className="text-slate-800 bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-400 outline-none transition-colors px-1 -mx-1" placeholder="Optional" />
                  </div>
                  <div className="flex flex-col group">
                    <span className="text-slate-500 text-xs mb-1">Referenz-Nr.</span>
                    <input value={formData.referenceNumber || ''} onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})} className="text-slate-800 bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-400 outline-none transition-colors px-1 -mx-1" placeholder="Optional" />
                  </div>
                </div>
                
                {/* Project Selection */}
                <div className="mt-5 pt-4 border-t border-slate-200">
                  <div className="flex flex-col group mb-4">
                     <span className="text-slate-500 text-xs mb-1">Projekt</span>
                     <select value={formData.projectId || ''} onChange={(e) => setFormData({...formData, projectId: e.target.value})} className="text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-400 outline-none text-sm px-1 -mx-1">
                       <option value="">Kein Projekt zugewiesen</option>
                       {projects.filter(p => p.customerId === formData.customerId).map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                       ))}
                     </select>
                  </div>
                  {(formData.type === 'Teilrechnung' || formData.type === 'Schlussrechnung') && (
                      <div className="flex flex-col group">
                         <span className="text-slate-500 text-xs mb-1">Leistungszeitraum</span>
                         <div className="flex items-center gap-2">
                           <input type="date" value={formData.servicePeriodStart ? new Date(formData.servicePeriodStart).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, servicePeriodStart: e.target.value ? new Date(e.target.value).getTime() : undefined})} className="w-[120px] text-sm text-slate-800 bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-400 outline-none px-1 -mx-1" />
                           <span className="text-slate-400">-</span>
                           <input type="date" value={formData.servicePeriodEnd ? new Date(formData.servicePeriodEnd).toISOString().split('T')[0] : ''} onChange={(e) => setFormData({...formData, servicePeriodEnd: e.target.value ? new Date(e.target.value).getTime() : undefined})} className="w-[120px] text-sm text-slate-800 bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-blue-400 outline-none px-1 -mx-1" />
                         </div>
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Company Logo & Info */}
            <div className="w-[45%] flex flex-col items-end text-sm leading-relaxed text-slate-800 pl-8">
              {logo && <img src={logo} className="h-20 object-contain mb-6" alt="Company Logo" />}
              <div className="font-bold text-base text-slate-900 mb-1">{settings?.companyName || 'Dein Firmenname'}</div>
              <div>{settings?.companyStreet}</div>
              <div className="mb-3">{settings?.companyZip} {settings?.companyCity}</div>
              
              <div className="text-slate-500 space-y-1 text-right">
                {settings?.companyEmail && <div>{settings?.companyEmail}</div>}
                {settings?.companyPhone && <div>Tel: {settings?.companyPhone}</div>}
                {settings?.companyWebsite && <div>{settings?.companyWebsite}</div>}
              </div>
            </div>
          </div>\n\n`;

    const newContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Successfully replaced block");
}

replaceBlock();
