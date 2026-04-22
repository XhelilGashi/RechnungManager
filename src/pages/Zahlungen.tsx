import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Payment } from '../types';
import { Wallet, Plus, Trash2, X, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { format } from 'date-fns';

export function Zahlungen() {
  const { payments, setPayments, settings, showToast } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Payment>>({ amount: 0, date: Date.now() });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      showToast('Bitte geben Sie einen gültigen Betrag ein', 'error');
      return;
    }

    if (formData.id) {
      setPayments(payments.map(item => item.id === formData.id ? { ...item, ...formData } as Payment : item));
      showToast('Zahlung erfolgreich aktualisiert', 'success');
    } else {
      const newItem = {
        ...formData,
        id: uuidv4(),
        date: formData.date || Date.now()
      } as Payment;
      setPayments([newItem, ...payments]);
      showToast('Zahlung erfolgreich erfasst', 'success');
    }
    
    setIsCreating(false);
    setFormData({ amount: 0, date: Date.now() });
  };

  const handleEdit = (item: Payment) => {
    setFormData(item);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Möchten Sie diese Zahlung wirklich löschen?')) {
      setPayments(payments.filter(item => item.id !== id));
      showToast('Zahlung gelöscht', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <Wallet className="w-7 h-7 text-blue-600" />
            Zahlungen
          </h1>
          <p className="text-sm text-slate-500 mt-1">Eingehende und ausgehende manuelle Zahlungen verwalten.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => { setFormData({ amount: 0, date: Date.now() }); setIsCreating(true); }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Zahlung erfassen
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white shadow-md border border-slate-200 p-6 rounded-xl relative mb-8">
          <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-1 rounded-full"><X className="w-5 h-5" /></button>
          <h3 className="text-xl font-bold mb-4">{formData.id ? 'Zahlung bearbeiten' : 'Neue Zahlung erfassen'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Referenz / Beschreibung</label>
                <input type="text" value={formData.referenceId || ''} onChange={e => setFormData({...formData, referenceId: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="z.B. Rechnungsnummer oder Name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Betrag</label>
                <input required type="number" step="0.01" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Datum</label>
                <input required type="date" value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''} onChange={e => setFormData({...formData, date: new Date(e.target.value).getTime()})} className="w-full border p-2 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t mt-4">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium">Speichern</button>
              <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 border rounded-lg font-medium">Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {!isCreating && payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center min-h-[300px] flex flex-col justify-center items-center">
            <Wallet className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Keine Zahlungen vorhanden</h3>
            <button onClick={() => setIsCreating(true)} className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg">Erste Zahlung erfassen</button>
        </div>
      ) : !isCreating && (
        <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">Datum</th>
                <th className="px-6 py-4">Referenz</th>
                <th className="px-6 py-4 text-right">Betrag</th>
                <th className="px-6 py-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{formatDate(p.date, settings.dateFormat)}</td>
                  <td className="px-6 py-4 font-medium">{p.referenceId || '-'}</td>
                  <td className="px-6 py-4 font-medium text-right text-slate-900">{formatCurrency(p.amount, settings.currency)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
