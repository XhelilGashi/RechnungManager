const fs = require('fs');
const path = require('path');

const generateCrudPage = (
  entityName, 
  stateName, 
  setStateName, 
  fields, 
  icon, 
  title, 
  subtitle,
  emptyMessage,
  emptyDescription
) => {
  const interfaceName = entityName;
  
  const defaultFormState = fields.reduce((acc, f) => {
    acc[f.name] = f.default !== undefined ? f.default : '';
    return acc;
  }, {});

  const listRows = fields.map(f => {
    if (f.type === 'number' || f.name.toLowerCase().includes('price') || f.name.toLowerCase().includes('rate')) {
      return `                    <td className="px-6 py-4 font-medium text-foreground text-right">{item.${f.name} !== undefined ? formatCurrency(item.${f.name}, settings?.currency || 'EUR') : ''}</td>`;
    }
    if (f.name === 'status') {
      return `                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{item.${f.name}}</span></td>`;
    }
    return `                    <td className="px-6 py-4 text-slate-600">{item.${f.name}}</td>`;
  }).join('\n');

  const tableHeaders = fields.map(f => {
    const isRight = (f.type === 'number' || f.name.toLowerCase().includes('price') || f.name.toLowerCase().includes('rate'));
    return `                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm ${isRight ? 'text-right' : 'text-left'}">${f.label}</th>`;
  }).join('\n');

  const formInputs = fields.map(f => {
    if (f.type === 'select') {
      const options = f.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n                    ');
      return `
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">${f.label}</label>
                <select
                  value={formData.${f.name} || '${f.options[0].value}'}
                  onChange={(e) => setFormData({...formData, ${f.name}: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  ${options}
                </select>
              </div>`;
    } else if (f.type === 'textarea') {
      return `
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">${f.label}</label>
                <textarea
                  value={formData.${f.name} || ''}
                  onChange={(e) => setFormData({...formData, ${f.name}: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  rows={3}
                />
              </div>`;
    } else if (f.type === 'number') {
      return `
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">${f.label}</label>
                <input
                  type="number" step="0.01" ${f.required ? 'required' : ''}
                  value={formData.${f.name} || ''}
                  onChange={(e) => setFormData({...formData, ${f.name}: parseFloat(e.target.value)})}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>`;
    } else {
      return `
              <div ${f.fullWidth ? 'className="md:col-span-2"' : ''}>
                <label className="block text-sm font-medium text-slate-700 mb-1">${f.label}</label>
                <input
                  type="text" ${f.required ? 'required' : ''}
                  value={formData.${f.name} || ''}
                  onChange={(e) => setFormData({...formData, ${f.name}: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  ${f.name === fields[0].name ? 'autoFocus' : ''}
                />
              </div>`;
    }
  }).join('');

  return `import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { ${interfaceName} } from '../types';
import { Plus, Trash2, X, ${icon}, Pencil, Package } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function ${entityName}List() {
  const { ${stateName}, ${setStateName}, settings, showToast } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<${interfaceName}>>(${JSON.stringify(defaultFormState)});

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.${fields[0].name}) {
      showToast('Bitte füllen Sie die Pflichtfelder aus', 'error');
      return;
    }

    if (formData.id) {
      ${setStateName}(${stateName}.map((item: any) => item.id === formData.id ? { ...item, ...formData } as ${interfaceName} : item));
      showToast('${title} erfolgreich aktualisiert', 'success');
    } else {
      const newItem = {
        ...formData,
        id: uuidv4(),
        createdAt: Date.now()
      } as ${interfaceName};
      ${setStateName}([newItem, ...${stateName}]);
      showToast('${title} erfolgreich erstellt', 'success');
    }
    
    setIsCreating(false);
    setFormData(${JSON.stringify(defaultFormState)});
  };

  const handleEdit = (item: ${interfaceName}) => {
    setFormData(item);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      ${setStateName}(${stateName}.filter((item: any) => item.id !== id));
      showToast('Eintrag gelöscht', 'success');
    }
  };

  if (${stateName}.length === 0 && !isCreating) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <${icon} className="w-7 h-7 text-blue-600" />
              ${title}
            </h1>
            <p className="text-sm text-slate-500 mt-1">${subtitle}</p>
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
            <${icon} className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">${emptyMessage}</h3>
          <p className="text-slate-500 max-w-md text-base leading-relaxed mb-6">
            ${emptyDescription}
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
            <${icon} className="w-7 h-7 text-blue-600" />
            ${title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">${subtitle}</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => { setFormData(${JSON.stringify(defaultFormState)}); setIsCreating(true); }}
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
            <${icon} className="w-5 h-5 text-blue-600" /> {formData.id ? 'Eintrag bearbeiten' : 'Neuen Eintrag anlegen'}
          </h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              ${formInputs}
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

      {!isCreating && ${stateName}.length > 0 && (
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  ${tableHeaders}
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {${stateName}.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    ${listRows}
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
export function {PAGE_NAME}() {
    return <${entityName}List />;
}
`.replace('{PAGE_NAME}', entityName === 'Product' ? 'Produkte' : entityName === 'Service' ? 'Dienstleistungen' : entityName === 'Category' ? 'Kategorien' : entityName === 'Baustelle' ? 'Baustellen' : entityName);
};

