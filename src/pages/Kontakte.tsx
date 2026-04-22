import React from 'react';
import { Customer } from '../types';
import { Mail, Phone, MapPin, Search } from 'lucide-react';
import { useAppContext } from '../store/AppContext';
import { formatCurrency } from '../lib/utils';

export function Kontakte() {
  const { customers, invoices, offers } = useAppContext();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredContacts = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Kontakte</h1>
          <p className="text-sm text-slate-500">Ihre Übersicht aller Geschäftskontakte (Kunden).</p>
        </div>
      </div>

      <div className="mb-6 relative w-full sm:w-96">
        <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Kontakte durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContacts.map(contact => {
          const activeInvoices = invoices.filter(i => i.customerId === contact.id);
          const activeOffers = offers.filter(o => o.customerId === contact.id);
          
          return (
            <div key={contact.id} className="bg-card shadow-sm border border-slate-200 p-6 rounded-xl relative overflow-hidden transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{contact.companyName || contact.name}</h3>
                  {contact.companyName && contact.name && (
                    <p className="text-sm text-slate-500">{contact.firstName} {contact.lastName}</p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {(contact.companyName || contact.name).charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {(contact.email || contact.phone) && (
                  <div className="space-y-2">
                    {contact.email && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                        <a href={`mailto:${contact.email}`} className="truncate hover:text-blue-600 transition-colors">{contact.email}</a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                        <a href={`tel:${contact.phone}`} className="hover:text-blue-600 transition-colors">{contact.phone}</a>
                      </div>
                    )}
                  </div>
                )}
                
                {(contact.city || contact.street || contact.address) && (
                  <div className="flex items-start text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">{contact.city ? `${contact.street} ${contact.houseNumber}, ${contact.zipCode} ${contact.city}` : contact.address}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 mb-2">
                <div>
                   <div className="text-xs text-slate-400 font-medium mb-1">Rechnungen</div>
                   <div className="text-sm font-semibold text-slate-700">{activeInvoices.length}</div>
                </div>
                <div>
                   <div className="text-xs text-slate-400 font-medium mb-1">Angebote</div>
                   <div className="text-sm font-semibold text-slate-700">{activeOffers.length}</div>
                </div>
              </div>
            </div>
          )
        })}
        {filteredContacts.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
            {searchTerm ? "Keine Kontakte für Ihre Suche gefunden." : "Noch keine Kontakte (Kunden) angelegt."}
          </div>
        )}
      </div>
    </div>
  );
}
