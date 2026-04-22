import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Building2, Save } from 'lucide-react';
export function Unternehmen() {
  const { settings, setSettings, showToast } = useAppContext();
  const [formData, setFormData] = useState(settings);
  const handleSave = () => { setSettings(formData); showToast('Unternehmensdaten gespeichert', 'success'); };
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold flex gap-3 items-center"><Building2 className="text-blue-600" /> Unternehmen</h1>
        <button onClick={handleSave} className="bg-blue-600 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2"><Save className="w-4 h-4" /> Speichern</button>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Firmenname</label>
          <input className="w-full border p-2 rounded-lg" value={formData.companyName || ''} onChange={e=>setFormData({...formData, companyName: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Straße</label>
          <input className="w-full border p-2 rounded-lg" value={formData.companyStreet || ''} onChange={e=>setFormData({...formData, companyStreet: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">PLZ / Ort</label>
          <input className="w-full border p-2 rounded-lg" value={(formData.companyZip || '') + ' ' + (formData.companyCity || '')} onChange={e=>{
            const [z, ...c] = e.target.value.split(' ');
            setFormData({...formData, companyZip: z, companyCity: c.join(' ')});
          }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-Mail</label>
          <input className="w-full border p-2 rounded-lg" value={formData.companyEmail || ''} onChange={e=>setFormData({...formData, companyEmail: e.target.value})} />
        </div>
      </div>
    </div>
  );
}