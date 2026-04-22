import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { Invoice, Customer } from '../types';
import { Mail, AlertTriangle, Clock, CalendarDays, ArrowRight, FileText } from 'lucide-react';
import { generateInvoicePDF } from '../lib/pdf';
import { formatCurrency, formatDate } from '../lib/utils';
import { motion } from 'motion/react';

export function Automatisierung({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { invoices, customers, settings, logo, projects } = useAppContext();

  // Helper to categorize invoices
  const { upcoming, dueToday, overdue } = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const nowTime = now.getTime();

    const upcoming: Invoice[] = [];
    const dueToday: Invoice[] = [];
    const overdue: Invoice[] = [];

    invoices.forEach(inv => {
      // Only care about open invoices
      if (inv.status === 'bezahlt') return;

      const dueDate = new Date(inv.dueDate || (inv.date + (inv.paymentTermsDays || 14) * 24 * 60 * 60 * 1000));
      dueDate.setHours(0,0,0,0);
      const dueTime = dueDate.getTime();

      const diffDays = Math.round((dueTime - nowTime) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        overdue.push(inv);
      } else if (diffDays === 0) {
        dueToday.push(inv);
      } else if (diffDays > 0 && diffDays <= 7) {
        // Upcoming within 7 days
        upcoming.push(inv);
      }
    });

    return {
      upcoming: upcoming.sort((a, b) => a.dueDate! - b.dueDate!),
      dueToday,
      overdue: overdue.sort((a, b) => a.dueDate! - b.dueDate!),
    };
  }, [invoices]);

  const handleSendEmail = (invoice: Invoice, type: 'reminder' | 'due' | 'overdue') => {
    const cust = customers.find(c => c.id === invoice.customerId);
    if (!cust) return;

    const nameStr = cust.firstName ? `${cust.firstName} ${cust.lastName || ''}` : `${cust.companyName || ''}`;
    let subject = '';
    let message = '';

    if (type === 'reminder') {
        subject = `Erinnerung: Rechnung ${invoice.number} ist bald fällig`;
        message = `Guten Tag ${nameStr},\n\nwir möchten Sie freundlich daran erinnern, dass die Rechnung ${invoice.number} über ${formatCurrency(invoice.total, settings.currency)} in Kürze fällig wird.\n\n(Bitte fügen Sie die Rechnung als PDF manuell an.)\n\nMit freundlichen Grüßen`;
    } else if (type === 'due') {
        subject = `Rechnung ${invoice.number} ist heute fällig`;
        message = `Guten Tag ${nameStr},\n\nhiermit möchten wir Sie daran erinnern, dass unsere Rechnung ${invoice.number} über ${formatCurrency(invoice.total, settings.currency)} heute fällig ist.\n\n(Bitte fügen Sie die Rechnung als PDF manuell an.)\n\nMit freundlichen Grüßen`;
    } else {
        subject = `Mahnung: Rechnung ${invoice.number} ist überfällig`;
        message = `Guten Tag ${nameStr},\n\nleider konnten wir bis heute keinen Zahlungseingang für die Rechnung ${invoice.number} über ${formatCurrency(invoice.total, settings.currency)} feststellen.\n\nBitte überweisen Sie den ausstehenden Betrag umgehend. (Bitte fügen Sie die Rechnung als PDF manuell an.)\n\nMit freundlichen Grüßen`;
    }

    const mailto = `mailto:${cust.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  const ActionCard = ({ invoicesList, title, icon: Icon, colorClass, type, description }: any) => {
      if(invoicesList.length === 0) return null;

      return (
          <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-card shadow-sm border border-slate-200 rounded-xl overflow-hidden mb-8"
          >
              <div className={`px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50`}>
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colorClass} bg-opacity-20`}>
                       <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-').replace('-100', '-600').replace('-50', '-500')}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{description} ({invoicesList.length} Rechnungen)</p>
                    </div>
                 </div>
              </div>
              <div className="divide-y divide-slate-100 p-2">
                 {invoicesList.map((inv: Invoice) => {
                    const c = customers.find(c => c.id === inv.customerId);
                    return (
                        <div key={inv.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors gap-4">
                           <div className="flex-1">
                               <div className="flex items-center justify-between mb-1">
                                    <div className="font-semibold text-slate-900">{inv.number}</div>
                                    <div className="font-bold text-slate-800">{formatCurrency(inv.total, settings.currency)}</div>
                               </div>
                               <div className="flex items-center justify-between text-sm">
                                   <div className="text-slate-500">{c?.companyName || c?.name || c?.lastName || 'Unbekannt'}</div>
                                   <div className="text-xs font-medium text-slate-400">
                                       Fällig: {formatDate(inv.dueDate || (inv.date + (inv.paymentTermsDays||14)*86400000), settings.dateFormat)}
                                   </div>
                               </div>
                           </div>
                           <button 
                               onClick={() => handleSendEmail(inv, type)}
                               className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                           >
                               <Mail className="w-4 h-4" /> Autom. E-Mail
                           </button>
                        </div>
                    );
                 })}
              </div>
          </motion.div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Mahnwesen & Erinnerungen</h1>
          <p className="text-sm text-slate-500">Automatisierte Zahlungserinnerungen und Mahnungen an Kunden senden.</p>
        </div>
      </div>

      {(upcoming.length === 0 && dueToday.length === 0 && overdue.length === 0) ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-12 text-center mt-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Alles im grünen Bereich!</h2>
              <p className="text-slate-500">Es stehen aktuell keine Rechnungen zur Mahnung oder Erinnerung an.</p>
              <button 
                  onClick={() => onNavigate('rechnungen')}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm rounded hover:bg-blue-700 font-medium transition-colors"
              >
                  Zurück zu Rechnungen
              </button>
          </div>
      ) : (
          <div className="space-y-6">
              <ActionCard 
                  invoicesList={overdue}
                  title="Überfällige Rechnungen (Mahnung)"
                  description="Zahlungsfrist überschritten"
                  icon={AlertTriangle}
                  colorClass="bg-red-100"
                  type="overdue"
              />

              <ActionCard 
                  invoicesList={dueToday}
                  title="Heute fällig (Zahlungserinnerung)"
                  description="Ablauf der Frist am heutigen Tag"
                  icon={Clock}
                  colorClass="bg-amber-100"
                  type="due"
              />

              <ActionCard 
                  invoicesList={upcoming}
                  title="Bald fällig (Vorab-Erinnerung)"
                  description="Zahlbar in den nächsten 7 Tagen"
                  icon={CalendarDays}
                  colorClass="bg-blue-50"
                  type="reminder"
              />
          </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex gap-3">
          <Mail className="w-5 h-5 shrink-0 text-blue-600" />
          <p>Sie schicken das automatisch generierte PDF als Anhang über Ihr Standard-E-Mail-Programm. Die Empfänger, der Betreff und der Mahnungstext werden als Vorlage vorausgefüllt.</p>
      </div>

    </div>
  );
}
