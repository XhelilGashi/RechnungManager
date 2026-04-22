import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Customer } from '../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatDate } from '../lib/utils';

export function Kunden() {
  const { customers, setCustomers, settings, showToast } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName && !formData.name) return;
    
    // Fallback for company name
    const companyName = formData.companyName || formData.name || '';

    // Combine First and Last Name
    const contactName = [formData.firstName || '', formData.lastName || ''].filter(Boolean).join(' ');

    // Create a combined business address for the legacy field
    const combinedAddress = [
      contactName,
      `${formData.street || ''} ${formData.houseNumber || ''}`.trim(),
      `${formData.zipCode || ''} ${formData.city || ''}`.trim(),
      formData.country || ''
    ].filter(Boolean).join('\n');

    const customerData: Customer = {
      id: formData.id || uuidv4(),
      createdAt: formData.createdAt || Date.now(),
      
      // Auto-generated compatibility fields
      name: companyName,
      address: combinedAddress || formData.address || '',
      email: formData.email || '',
      
      // New distinct fields
      companyName: companyName,
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      phone: formData.phone || '',
      street: formData.street || '',
      houseNumber: formData.houseNumber || '',
      zipCode: formData.zipCode || '',
      city: formData.city || '',
      country: formData.country || '',
      vatId: formData.vatId || '',
      taxNumber: formData.taxNumber || '',
      notes: formData.notes || '',
      language: formData.language || 'de'
    };

    if (formData.id) {
      // Edit
      setCustomers(customers.map(c => c.id === formData.id ? customerData : c));
      showToast('Kunde erfolgreich aktualisiert');
    } else {
      // Add
      setCustomers([customerData, ...customers]);
      showToast('Kunde erfolgreich angelegt');
    }
    
    setIsEditing(false);
    setFormData({});
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      ...customer,
      companyName: customer.companyName || customer.name || ''
    });
    // Scroll to top when opening form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsEditing(true);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Kunde wirklich löschen?")) {
      setCustomers(customers.filter(c => c.id !== id));
      showToast('Kunde gelöscht');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Kunden</h1>
        {!isEditing && (
          <button 
            onClick={() => { 
              setFormData({}); 
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setIsEditing(true); 
            }}
            className="px-5 py-2.5 rounded-md font-medium text-sm bg-primary shadow-sm text-primary-foreground hover:bg-blue-600 hover:shadow active:scale-95 transition-all duration-200"
          >
            + Neuer Kunde
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-card shadow-md border border-border p-6 rounded-xl relative animate-in fade-in slide-in-from-top-4 duration-300">
          <button 
            onClick={() => setIsEditing(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium text-foreground mb-4">
            {formData.id ? 'Kunde bearbeiten' : 'Neuer Kunde'}
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Basis-Informationen */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 border-b border-border pb-2 mb-3">Basis-Informationen</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Firmenname *</label>
                  <input 
                    type="text" 
                    value={formData.companyName || ''} 
                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-shadow duration-200"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vorname (optional)</label>
                  <input 
                    type="text" 
                    value={formData.firstName || ''} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nachname (optional)</label>
                  <input 
                    type="text" 
                    value={formData.lastName || ''} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. Kontaktdaten */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 border-b border-border pb-2 mb-3">Kontaktdaten</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail *</label>
                  <input 
                    type="email" 
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefonnummer</label>
                  <input 
                    type="tel" 
                    value={formData.phone || ''} 
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 3. Anschrift */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 border-b border-border pb-2 mb-3">Anschrift</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Straße *</label>
                  <input 
                    type="text" 
                    value={formData.street || ''} 
                    onChange={e => setFormData({...formData, street: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hausnummer *</label>
                  <input 
                    type="text" 
                    value={formData.houseNumber || ''} 
                    onChange={e => setFormData({...formData, houseNumber: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">PLZ *</label>
                  <input 
                    type="text" 
                    value={formData.zipCode || ''} 
                    onChange={e => setFormData({...formData, zipCode: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stadt *</label>
                  <input 
                    type="text" 
                    value={formData.city || ''} 
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Land</label>
                  <input 
                    type="text" 
                    value={formData.country || ''} 
                    onChange={e => setFormData({...formData, country: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 4. Geschäftsdetails */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 border-b border-border pb-2 mb-3">Geschäftsdetails</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">USt-IdNr.</label>
                  <input 
                    type="text" 
                    value={formData.vatId || ''} 
                    onChange={e => setFormData({...formData, vatId: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Steuernummer</label>
                  <input 
                    type="text" 
                    value={formData.taxNumber || ''} 
                    onChange={e => setFormData({...formData, taxNumber: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 5. Optional */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 border-b border-border pb-2 mb-3">Optional</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bevorzugte Sprache (für Rechnungen etc.)</label>
                  <select 
                    value={formData.language || 'de'} 
                    onChange={e => setFormData({...formData, language: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="it">Italiano</option>
                    <option value="es">Español</option>
                    <option value="sr">Srpski</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notizen</label>
                  <textarea 
                    value={formData.notes || ''} 
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-md font-medium text-sm border border-border text-slate-700 hover:bg-slate-50 transition-all duration-200"
              >
                Abbrechen
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 rounded-md font-medium text-sm bg-primary text-primary-foreground shadow-sm hover:shadow active:scale-95 hover:bg-blue-600 transition-all duration-200"
              >
                Kunde speichern
              </button>
            </div>
          </form>
        </div>
      )}

      {!isEditing && (
        <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden flex-grow flex flex-col hover:shadow-md transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-border bg-slate-50 flex justify-between items-center">
            <h3 className="text-base font-semibold text-foreground">Kundenliste</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">Name</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">E-Mail</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border text-center">Sprache</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">Adresse</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border">Hinzugefügt</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase text-slate-500 tracking-wide border-b border-border text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                      Keine Kunden gefunden
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr 
                      key={customer.id}
                      className="group hover:bg-slate-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-medium border-b border-border text-foreground">{customer.name}</td>
                      <td className="px-6 py-4 text-sm border-b border-border text-slate-700">{customer.email}</td>
                      <td className="px-6 py-4 text-sm border-b border-border text-slate-700 text-center uppercase text-xs">{customer.language || 'de'}</td>
                      <td className="px-6 py-4 text-sm border-b border-border text-slate-700 truncate max-w-xs">{customer.address.replace(/\n/g, ', ')}</td>
                      <td className="px-6 py-4 text-sm border-b border-border text-slate-700">{formatDate(customer.createdAt, settings.dateFormat)}</td>
                      <td className="px-6 py-4 text-sm border-b border-border text-right">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}
                            className="p-2 text-slate-500 hover:text-primary hover:bg-blue-50 rounded transition-colors active:scale-95"
                            title="Bearbeiten"
                          >
                            <Edit2 className="w-5 h-5 md:w-4 md:h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(customer.id, e)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors active:scale-95"
                            title="Löschen"
                          >
                            <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
