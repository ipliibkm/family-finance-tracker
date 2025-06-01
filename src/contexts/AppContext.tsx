import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Person, Account, Category, Transaction, RecurringEntry, 
  Subscription, Debt, Investment, AmountSchedule, BackupData 
} from '../types';
import { defaultCategories } from '../data/defaultData';

interface AppContextType {
  // Data
  persons: Person[];
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurringEntries: RecurringEntry[];
  amountSchedules: AmountSchedule[];
  subscriptions: Subscription[];
  debts: Debt[];
  investments: Investment[];
  
  // Person actions
  addPerson: (person: Omit<Person, 'id'>) => string;
  updatePerson: (person: Person) => void;
  deletePerson: (id: string) => void;
  
  // Account actions
  addAccount: (account: Omit<Account, 'id'>) => string;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => string;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => string;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  
  // Recurring entry actions
  addRecurringEntry: (entry: Omit<RecurringEntry, 'id'>) => string;
  updateRecurringEntry: (entry: RecurringEntry) => void;
  deleteRecurringEntry: (id: string) => void;
  
  // Amount schedule actions
  addAmountSchedule: (schedule: Omit<AmountSchedule, 'id'>) => string;
  updateAmountSchedule: (schedule: AmountSchedule) => void;
  deleteAmountSchedule: (id: string) => void;
  
  // Subscription actions
  addSubscription: (subscription: Omit<Subscription, 'id'>) => string;
  updateSubscription: (subscription: Subscription) => void;
  deleteSubscription: (id: string) => void;
  
  // Debt actions
  addDebt: (debt: Omit<Debt, 'id'>) => string;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;
  
  // Investment actions
  addInvestment: (investment: Omit<Investment, 'id'>) => string;
  updateInvestment: (investment: Investment) => void;
  deleteInvestment: (id: string) => void;
  
