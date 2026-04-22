import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currencyCode: string = 'EUR') {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch (e) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }
}

export function formatDate(date: string | Date | number, formatStr: string = 'DD.MM.YYYY') {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString();

  if (formatStr === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  } else if (formatStr === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }
  
  // Default: DD.MM.YYYY
  return `${day}.${month}.${year}`;
}
