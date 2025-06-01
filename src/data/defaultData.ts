import { Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const defaultCategories: Category[] = [
  // Income categories
  {
    id: uuidv4(),
    name: 'Gehalt',
    type: 'income',
    color: '#36B37E'
  },
  {
    id: uuidv4(),
    name: 'Bonus',
    type: 'income',
    color: '#00B8D9'
  },
  {
    id: uuidv4(),
    name: 'Geschenk',
    type: 'income',
    color: '#6554C0'
  },
  {
    id: uuidv4(),
    name: 'Rückerstattung',
    type: 'income',
    color: '#00875A'
  },
  {
    id: uuidv4(),
    name: 'Investitionen',
    type: 'income',
    color: '#0052CC'
  },
  {
    id: uuidv4(),
    name: 'Sonstiges Einkommen',
    type: 'income',
    color: '#8777D9'
  },
  
  // Expense categories
  {
    id: uuidv4(),
    name: 'Lebensmittel',
    type: 'expense',
    color: '#FF5630'
  },
  {
    id: uuidv4(),
    name: 'Wohnen',
    type: 'expense',
    color: '#FF8B00'
  },
  {
    id: uuidv4(),
    name: 'Transport',
    type: 'expense',
    color: '#FFAB00'
  },
  {
    id: uuidv4(),
    name: 'Gesundheit',
    type: 'expense',
    color: '#36B37E'
  },
  {
    id: uuidv4(),
    name: 'Versicherung',
    type: 'expense',
    color: '#00B8D9'
  },
  {
    id: uuidv4(),
    name: 'Unterhaltung',
    type: 'expense',
    color: '#6554C0'
  },
  {
    id: uuidv4(),
    name: 'Shopping',
    type: 'expense',
    color: '#FF5630'
  },
  {
    id: uuidv4(),
    name: 'Restaurant',
    type: 'expense',
    color: '#FF8B00'
  },
  {
    id: uuidv4(),
    name: 'Bildung',
    type: 'expense',
    color: '#00B8D9'
  },
  {
    id: uuidv4(),
    name: 'Abonnements',
    type: 'expense',
    color: '#6554C0'
  },
  {
    id: uuidv4(),
    name: 'Schulden',
    type: 'expense',
    color: '#FF5630'
  },
  {
    id: uuidv4(),
    name: 'Sonstige Ausgaben',
    type: 'expense',
    color: '#8777D9'
  }
];

export const accountTypes = [
  { value: 'giro_account', label: 'Girokonto' },
  { value: 'debit_card', label: 'Debitkarte' },
  { value: 'savings', label: 'Sparkonto' },
  { value: 'cash', label: 'Bargeld' },
  { value: 'other', label: 'Sonstiges' }
];

export const frequencyOptions = [
  { value: 'daily', label: 'Täglich' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'monthly', label: 'Monatlich' },
  { value: 'yearly', label: 'Jährlich' }
];

export const investmentTypes = [
  { value: 'stock', label: 'Aktien' },
  { value: 'bond', label: 'Anleihen' },
  { value: 'crypto', label: 'Kryptowährung' },
  { value: 'real_estate', label: 'Immobilien' },
  { value: 'other', label: 'Sonstiges' }
];

export const debtTypes = [
  { value: 'personal', label: 'Persönlich' },
  { value: 'credit', label: 'Kredit' }
];