// Generate Baustellen
fs.writeFileSync('src/pages/Baustellen.tsx', generateCrudPage(
  'Baustelle', 
  'baustellen', 
  'setBaustellen',
  [
    { name: 'name', label: 'Name der Baustelle', required: true, fullWidth: true },
    { name: 'location', label: 'Standort / Adresse', required: true, fullWidth: true },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'In Planung', label: 'In Planung' },
      { value: 'Aktiv', label: 'Aktiv' },
      { value: 'Abgeschlossen', label: 'Abgeschlossen' }
    ] },
    { name: 'notes', label: 'Notizen', type: 'textarea' }
  ],
  'HardHat',
  'Baustellen',
  'Verwalten Sie Ihre Baustellen und Standorte.',
  'Noch keine Baustellen angelegt',
  'Erstellen Sie Ihre erste Baustelle, um Projekte an bestimmten Standorten zu verwalten.'
));

// Generate Produkte
fs.writeFileSync('src/pages/Produkte.tsx', generateCrudPage(
  'Product', 
  'products', 
  'setProducts',
  [
    { name: 'name', label: 'Produktname', required: true, fullWidth: true },
    { name: 'price', label: 'Preis (Netto)', type: 'number', required: true },
    { name: 'unit', label: 'Einheit', default: 'Stück' },
    { name: 'vatRate', label: 'Steuersatz (%)', type: 'select', default: '19', options: [
      { value: 19, label: '19%' },
      { value: 7, label: '7%' },
      { value: 0, label: '0%' }
    ]}
  ],
  'Package',
  'Produkte',
  'Ihre Artikel und physische Produkte.',
  'Noch keine Produkte angelegt',
  'Erstellen Sie Ihre ersten Produkte, um sie in Angeboten und Rechnungen schnell auszuwählen.'
));

// Generate Dienstleistungen
fs.writeFileSync('src/pages/Dienstleistungen.tsx', generateCrudPage(
  'Service', 
  'services', 
  'setServices',
  [
    { name: 'name', label: 'Bezeichnung', required: true, fullWidth: true },
    { name: 'hourlyRate', label: 'Stundensatz (Netto)', type: 'number', required: true },
    { name: 'vatRate', label: 'Steuersatz (%)', type: 'select', default: '19', options: [
      { value: 19, label: '19%' },
      { value: 7, label: '7%' },
      { value: 0, label: '0%' }
    ]},
    { name: 'description', label: 'Beschreibung', type: 'textarea' }
  ],
  'Wrench',
  'Dienstleistungen',
  'Verwalten Sie Ihre Dienstleistungen und Stundensätze.',
  'Noch keine Dienstleistungen',
  'Erfassen Sie häufig genutzte Dienstleistungen für eine schnellere Abrechnung.'
));

// Generate Kategorien
fs.writeFileSync('src/pages/Kategorien.tsx', generateCrudPage(
  'Category', 
  'categories', 
  'setCategories',
  [
    { name: 'name', label: 'Name der Kategorie', required: true, fullWidth: true },
    { name: 'type', label: 'Typ', type: 'select', options: [
      { value: 'product', label: 'Produktkategorie' },
      { value: 'service', label: 'Dienstleistungskategorie' }
    ]},
    { name: 'description', label: 'Beschreibung', type: 'textarea' }
  ],
  'Tags',
  'Kategorien',
  'Artikel- und Dienstleistungskategorien verwalten.',
  'Keine Kategorien vorhanden',
  'Legen Sie Kategorien an, um Ihr Portfolio übersichtlich zu strukturieren.'
));

console.log('CRUD pages generated!');
