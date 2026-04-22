import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Palette, Save } from 'lucide-react';
export function RechnungDesign() {
  const { settings, setSettings, showToast } = useAppContext();
  const [formData, setFormData] = useState(settings);
  const handleSave = () => { setSettings(formData); showToast('Design gespeichert', 'success'); };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold flex gap-3 items-center"><Palette className="text-blue-600" /> Rechnung Design</h1>
        <button onClick={handleSave} className="bg-blue-600 px-6 py-2 rounded-lg text-white"><Save className="w-4 h-4" /></button>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <label className="block text-sm font-medium mb-1">Primärfarbe (Hex)</label>
        <div className="flex gap-4 items-center">
            <input type="color" className="w-12 h-12 rounded-lg cursor-pointer" value={formData.invoiceColor || '#000000'} onChange={e=>setFormData({...formData, invoiceColor: e.target.value})} />
            <input className="border p-2 rounded-lg w-full max-w-xs" value={formData.invoiceColor || '#000000'} onChange={e=>setFormData({...formData, invoiceColor: e.target.value})} />
        </div>
      </div>
    </div>
  );
}