  // Data management
  exportData: () => BackupData;
  importData: (data: BackupData) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for all data
  const [persons, setPersons] = useState<Person[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringEntries, setRecurringEntries] = useState<RecurringEntry[]>([]);
  const [amountSchedules, setAmountSchedules] = useState<AmountSchedule[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadData = () => {
      const storedPersons = localStorage.getItem('persons');
      const storedAccounts = localStorage.getItem('accounts');
      const storedCategories = localStorage.getItem('categories');
      const storedTransactions = localStorage.getItem('transactions');
      const storedRecurringEntries = localStorage.getItem('recurringEntries');
      const storedAmountSchedules = localStorage.getItem('amountSchedules');
      const storedSubscriptions = localStorage.getItem('subscriptions');
      const storedDebts = localStorage.getItem('debts');
      const storedInvestments = localStorage.getItem('investments');
      
      setPersons(storedPersons ? JSON.parse(storedPersons) : []);
      setAccounts(storedAccounts ? JSON.parse(storedAccounts) : []);
      setCategories(storedCategories ? JSON.parse(storedCategories) : defaultCategories);
      setTransactions(storedTransactions ? JSON.parse(storedTransactions) : []);
      setRecurringEntries(storedRecurringEntries ? JSON.parse(storedRecurringEntries) : []);
      setAmountSchedules(storedAmountSchedules ? JSON.parse(storedAmountSchedules) : []);
      setSubscriptions(storedSubscriptions ? JSON.parse(storedSubscriptions) : []);
      setDebts(storedDebts ? JSON.parse(storedDebts) : []);
      setInvestments(storedInvestments ? JSON.parse(storedInvestments) : []);
    };
    
    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('persons', JSON.stringify(persons));
  }, [persons]);
  
  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);
  
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('recurringEntries', JSON.stringify(recurringEntries));
  }, [recurringEntries]);
  
  useEffect(() => {
    localStorage.setItem('amountSchedules', JSON.stringify(amountSchedules));
  }, [amountSchedules]);
  
  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);
  
  useEffect(() => {
    localStorage.setItem('debts', JSON.stringify(debts));
  }, [debts]);
  
  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  // Person actions
  const addPerson = (personData: Omit<Person, 'id'>) => {
    const id = uuidv4();
    const newPerson = { id, ...personData };
    setPersons([...persons, newPerson]);
    return id;
  };
  
  const updatePerson = (updatedPerson: Person) => {
    setPersons(persons.map(person => 
      person.id === updatedPerson.id ? updatedPerson : person
    ));
  };
  
  const deletePerson = (id: string) => {
    setPersons(persons.filter(person => person.id !== id));
    // Also delete related accounts and transactions
    setAccounts(accounts.filter(account => account.personId !== id));
    setTransactions(transactions.filter(transaction => transaction.personId !== id));
    setRecurringEntries(recurringEntries.filter(entry => entry.personId !== id));
    setSubscriptions(subscriptions.filter(sub => sub.personId !== id));
    setDebts(debts.filter(debt => debt.personId !== id));
    setInvestments(investments.filter(inv => inv.personId !== id));
  };

  // Account actions
  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const id = uuidv4();
    const newAccount = { id, ...accountData };
    setAccounts([...accounts, newAccount]);
    return id;
  };
  
  const updateAccount = (updatedAccount: Account) => {
    setAccounts(accounts.map(account => 
      account.id === updatedAccount.id ? updatedAccount : account
    ));
  };
  
  const deleteAccount = (id: string) => {
    setAccounts(accounts.filter(account => account.id !== id));
    // Also delete related transactions
    setTransactions(transactions.filter(transaction => transaction.accountId !== id));
    setRecurringEntries(recurringEntries.filter(entry => entry.accountId !== id));
    setSubscriptions(subscriptions.filter(sub => sub.accountId !== id));
    setDebts(debts.filter(debt => debt.accountId !== id));
  };

  // Category actions
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const id = uuidv4();
    const newCategory = { id, ...categoryData };
    setCategories([...categories, newCategory]);
    return id;
  };
  
  const updateCategory = (updatedCategory: Category) => {
    setCategories(categories.map(category => 
      category.id === updatedCategory.id ? updatedCategory : category
    ));
  };
  
  const deleteCategory = (id: string) => {
    // Don't allow deletion if category is in use
    const inUse = transactions.some(t => t.categoryId === id) || 
                  recurringEntries.some(e => e.categoryId === id) ||
                  subscriptions.some(s => s.categoryId === id);
    
    if (inUse) {
      alert('Cannot delete category as it is in use by transactions or recurring entries');
      return;
    }
    
    setCategories(categories.filter(category => category.id !== id));
  };

  // Transaction actions
  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const id = uuidv4();
    const newTransaction = { id, ...transactionData };
    setTransactions([...transactions, newTransaction]);
    
    // Update account balance
    const account = accounts.find(a => a.id === transactionData.accountId);
    if (account) {
      const updatedAccount = { 
        ...account, 
        balance: account.balance + transactionData.amount 
      };
      updateAccount(updatedAccount);
    }
    
    return id;
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (!oldTransaction) return;
    
    // Update account balance if amount or account changed
    if (oldTransaction.amount !== updatedTransaction.amount || 
        oldTransaction.accountId !== updatedTransaction.accountId) {
      
      // Revert old transaction
      const oldAccount = accounts.find(a => a.id === oldTransaction.accountId);
      if (oldAccount) {
        const revertedAccount = {
          ...oldAccount,
          balance: oldAccount.balance - oldTransaction.amount
        };
        updateAccount(revertedAccount);
      }
      
      // Apply new transaction
      const newAccount = accounts.find(a => a.id === updatedTransaction.accountId);
      if (newAccount) {
        const updatedAccount = {
          ...newAccount,
          balance: newAccount.balance + updatedTransaction.amount
        };
        updateAccount(updatedAccount);
      }
    }
    
    setTransactions(transactions.map(transaction => 
      transaction.id === updatedTransaction.id ? updatedTransaction : transaction
    ));
  };
  
  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Update account balance
    const account = accounts.find(a => a.id === transaction.accountId);
    if (account) {
      const updatedAccount = {
        ...account,
        balance: account.balance - transaction.amount
      };
      updateAccount(updatedAccount);
    }
    
    setTransactions(transactions.filter(transaction => transaction.id !== id));
  };

  // Recurring entry actions
  const addRecurringEntry = (entryData: Omit<RecurringEntry, 'id'>) => {
    const id = uuidv4();
    const newEntry = { id, ...entryData };
    setRecurringEntries([...recurringEntries, newEntry]);
    return id;
  };
  
  const updateRecurringEntry = (updatedEntry: RecurringEntry) => {
    setRecurringEntries(recurringEntries.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };
  
  const deleteRecurringEntry = (id: string) => {
    setRecurringEntries(recurringEntries.filter(entry => entry.id !== id));
    // Also delete related amount schedules
    setAmountSchedules(amountSchedules.filter(schedule => schedule.entryId !== id));
  };

  // Amount schedule actions
  const addAmountSchedule = (scheduleData: Omit<AmountSchedule, 'id'>) => {
    const id = uuidv4();
    const newSchedule = { id, ...scheduleData };
    setAmountSchedules([...amountSchedules, newSchedule]);
    return id;
  };
  
  const updateAmountSchedule = (updatedSchedule: AmountSchedule) => {
    setAmountSchedules(amountSchedules.map(schedule => 
      schedule.id === updatedSchedule.id ? updatedSchedule : schedule
    ));
  };
  
  const deleteAmountSchedule = (id: string) => {
    setAmountSchedules(amountSchedules.filter(schedule => schedule.id !== id));
  };

  // Subscription actions
  const addSubscription = (subscriptionData: Omit<Subscription, 'id'>) => {
    const id = uuidv4();
    const newSubscription = { id, ...subscriptionData };
    setSubscriptions([...subscriptions, newSubscription]);
    return id;
  };
  
  const updateSubscription = (updatedSubscription: Subscription) => {
    setSubscriptions(subscriptions.map(subscription => 
      subscription.id === updatedSubscription.id ? updatedSubscription : subscription
    ));
  };
  
  const deleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(subscription => subscription.id !== id));
  };

  // Debt actions
  const addDebt = (debtData: Omit<Debt, 'id'>) => {
    const id = uuidv4();
    const newDebt = { id, ...debtData };
    setDebts([...debts, newDebt]);
    return id;
  };
  
  const updateDebt = (updatedDebt: Debt) => {
    setDebts(debts.map(debt => 
      debt.id === updatedDebt.id ? updatedDebt : debt
    ));
  };
  
  const deleteDebt = (id: string) => {
    setDebts(debts.filter(debt => debt.id !== id));
  };

  // Investment actions
  const addInvestment = (investmentData: Omit<Investment, 'id'>) => {
    const id = uuidv4();
    const newInvestment = { id, ...investmentData };
    setInvestments([...investments, newInvestment]);
    return id;
  };
  
  const updateInvestment = (updatedInvestment: Investment) => {
    setInvestments(investments.map(investment => 
      investment.id === updatedInvestment.id ? updatedInvestment : investment
    ));
  };
  
  const deleteInvestment = (id: string) => {
    setInvestments(investments.filter(investment => investment.id !== id));
  };

  // Data management
  const exportData = (): BackupData => {
    return {
      timestamp: new Date().toISOString(),
      persons,
      accounts,
      categories,
      transactions,
      recurringEntries,
      amountSchedules,
      subscriptions,
      debts,
      investments
    };
  };
  
  const importData = (data: BackupData) => {
    setPersons(data.persons);
    setAccounts(data.accounts);
    setCategories(data.categories);
    setTransactions(data.transactions);
    setRecurringEntries(data.recurringEntries);
    setAmountSchedules(data.amountSchedules);
    setSubscriptions(data.subscriptions);
    setDebts(data.debts);
    setInvestments(data.investments);
  };
  
  const resetData = () => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      setPersons([]);
      setAccounts([]);
      setCategories(defaultCategories);
      setTransactions([]);
      setRecurringEntries([]);
      setAmountSchedules([]);
      setSubscriptions([]);
      setDebts([]);
      setInvestments([]);
    }
  };

  const value: AppContextType = {
    // Data
    persons,
    accounts,
    categories,
    transactions,
    recurringEntries,
    amountSchedules,
    subscriptions,
    debts,
    investments,
    
    // Person actions
    addPerson,
    updatePerson,
    deletePerson,
    
    // Account actions
    addAccount,
    updateAccount,
    deleteAccount,
    
    // Category actions
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Transaction actions
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Recurring entry actions
    addRecurringEntry,
    updateRecurringEntry,
    deleteRecurringEntry,
    
    // Amount schedule actions
    addAmountSchedule,
    updateAmountSchedule,
    deleteAmountSchedule,
    
    // Subscription actions
    addSubscription,
    updateSubscription,
    deleteSubscription,
    
    // Debt actions
    addDebt,
    updateDebt,
    deleteDebt,
    
    // Investment actions
    addInvestment,
    updateInvestment,
    deleteInvestment,
    
    // Data management
    exportData,
    importData,
    resetData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};