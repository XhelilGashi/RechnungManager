import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Service } from '../types';
import { Plus, Trash2, X, Wrench, Pencil, Package } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function ServiceList() {
  const { services, setServices, settings, showToast } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({"name":"","hourlyRate":"","vatRate":"19","description":""});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Bitte füllen Sie die Pflichtfelder aus', 'error');
      return;
    }

    if (formData.id) {
      setServices(services.map((item: any) => item.id === formData.id ? { ...item, ...formData } as Service : item));
      showToast('Dienstleistungen erfolgreich aktualisiert', 'success');
    } else {
      const newItem = {
        ...formData,
        id: uuidv4(),
        createdAt: Date.now()
      } as Service;
      setServices([newItem, ...services]);
      showToast('Dienstleistungen erfolgreich erstellt', 'success');
    }
    
    setIsCreating(false);
    setFormData({"name":"","hourlyRate":"","vatRate":"19","description":""});
  };

  const handleEdit = (item: Service) => {
    setFormData(item);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      setServices(services.filter((item: any) => item.id !== id));
      showToast('Eintrag gelöscht', 'success');
    }
  };

  if (services.length === 0 && !isCreating) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <Wrench className="w-7 h-7 text-blue-600" />
              Dienstleistungen
            </h1>
            <p className="text-sm text-slate-500 mt-1">Verwalten Sie Ihre Dienstleistungen und Stundensätze.</p>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Neu anlegen
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <Wrench className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">Noch keine Dienstleistungen</h3>
          <p className="text-slate-500 max-w-md text-base leading-relaxed mb-6">
            Erfassen Sie häufig genutzte Dienstleistungen für eine schnellere Abrechnung.
          </p>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Ersten Eintrag erstellen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Wrench className="w-7 h-7 text-blue-600" />
            Dienstleistungen
          </h1>
          <p className="text-sm text-slate-500 mt-1">Verwalten Sie Ihre Dienstleistungen und Stundensätze.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => { setFormData({"name":"","hourlyRate":"","vatRate":"19","description":""}); setIsCreating(true); }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Neu anlegen
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white shadow-md border border-slate-200 p-6 rounded-xl relative animate-in fade-in slide-in-from-top-4 duration-300 mb-8">
          <button 
            onClick={() => setIsCreating(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" /> {formData.id ? 'Eintrag bearbeiten' : 'Neuen Eintrag anlegen'}
          </h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Bezeichnung</label>
                <input
                  type="text" required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stundensatz (Netto)</label>
                <input
                  type="number" step="0.01" required
                  value={formData.hourlyRate || ''}
                  onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Steuersatz (%)</label>
                <select
                  value={formData.vatRate || '19'}
                  onChange={(e) => setFormData({...formData, vatRate: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <option value="19">19%</option>
                    <option value="7">7%</option>
                    <option value="0">0%</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                {formData.id ? 'Änderungen speichern' : 'Speichern'}
              </button>
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {!isCreating && services.length > 0 && (
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-left">Bezeichnung</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Stundensatz (Netto)</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Steuersatz (%)</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-left">Beschreibung</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600">{item.name}</td>
                    <td className="px-6 py-4 font-medium text-foreground text-right">{item.hourlyRate !== undefined ? formatCurrency(item.hourlyRate, settings?.currency || 'EUR') : ''}</td>
                    <td className="px-6 py-4 font-medium text-foreground text-right">{item.vatRate !== undefined ? formatCurrency(item.vatRate, settings?.currency || 'EUR') : ''}</td>
                    <td className="px-6 py-4 text-slate-600">{item.description}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors bg-white hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
                          title="Bearbeiten"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Export as the page name mapped from router
export function Dienstleistungen() {
    return <ServiceList />;
}
