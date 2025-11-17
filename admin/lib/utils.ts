import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount: number, currency: string = 'ج.م'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency === 'ج.م' ? 'EGP' : 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date
export function formatDate(date: string | Date, locale: string = 'ar-EG'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format time
export function formatTime(date: string | Date, locale: string = 'ar-EG'): string {
  return new Date(date).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format date and time
export function formatDateTime(date: string | Date, locale: string = 'ar-EG'): string {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Validate email
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate phone number (Egyptian format)
export function validatePhone(phone: string): boolean {
  const regex = /^01[0-9]{9}$/;
  return regex.test(phone);
}
