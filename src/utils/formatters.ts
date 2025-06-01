import { format, isValid, parse } from 'date-fns';
import { de } from 'date-fns/locale';

// Format currency for display in German format
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });
};

// Format date from ISO string to German format
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  if (!isValid(date)) return '';
  return format(date, 'dd.MM.yyyy', { locale: de });
};

// Parse German formatted date to ISO string
export const parseGermanDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = parse(dateString, 'dd.MM.yyyy', new Date(), { locale: de });
    if (!isValid(date)) return '';
    return date.toISOString();
  } catch (error) {
    return '';
  }
};

// Format recurrence frequencies in German
export const formatFrequency = (
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  dayOfMonth?: number
): string => {
  switch (frequency) {
    case 'daily':
      return 'Täglich';
    case 'weekly':
      return 'Wöchentlich';
    case 'monthly':
      return dayOfMonth ? `Monatlich (am ${dayOfMonth}.)`  : 'Monatlich';
    case 'yearly':
      return 'Jährlich';
    default:
      return '';
  }
};

// Format account type in German
export const formatAccountType = (type: string): string => {
  switch (type) {
    case 'giro_account':
      return 'Girokonto';
    case 'debit_card':
      return 'Debitkarte';
    case 'savings':
      return 'Sparkonto';
    case 'cash':
      return 'Bargeld';
    case 'other':
      return 'Sonstiges';
    default:
      return type;
  }
};

// Format investment type in German
export const formatInvestmentType = (type: string): string => {
  switch (type) {
    case 'stock':
      return 'Aktien';
    case 'bond':
      return 'Anleihen';
    case 'crypto':
      return 'Kryptowährung';
    case 'real_estate':
      return 'Immobilien';
    case 'other':
      return 'Sonstiges';
    default:
      return type;
  }
};

// Format debt type in German
export const formatDebtType = (type: string): string => {
  switch (type) {
    case 'personal':
      return 'Persönliche Schuld';
    case 'credit':
      return 'Kredit';
    default:
      return type;
  }
};

// Abbreviate long names or descriptions
export const abbreviateText = (text: string, maxLength: number = 25): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Convert an ISO string date to a yyyy-mm-dd format for input[type="date"] elements
export const formatDateForInput = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (!isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
};