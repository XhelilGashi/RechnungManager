export interface Project {
  id: string;
  name: string;
  customerId: string;
  description?: string;
  productIds?: string[];
  createdAt: number;
}

export interface Baustelle {
  id: string;
  name: string;
  location: string;
  status: 'In Planung' | 'Aktiv' | 'Abgeschlossen';
  notes?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  vatRate?: number;
}

export interface Service {
  id: string;
  name: string;
  hourlyRate: number;
  description?: string;
  vatRate?: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'product' | 'service';
  description?: string;
}


export interface Customer {
  id: string;
  name: string; // Used as display name / fallback
  address: string; // Combined format
  email: string;
  createdAt: number;
  
  // New Business Details
  companyName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  street?: string;
  houseNumber?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  vatId?: string;
  taxNumber?: string;
  notes?: string;
  language?: string;
}

export interface LineItem {
  id: string;
  name?: string;
  description: string;
  quantity: number;
  unit?: string;
  price: number;
  discountPercent?: number;
  discount?: number; // Fix missing discount property since LiveInvoiceEditor sets discount!
  vatRate?: number;
  total: number;
}

export type OfferStatus = 'Entwurf' | 'Gesendet' | 'Angenommen' | 'Abgelehnt';

export interface Offer {
  id: string;
  number: string;
  date: number;
  deliveryDate?: number;
  referenceNumber?: string;
  paymentTermsDays?: number;
  subject?: string;
  message?: string;
  paymentNote?: string;
  pricesIncludeVat?: boolean;
  status?: OfferStatus;
  customerId: string;
  
  projectId?: string;
  template?: string;
  
  // Customer Snapshot Fields
  companyName?: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  houseNumber?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  vatId?: string;

  items: LineItem[];
  subtotal: number;
  vatRate?: number;
  vatAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  total: number;
}

export type InvoiceStatus = 'offen' | 'bezahlt' | 'ueberfaellig';

export type InvoiceType = 'Standard' | 'Teilrechnung' | 'Schlussrechnung';

export interface Invoice {
  id: string;
  number: string;
  date: number;
  deliveryDate?: number;
  referenceNumber?: string;
  paymentTermsDays?: number;
  subject?: string;
  message?: string;
  paymentNote?: string;
  pricesIncludeVat?: boolean;
  dueDate?: number;
  status?: InvoiceStatus;
  customerId: string;
  
  // Project & Type fields
  projectId?: string;
  type?: InvoiceType;
  template?: string;
  color?: string;
  category?: string;
  partialInvoiceNumber?: number;
  servicePeriodStart?: number;
  servicePeriodEnd?: number;

  // Customer Snapshot Fields
  companyName?: string;
  firstName?: string;
  lastName?: string;
  street?: string;
  houseNumber?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  email?: string;
  vatId?: string;

  items: LineItem[];
  subtotal: number;
  vatRate: number; // e.g. 19
  vatAmount: number;
  discountRate?: number;
  discountAmount?: number;
  total: number; // Includes VAT
}

export interface BankTransaction {
  id: string;
  date: number;
  description: string;
  amount: number; // positive = Einnahme, negative = Ausgabe
  type: 'Einnahme' | 'Ausgabe';
}

export interface Expense {
  id: string;
  title: string;
  amount: number; // Net
  vatRate: number;
  vatAmount: number;
  total: number; // Gross
  category: string;
  date: number;
  supplier?: string;
  receiptUrl?: string; // Base64
  isPaid: boolean;
}

export interface Income {
  id: string;
  title: string;
  amount: number; // Net
  vatRate: number;
  vatAmount: number;
  total: number; // Gross
  category: string;
  date: number;
  customerName?: string;
  isPaid: boolean;
}

export interface AppSettings {
  language: string;
  currency: string;
  dateFormat: string;
  darkMode: boolean;
  primaryColor: string;
  invoiceTemplate: string;
  invoiceColor: string;
  // Company Profile Info
  companyName?: string;
  companyOwnerFirstName?: string;
  companyOwnerLastName?: string;
  companyStreet?: string;
  companyZip?: string;
  companyCity?: string;
  companyCountry?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyBankName?: string;
  companyIban?: string;
  companyBic?: string;
  companyTaxId?: string;
  companyWebsite?: string;

  // Text Templates (Textvorlagen)
  defaultIntroText?: string;
  defaultClosingText?: string;
  defaultPaymentNote?: string;
  defaultVatRate?: number;
  
  // Typography & Layout Scaling
  invoiceFontFamily?: string;
  invoiceScale?: number;
  
  // Logo Controls
  logoPosition?: 'left' | 'center' | 'right';
  logoSize?: number; // Height in px
  logoXPercent?: number;
  logoYPercent?: number;
  logoWidthPercent?: number;

  // Company Info Layout Controls
  companyInfoXPercent?: number;
  companyInfoYPercent?: number;
  companyInfoScale?: 'small' | 'medium' | 'large';

  // Content Layout Controls (Relative to section bounds)
  titlePos?: { x: number, y: number };
  introPos?: { x: number, y: number };
  paymentPos?: { x: number, y: number };
  thanksPos?: { x: number, y: number };
  footerPos?: { x: number, y: number };

  // Lock States
  lockLogo?: boolean;
  lockCompanyInfo?: boolean;
  lockTitle?: boolean;
  lockIntro?: boolean;
  lockPayment?: boolean;
  lockThanks?: boolean;
  lockFooter?: boolean;
  // Visibility Toggles
  showSenderLine?: boolean;
  showCustomerNumber?: boolean;
  showContactPerson?: boolean;
  showItemNumber?: boolean;
  showItemDescription?: boolean;
  showItemTaxes?: boolean;
  showQRCode?: boolean;
  showFooter?: boolean;
  showPageNumbers?: boolean;
  showFoldMarks?: boolean;
  briefpapierImage?: string;
}

export interface InvoiceLayoutTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  
  logoXPercent?: number;
  logoYPercent?: number;
  logoWidthPercent?: number;
  
  companyInfoXPercent?: number;
  companyInfoYPercent?: number;
  companyInfoScale?: 'small' | 'medium' | 'large';
  
  titlePos?: { x: number, y: number };
  introPos?: { x: number, y: number };
  paymentPos?: { x: number, y: number };
  thanksPos?: { x: number, y: number };
  footerPos?: { x: number, y: number };

  lockLogo?: boolean;
  lockCompanyInfo?: boolean;
  lockTitle?: boolean;
  lockIntro?: boolean;
  lockPayment?: boolean;
  lockThanks?: boolean;
  lockFooter?: boolean;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: number;
  method: string;
  note?: string;
}



