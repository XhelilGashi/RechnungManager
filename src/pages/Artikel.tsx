import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Product } from '../types';
import { Plus, Trash2, X, Package, Pencil } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function Artikel() {
  const { products, setProducts, settings, showToast } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({ unit: 'Stück', price: 0 });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined) return;

    if (formData.id) {
      setProducts(products.map(p => p.id === formData.id ? { ...formData as Product } : p));
      showToast('Artikel erfolgreich aktualisiert');
    } else {
      const newProduct: Product = {
        id: uuidv4(),
        name: formData.name,
        price: formData.price,
        unit: formData.unit || 'Stück',
        vatRate: formData.vatRate !== undefined ? formData.vatRate : (settings.defaultVatRate || 19)
      };
      setProducts([newProduct, ...products]);
      showToast('Artikel erfolgreich erstellt');
    }
    
    setIsCreating(false);
    setFormData({ unit: 'Stück', price: 0 });
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
      setProducts(products.filter(p => p.id !== id));
      showToast('Artikel gelöscht');
    }
  };

  if (products.length === 0 && !isCreating) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-card rounded-xl border border-dashed border-border p-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Noch keine Artikel</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">Erstelle Standard-Produkte oder -Dienstleistungen, um sie in Angeboten und Rechnungen schnell auszuwählen.</p>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Ersten Artikel erstellen
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Artikel & Leistungen</h1>
        {!isCreating && (
          <button 
            onClick={() => { setFormData({ unit: 'Stück', price: 0 }); setIsCreating(true); }}
            className="px-5 py-2.5 rounded-md font-medium text-sm bg-primary shadow-sm text-primary-foreground hover:bg-blue-600 hover:shadow active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Neuer Artikel
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-card shadow-md border border-border p-6 rounded-xl relative animate-in fade-in slide-in-from-top-4 duration-300 mb-8">
          <button 
            onClick={() => setIsCreating(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> {formData.id ? 'Artikel bearbeiten' : 'Neuen Artikel anlegen'}
          </h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Name / Beschreibung</label>
                <input 
                  type="text" required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Standardpreis (Netto)</label>
                <div className="relative">
                  <input 
                    type="number" required min="0" step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                  <span className="absolute right-3 top-2 text-slate-400">{settings.currency}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Standard-Einheit</label>
                  <select 
                    value={formData.unit || 'Stück'}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  >
                    <option value="Stück">Stück</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="Stunden">Stunden</option>
                    <option value="Pauschal">Pauschal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Steuersatz (%)</label>
                  <select 
                    value={formData.vatRate !== undefined ? formData.vatRate : (settings.defaultVatRate || 19)}
                    onChange={(e) => setFormData({...formData, vatRate: parseFloat(e.target.value)})}
                    className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  >
                    <option value="19">19%</option>
                    <option value="7">7%</option>
                    <option value="0">0%</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-border">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
              >
                {formData.id ? 'Änderungen speichern' : 'Artikel speichern'}
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

      {!isCreating && products.length > 0 && (
        <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Name / Beschreibung</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Einheit</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Standardpreis</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {product.unit}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground text-right">
                      {formatCurrency(product.price, settings.currency)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors bg-white hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
                          title="Bearbeiten"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-400 hover:text-destructive transition-colors bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
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
    </>
  );
}
