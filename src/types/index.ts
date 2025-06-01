export interface Person {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  personId: string;
  name: string;
  type: 'debit_card' | 'giro_account' | 'savings' | 'cash' | 'other';
  balance: number;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  personId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  description: string;
  isRecurring: boolean;
}

export interface RecurringEntry {
  id: string;
  personId: string;
  accountId: string;
  categoryId: string;
  name: string;
  amount: number;
  startDate: string; // ISO string
  endDate: string | null; // ISO string or null for indefinite
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  description: string;
}

export interface AmountSchedule {
  id: string;
  entryId: string; // ID of RecurringEntry
  startDate: string; // ISO string
  endDate: string | null; // ISO string or null
  amount: number;
}

export interface Subscription {
  id: string;
  personId: string;
  accountId: string;
  name: string;
  amount: number;
  startDate: string; // ISO string
  endDate: string | null; // ISO string or null
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dayOfMonth?: number; // For monthly subscriptions
  categoryId: string;
  description: string;
}

export interface Debt {
  id: string;
  personId: string;
  name: string;
  type: 'personal' | 'credit';
  totalAmount: number;
  remainingAmount: number;
  interestRate?: number;
  monthlyPayment?: number; // Only required for credit debts
  startDate: string; // ISO string
  endDate: string | null; // ISO string
  dayOfMonth?: number; // Only required for credit debts
  accountId: string; // Account from which payments are made
  description: string;
}

export interface Investment {
  id: string;
  personId: string;
  assetName: string;
  assetType: 'stock' | 'bond' | 'crypto' | 'real_estate' | 'other';
  purchaseDate: string; // ISO string
  units: number;
  purchasePricePerUnit: number;
  currentPricePerUnit: number;
  currency: string;
  notes: string;
}

export interface FilterCriteria {
  personIds: string[];
  accountIds: string[];
  categoryIds: string[];
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number | null;
  amountMax: number | null;
  searchTerm: string;
}

export interface BackupData {
  timestamp: string;
  persons: Person[];
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurringEntries: RecurringEntry[];
  amountSchedules: AmountSchedule[];
  subscriptions: Subscription[];
  debts: Debt[];
  investments: Investment[];
}