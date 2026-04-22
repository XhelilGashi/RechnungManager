import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppContext } from '../store/AppContext';
import { Project } from '../types';
import { Plus, Trash2, X, HardHat, Pencil, FileText, ChevronDown, ChevronRight, Receipt } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

export function Projekte({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { projects, setProjects, customers, products, invoices, setInvoices, offers, payments, expenses, setExpenses, showToast, settings } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({ name: '', customerId: '', description: '', productIds: [] });
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  
  const [expenseModalOpen, setExpenseModalOpen] = useState<string | null>(null);
  const [expenseData, setExpenseData] = useState({ vendor: '', description: '', amount: 0, category: 'Material' });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseModalOpen || !expenseData.amount) return;
    
    const newExpense = {
      id: uuidv4(),
      projectId: expenseModalOpen,
      vendor: expenseData.vendor,
      description: expenseData.description,
      amount: expenseData.amount,
      date: Date.now(),
      category: expenseData.category
    };
    
    setExpenses([...expenses, newExpense]);
    showToast('Ausgabe erfolgreich erfasst');
    setExpenseModalOpen(null);
    setExpenseData({ vendor: '', description: '', amount: 0, category: 'Material' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.customerId) return;

    if (formData.id) {
      setProjects(projects.map(p => p.id === formData.id ? { ...formData as Project } : p));
      showToast('Projekt erfolgreich aktualisiert');
    } else {
      const newProject: Project = {
        id: uuidv4(),
        name: formData.name,
        customerId: formData.customerId,
        description: formData.description,
        productIds: formData.productIds || [],
        createdAt: Date.now()
      };
      setProjects([newProject, ...projects]);
      showToast('Projekt erfolgreich erstellt');
    }
    
    setIsCreating(false);
    setFormData({ name: '', customerId: '', description: '', productIds: [] });
  };

  const handleEdit = (project: Project) => {
    setFormData(project);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Möchten Sie dieses Projekt wirklich löschen?')) {
      setProjects(projects.filter(p => p.id !== id));
      showToast('Projekt gelöscht');
    }
  };

  const handleCreateInvoice = (project: Project) => {
    const customer = customers.find(c => c.id === project.customerId);
    if (!customer) return;

    const projectProducts = (project.productIds || []).map(pid => products.find(p => p.id === pid)).filter(Boolean) as any[];
    
    const newInvoice = {
      id: uuidv4(),
      type: 'Standard',
      number: `RE-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      date: Date.now(),
      customerId: project.customerId,
      projectId: project.id,
      companyName: customer.companyName,
      firstName: customer.firstName,
      lastName: customer.lastName,
      street: customer.street,
      houseNumber: customer.houseNumber,
      zipCode: customer.zipCode,
      city: customer.city,
      country: customer.country,
      status: 'Entwurf',
      items: projectProducts.map(p => ({
        id: uuidv4(),
        name: p.name,
        description: '',
        quantity: 1,
        unit: p.unit || 'Stück',
        price: p.price,
        vatRate: p.vatRate || 19,
        total: p.price
      })),
      createdAt: Date.now()
    };
    
    setInvoices([newInvoice as any, ...invoices]);
    showToast('Rechnung aus Projekt erstellt');
    if (onNavigate) {
      onNavigate('rechnungen');
    }
  };

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-card rounded-xl border border-dashed border-border p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Bitte zuerst Kunden anlegen</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">Ein Projekt benötigt immer einen zugewiesenen Kunden. Bitte lege zuerst einen Kunden an.</p>
      </div>
    );
  }

  if (projects.length === 0 && !isCreating) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-card rounded-xl border border-dashed border-border p-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <HardHat className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Noch keine Projekte</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">Lege Bauvorhaben oder Projekte an, um Rechnungen und Teilrechnungen gruppiert zuzuordnen.</p>
        <button 
          onClick={() => setIsCreating(true)}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Erstes Projekt erstellen
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Projekte & Baustellen</h1>
        {!isCreating && (
          <button 
            onClick={() => { setFormData({ name: '', customerId: '', description: '' }); setIsCreating(true); }}
            className="px-5 py-2.5 rounded-md font-medium text-sm bg-primary shadow-sm text-primary-foreground hover:bg-blue-600 hover:shadow active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Neues Projekt
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
            <HardHat className="w-5 h-5 text-primary" /> {formData.id ? 'Projekt bearbeiten' : 'Neues Projekt anlegen'}
          </h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Projektbezeichnung</label>
                <input 
                  type="text" required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  placeholder="z.B. Haus Müller - Dacharbeiten"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kunde (Bauherr)</label>
                <select 
                  required
                  value={formData.customerId || ''}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                >
                  <option value="" disabled>Bitte wählen...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung / Notizen (Optional)</label>
                  <textarea 
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm h-24"
                    placeholder="Weitere Details zur Baustelle..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Standard-Artikel für dieses Projekt</label>
                  <div className="bg-slate-50 border border-border p-3 rounded-md space-y-2 max-h-48 overflow-y-auto">
                     {products.length === 0 ? (
                     <div className="text-sm text-slate-500 italic">Keine Artikel verfügbar. Legen Sie zuerst Artikel an.</div>
                   ) : (
                     products.map(p => {
                       const isSelected = (formData.productIds || []).includes(p.id);
                       return (
                         <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                           <input 
                             type="checkbox" 
                             checked={isSelected}
                             onChange={(e) => {
                               const current = formData.productIds || [];
                               if (e.target.checked) {
                                 setFormData({...formData, productIds: [...current, p.id]});
                               } else {
                                 setFormData({...formData, productIds: current.filter(id => id !== p.id)});
                               }
                             }}
                             className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                           />
                           <div className="flex-1 text-sm font-medium">{p.name}</div>
                           <div className="text-xs text-slate-500">{p.price} € / {p.unit}</div>
                         </label>
                       );
                     })
                   )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-border">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
              >
                {formData.id ? 'Änderungen speichern' : 'Projekt speichern'}
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

      {!isCreating && projects.length > 0 && (
        <div className="bg-card shadow-sm border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border">
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Projekt</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Kunde</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm">Finanzen (Netto)</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-sm text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const customer = customers.find(c => c.id === project.customerId);
                  const projectInvoices = invoices.filter(i => i.projectId === project.id);
                  const projectOffers = offers.filter(o => o.projectId === project.id);
                  
                  const invoicedAmount = projectInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
                  const projectPayments = payments.filter(p => projectInvoices.some(inv => inv.id === p.invoiceId));
                  const paidAmount = projectPayments.reduce((sum, p) => sum + p.amount, 0);
                  
                  const projectExpenses = expenses.filter(e => e.projectId === project.id);
                  const expensesAmount = projectExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
                  
                  const profit = invoicedAmount - expensesAmount;
                  
                  const hasDocuments = projectInvoices.length > 0 || projectOffers.length > 0;
                  const isExpanded = expandedProjectId === project.id;
                  
                  return (
                    <React.Fragment key={project.id}>
                      <tr className="border-b border-border last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <button 
                            disabled={!hasDocuments}
                            onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                            className={cn(
                              "flex items-center gap-2 font-medium text-foreground text-left",
                              hasDocuments ? "cursor-pointer hover:text-primary transition-colors" : ""
                            )}
                          >
                            {hasDocuments && (
                              isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                            <span className={!hasDocuments ? "pl-6" : ""}>{project.name}</span>
                          </button>
                          {(project.productIds?.length || 0) > 0 && (
                             <div className="text-xs text-slate-500 mt-1 pl-6">{project.productIds!.length} Artikel hinterlegt</div>
                          )}
                          {hasDocuments && (
                             <div className="text-xs text-blue-600 font-medium mt-1 pl-6">
                               {projectOffers.length > 0 && <span>{projectOffers.length} Angebot{projectOffers.length !== 1 ? 'e' : ''}</span>}
                               {projectOffers.length > 0 && projectInvoices.length > 0 && <span> &bull; </span>}
                               {projectInvoices.length > 0 && <span>{projectInvoices.length} Rechnung{projectInvoices.length !== 1 ? 'en' : ''}</span>}
                             </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {customer?.name || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm truncate max-w-xs">
                          {invoicedAmount > 0 || expensesAmount > 0 ? (
                            <div className="space-y-1">
                              <div className="flex justify-between w-40 text-slate-600">
                                <span>Umsatz:</span>
                                <span>{formatCurrency(invoicedAmount, settings.currency)}</span>
                              </div>
                              <div className="flex justify-between w-40 text-red-600">
                                <span>Ausgaben:</span>
                                <span>-{formatCurrency(expensesAmount, settings.currency)}</span>
                              </div>
                              <div className="flex justify-between w-40 font-semibold border-t border-slate-200 pt-1 text-slate-900 mt-1">
                                <span>Gewinn:</span>
                                <span className={profit < 0 ? 'text-red-600' : 'text-emerald-600'}>{formatCurrency(profit, settings.currency)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Keine Daten</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setExpenseModalOpen(project.id)}
                              className="p-2 text-slate-600 hover:bg-slate-100 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 px-3 text-xs font-semibold"
                              title="Ausgabe erfassen"
                            >
                              + Ausgabe
                            </button>
                            <button 
                              onClick={() => handleCreateInvoice(project)}
                              className="p-2 text-primary hover:bg-blue-50 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 px-3 text-xs font-semibold"
                              title="Rechnung erstellen"
                            >
                              <FileText className="w-4 h-4" /> RE erstellen
                            </button>
                            <button 
                              onClick={() => handleEdit(project)}
                              className="p-2 text-slate-400 hover:text-primary transition-colors bg-white hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
                              title="Bearbeiten"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(project.id)}
                              className="p-2 text-slate-400 hover:text-destructive transition-colors bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (hasDocuments || projectExpenses.length > 0) && (
                        <tr className="bg-slate-50 border-b border-border">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="pl-6 border-l-2 border-blue-200 grid grid-cols-2 gap-8">
                               <div>
                                 <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Zugeordnete Dokumente</h4>
                                 <div className="space-y-2">
                                   {projectOffers.length === 0 && projectInvoices.length === 0 && (
                                     <div className="text-xs text-slate-400 italic">Keine Dokumente vorhanden</div>
                                   )}
                                   {projectOffers.map(offer => (
                                     <div key={offer.id} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center text-orange-600">
                                            <FileText className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <div className="font-medium text-sm text-slate-900">{offer.number}</div>
                                            <div className="text-xs text-slate-500">{new Date(offer.date).toLocaleDateString('de-DE')} &bull; Status: {offer.status || 'Entwurf'}</div>
                                          </div>
                                        </div>
                                        <div className="font-semibold text-sm">
                                          {formatCurrency(offer.total, settings?.currency || '€')}
                                        </div>
                                     </div>
                                   ))}
                                   {projectInvoices.map(invoice => (
                                     <div key={invoice.id} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Receipt className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <div className="font-medium text-sm text-slate-900">{invoice.number}</div>
                                            <div className="text-xs text-slate-500">{new Date(invoice.date).toLocaleDateString('de-DE')} &bull; Status: {invoice.status || 'offen'}</div>
                                          </div>
                                        </div>
                                        <div className="font-semibold text-sm">
                                          {formatCurrency(invoice.total, settings?.currency || '€')}
                                        </div>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                               
                               {projectExpenses.length > 0 && (
                                 <div>
                                   <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Erfasste Ausgaben</h4>
                                   <div className="space-y-2">
                                     {projectExpenses.map(expense => (
                                       <div key={expense.id} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 shadow-sm">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center text-red-600">
                                              <span className="font-bold">-</span>
                                            </div>
                                            <div>
                                              <div className="font-medium text-sm text-slate-900">{expense.vendor || expense.category}</div>
                                              <div className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString('de-DE')} &bull; {expense.description || expense.category}</div>
                                            </div>
                                          </div>
                                          <div className="font-semibold text-sm text-red-600">
                                            -{formatCurrency(expense.amount, settings?.currency || '€')}
                                          </div>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Ausgabe erfassen</h3>
              <button 
                onClick={() => setExpenseModalOpen(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lieferant / Kreditor</label>
                <input 
                  type="text" required
                  value={expenseData.vendor}
                  onChange={(e) => setExpenseData({...expenseData, vendor: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="z.B. Baumarkt GmbH"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategorie</label>
                <select 
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Material">Material</option>
                  <option value="Fremdleistung">Fremdleistung</option>
                  <option value="Reisekosten">Reisekosten</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
                <input 
                  type="text" required
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="z.B. Schrauben und Holz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Betrag (Brutto)</label>
                <div className="relative">
                  <input 
                    type="number" required min="0.01" step="0.01"
                    value={expenseData.amount || ''}
                    onChange={(e) => setExpenseData({...expenseData, amount: parseFloat(e.target.value)})}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none pr-8"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    {settings?.currency === 'HUF' ? 'Ft' : settings?.currency === 'CHF' ? 'CHF' : '€'}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-white font-medium rounded-lg py-2 hover:bg-blue-600 transition-colors"
                >
                  Speichern
                </button>
                <button 
                  type="button" 
                  onClick={() => setExpenseModalOpen(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-medium rounded-lg py-2 hover:bg-slate-200 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
