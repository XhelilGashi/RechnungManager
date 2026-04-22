import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { Settings, Save, Code } from 'lucide-react';
import { useTranslation, Language } from '../i18n';

export function System() {
  const { settings, setSettings, showToast } = useAppContext();
  const [formData, setFormData] = useState(settings);
  const { t } = useTranslation(settings.language || 'de');

  const handleSave = () => { 
    setSettings(formData); 
    showToast(t('settings_saved'), 'success'); 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4 px-2">
        <h1 className="text-2xl font-bold flex gap-3 items-center text-slate-800"><Settings className="text-blue-600" /> {t('system')}</h1>
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 shadow-sm"><Save className="w-4 h-4"/> {t('save')}</button>
      </div>
      <div className="bg-white p-6 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t('language')}</label>
          <select className="w-full border border-slate-300 p-2 rounded-lg bg-white" value={formData.language || 'de'} onChange={e=>setFormData({...formData, language: e.target.value})}>
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
          <label className="block text-sm font-medium mb-1">{t('currency')}</label>
          <select className="w-full border border-slate-300 p-2 rounded-lg bg-white" value={formData.currency || 'EUR'} onChange={e=>setFormData({...formData, currency: e.target.value})}>
            <option value="EUR">€ EUR</option>
            <option value="USD">$ USD</option>
            <option value="CHF">CHF</option>
            <option value="RSD">RSD</option>
            <option value="RUB">RUB</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white p-10 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-10">
        <div className="text-4xl sm:text-5xl text-center font-bold tracking-tight py-6 select-none">
          <span className="text-slate-900">Rechnung</span>
          <span className="text-blue-600">Manager</span>
        </div>
        <div className="w-full border-t border-slate-100"></div>
        <div className="flex w-full items-center justify-between text-slate-500 text-sm px-2">
          <div className="flex items-center gap-2">
             <Code className="w-4 h-4" />
             <span>{t('developed_by')}: <strong>Xhelil Gashi</strong></span>
          </div>
          <div className="font-medium text-slate-400">v1.4.0</div>
        </div>
      </div>
    </div>
  );
}