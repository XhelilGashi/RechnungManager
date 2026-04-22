import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Expense } from '../types';
import { CreditCard, Plus, Trash2, X, Pencil } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { format } from 'date-fns';

export function Ausgaben() {
  const { expenses, setExpenses, settings, showToast } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({ title: '', amount: 0, vatRate: 19, isPaid: false });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || formData.amount === undefined || formData.amount <= 0) {
      showToast('Bitte füllen Sie die Pflichtfelder korrekt aus', 'error');
      return;
    }

    const vatAmount = (formData.amount || 0) * ((formData.vatRate || 0) / 100);
    const total = (formData.amount || 0) + vatAmount;

    if (formData.id) {
      setExpenses(expenses.map(item => item.id === formData.id ? { ...item, ...formData, vatAmount, total } as Expense : item));
      showToast('Ausgabe erfolgreich aktualisiert', 'success');
    } else {
      const newItem = {
        ...formData,
        id: uuidv4(),
        vatAmount,
        total,
        date: formData.date || Date.now()
      } as Expense;
      setExpenses([newItem, ...expenses]);
      showToast('Ausgabe erfolgreich erstellt', 'success');
    }
    
    setIsCreating(false);
    setFormData({ title: '', amount: 0, vatRate: 19, isPaid: false });
  };

  const handleEdit = (item: Expense) => {
    setFormData(item);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      setExpenses(expenses.filter(item => item.id !== id));
      showToast('Ausgabe gelöscht', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-blue-600" />
            Ausgaben
          </h1>
          <p className="text-sm text-slate-500 mt-1">Ausgaben und Belege verwalten.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => { setFormData({ title: '', amount: 0, vatRate: 19, isPaid: false, date: Date.now() }); setIsCreating(true); }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Neue Ausgabe
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white shadow-md border border-slate-200 p-6 rounded-xl relative mb-8">
          <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-slate-400 hover:bg-slate-100 p-1 rounded-full"><X className="w-5 h-5" /></button>
          <h3 className="text-xl font-bold mb-4">{formData.id ? 'Ausgabe bearbeiten' : 'Ausgabe erfassen'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1">Titel / Verwendungszweck</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium mb-1">Lieferant / Empfänger</label>
                <input type="text" value={formData.supplier || ''} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Netto-Betrag</label>
                <input required type="number" step="0.01" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Steuersatz (%)</label>
                <select value={formData.vatRate} onChange={e => setFormData({...formData, vatRate: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg">
                  <option value="19">19%</option>
                  <option value="7">7%</option>
                  <option value="0">0%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Datum</label>
                <input required type="date" value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''} onChange={e => setFormData({...formData, date: new Date(e.target.value).getTime()})} className="w-full border p-2 rounded-lg" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={formData.isPaid} onChange={e => setFormData({...formData, isPaid: e.target.checked})} id="isPaid" className="w-4 h-4" />
                <label htmlFor="isPaid" className="text-sm font-medium">Als bezahlt markieren</label>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Speichern</button>
              <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 border rounded-lg">Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {!isCreating && expenses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center min-h-[300px] flex flex-col justify-center items-center">
            <h3 className="text-xl font-bold mb-2">Keine Ausgaben vorhanden</h3>
            <button onClick={() => setIsCreating(true)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Erste Ausgabe erfassen</button>
        </div>
      ) : !isCreating && (
        <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4">Datum</th>
                <th className="px-6 py-4">Titel</th>
                <th className="px-6 py-4">Netto</th>
                <th className="px-6 py-4">Brutto</th>
                <th className="px-6 py-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{formatDate(e.date, settings.dateFormat)}</td>
                  <td className="px-6 py-4 font-medium">{e.title}</td>
                  <td className="px-6 py-4">{formatCurrency(e.amount, settings.currency)}</td>
                  <td className="px-6 py-4 font-bold">{formatCurrency(e.total, settings.currency)}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(e)} className="p-2 text-slate-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
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