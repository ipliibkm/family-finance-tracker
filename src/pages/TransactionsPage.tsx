import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Transaction, FilterCriteria } from '../types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Plus, Trash2, Edit, X, Save, FileText, Filter, Download 
} from 'lucide-react';
import AmountDisplay from '../components/shared/AmountDisplay';
import FilterPanel from '../components/shared/FilterPanel';
import { formatDate, formatDateForInput, abbreviateText } from '../utils/formatters';

const TransactionsPage: React.FC = () => {
  const { 
    persons, 
    accounts, 
    categories, 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction 
  } = useAppContext();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [showAllFilters, setShowAllFilters] = useState(false);
  
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  const [filters, setFilters] = useState<FilterCriteria>({
    personIds: [],
    accountIds: [],
    categoryIds: [],
    dateFrom: localStorage.getItem('transactionDateFrom') || null,
    dateTo: localStorage.getItem('transactionDateTo') || null,
    amountMin: null,
    amountMax: null,
    searchTerm: ''
  });
  
  const [newTransaction, setNewTransaction] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString(),
    personId: '',
    accountId: '',
    categoryId: '',
    amount: 0,
    description: '',
    isRecurring: false
  });
  
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  // Apply filters to transactions
  useEffect(() => {
    let filtered = [...transactions];
    
    // Filter by person
    if (filters.personIds.length > 0) {
      filtered = filtered.filter(transaction => 
        filters.personIds.includes(transaction.personId)
      );
    }
    
    // Filter by account
    if (filters.accountIds.length > 0) {
      filtered = filtered.filter(transaction => 
        filters.accountIds.includes(transaction.accountId)
      );
    }
    
    // Filter by category
    if (filters.categoryIds.length > 0) {
      filtered = filtered.filter(transaction => 
        filters.categoryIds.includes(transaction.categoryId)
      );
    }
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) >= fromDate
      );
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(transaction => 
        new Date(transaction.date) <= toDate
      );
    }
    
    // Filter by amount range
    if (filters.amountMin !== null) {
      filtered = filtered.filter(transaction => transaction.amount >= filters.amountMin!);
    }
    
    if (filters.amountMax !== null) {
      filtered = filtered.filter(transaction => transaction.amount <= filters.amountMax!);
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(term)
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredTransactions(filtered);
    
    // Save date filters to localStorage
    if (filters.dateFrom) {
      localStorage.setItem('transactionDateFrom', filters.dateFrom);
    } else {
      localStorage.removeItem('transactionDateFrom');
    }
    if (filters.dateTo) {
      localStorage.setItem('transactionDateTo', filters.dateTo);
    } else {
      localStorage.removeItem('transactionDateTo');
    }
  }, [transactions, filters]);

  const handleAddTransaction = () => {
    if (newTransaction.personId && newTransaction.accountId && newTransaction.categoryId) {
      addTransaction(newTransaction);
      setNewTransaction({
        date: new Date().toISOString(),
        personId: '',
        accountId: '',
        categoryId: '',
        amount: 0,
        description: '',
        isRecurring: false
      });
      setIsAdding(false);
    }
  };

  const handleUpdateTransaction = () => {
    if (editTransaction && editTransaction.personId && editTransaction.accountId && editTransaction.categoryId) {
      updateTransaction(editTransaction);
      setEditId(null);
      setEditTransaction(null);
    }
  };

  const startEdit = (transaction: Transaction) => {
    setEditId(transaction.id);
    setEditTransaction({ ...transaction });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTransaction(null);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm('Möchten Sie diese Transaktion wirklich löschen?')) {
      deleteTransaction(id);
    }
  };

  // Filter accounts by selected person (for the forms)
  const getPersonAccounts = (personId: string) => {
    return accounts.filter(account => account.personId === personId);
  };
  
  // Get transaction details with related information
  const getTransactionDetails = (transaction: Transaction) => {
    const person = persons.find(p => p.id === transaction.personId);
    const account = accounts.find(a => a.id === transaction.accountId);
    const category = categories.find(c => c.id === transaction.categoryId);
    
    return {
      ...transaction,
      personName: person?.name || 'Unbekannt',
      accountName: account?.name || 'Unbekannt',
      categoryName: category?.name || 'Unbekannt',
      categoryColor: category?.color || '#CCCCCC'
    };
  };
  
  // Export transactions to CSV
  const exportTransactionsCSV = () => {
    // Prepare data
    let csvContent = "Datum;Beschreibung;Betrag;Kategorie;Person;Konto\n";
    
    // Add each transaction
    filteredTransactions.forEach(transaction => {
      const details = getTransactionDetails(transaction);
      const formattedDate = formatDate(transaction.date);
      const formattedAmount = transaction.amount.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      csvContent += `${formattedDate};"${details.description}";${formattedAmount};${details.categoryName};${details.personName};${details.accountName}\n`;
    });
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      personIds: [],
      accountIds: [],
      categoryIds: [],
      dateFrom: null,
      dateTo: null,
      amountMin: null,
      amountMax: null,
      searchTerm: ''
    });
    localStorage.removeItem('transactionDateFrom');
    localStorage.removeItem('transactionDateTo');
  };
  
  // Apply filters
  const applyFilters = () => {
    // Filters are already applied in the useEffect
    setShowAllFilters(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Transaktionen</h1>
        <div className="flex space-x-2">
          <button
            onClick={exportTransactionsCSV}
            className="btn btn-outline flex items-center"
            disabled={filteredTransactions.length === 0}
          >
            <Download size={18} className="mr-1" /> Exportieren
          </button>
          <button 
            onClick={() => setIsAdding(true)} 
            className="btn btn-primary flex items-center"
            disabled={isAdding || accounts.length === 0}
          >
            <Plus size={18} className="mr-1" /> Transaktion hinzufügen
          </button>
        </div>
      </div>

      <FilterPanel 
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={applyFilters}
      />

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <FileText size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="mb-4">Sie müssen zuerst eine Person und ein Konto hinzufügen, bevor Sie Transaktionen erstellen können.</p>
          <button 
            onClick={() => window.location.href = '/accounts'} 
            className="btn btn-primary"
          >
            Konto hinzufügen
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {isAdding && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-fade-in">
              <h3 className="font-medium mb-3">Neue Transaktion hinzufügen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="transaction-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    id="transaction-date"
                    value={formatDateForInput(newTransaction.date)}
                    onChange={(e) => setNewTransaction({ 
                      ...newTransaction, 
                      date: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                    })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="transaction-person" className="block text-sm font-medium text-gray-700 mb-1">
                    Person
                  </label>
                  <select
                    id="transaction-person"
                    value={newTransaction.personId}
                    onChange={(e) => {
                      const personId = e.target.value;
                      setNewTransaction({ 
                        ...newTransaction, 
                        personId,
                        accountId: '' // Reset account when person changes
                      });
                    }}
                    className="select"
                    required
                  >
                    <option value="">Person auswählen</option>
                    {persons.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="transaction-account" className="block text-sm font-medium text-gray-700 mb-1">
                    Konto
                  </label>
                  <select
                    id="transaction-account"
                    value={newTransaction.accountId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, accountId: e.target.value })}
                    className="select"
                    disabled={!newTransaction.personId}
                  >
                    <option value="">Konto auswählen</option>
                    {newTransaction.personId && getPersonAccounts(newTransaction.personId).map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="transaction-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie
                  </label>
                  <select
                    id="transaction-category"
                    value={newTransaction.categoryId}
                    onChange={(e) => setNewTransaction({ ...newTransaction, categoryId: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="">Kategorie auswählen</option>
                    <optgroup label="Einkommen">
                      {categories.filter(c => c.type === 'income').map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Ausgaben">
                      {categories.filter(c => c.type === 'expense').map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="transaction-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Betrag (€)
                  </label>
                  <input
                    type="number"
                    id="transaction-amount"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
                    step="0.01"
                    className="input"
                    placeholder="Positive für Einnahmen, negative für Ausgaben"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="transaction-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <input
                    type="text"
                    id="transaction-description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    className="input"
                    placeholder="Beschreibung hinzufügen"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAddTransaction}
                  className="btn btn-success mr-2 flex items-center"
                  disabled={!newTransaction.personId || !newTransaction.accountId || !newTransaction.categoryId}
                >
                  <Save size={18} className="mr-1" /> Speichern
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewTransaction({
                      date: new Date().toISOString(),
                      personId: '',
                      accountId: '',
                      categoryId: '',
                      amount: 0,
                      description: '',
                      isRecurring: false
                    });
                  }}
                  className="btn btn-outline flex items-center"
                >
                  <X size={18} className="mr-1" /> Abbrechen
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText size={40} className="mx-auto mb-2 text-gray-300" />
                <p className="mb-4">Keine Transaktionen gefunden</p>
                <button 
                  onClick={() => setIsAdding(true)} 
                  className="btn btn-primary"
                  disabled={accounts.length === 0}
                >
                  Transaktion hinzufügen
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datum
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Beschreibung
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategorie
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Person
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Konto
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Betrag
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map(transaction => {
                      const details = getTransactionDetails(transaction);
                      return (
                        <tr key={transaction.id} className={editId === transaction.id ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                          {editId === transaction.id && editTransaction ? (
                            <td colSpan={7} className="px-4 py-3 animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label htmlFor="edit-transaction-date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Datum
                                  </label>
                                  <input
                                    type="date"
                                    id="edit-transaction-date"
                                    value={formatDateForInput(editTransaction.date)}
                                    onChange={(e) => setEditTransaction({ 
                                      ...editTransaction, 
                                      date: e.target.value ? new Date(e.target.value).toISOString() : editTransaction.date
                                    })}
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-transaction-person" className="block text-sm font-medium text-gray-700 mb-1">
                                    Person
                                  </label>
                                  <select
                                    id="edit-transaction-person"
                                    value={editTransaction.personId}
                                    onChange={(e) => {
                                      const personId = e.target.value;
                                      setEditTransaction({ 
                                        ...editTransaction, 
                                        personId,
                                        accountId: '' // Reset account when person changes
                                      });
                                    }}
                                    className="select"
                                    required
                                  >
                                    <option value="">Person auswählen</option>
                                    {persons.map(person => (
                                      <option key={person.id} value={person.id}>{person.name}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-transaction-account" className="block text-sm font-medium text-gray-700 mb-1">
                                    Konto
                                  </label>
                                  <select
                                    id="edit-transaction-account"
                                    value={editTransaction.accountId}
                                    onChange={(e) => setEditTransaction({ ...editTransaction, accountId: e.target.value })}
                                    className="select"
                                    required
                                    disabled={!editTransaction.personId}
                                  >
                                    <option value="">Konto auswählen</option>
                                    {editTransaction.personId && getPersonAccounts(editTransaction.personId).map(account => (
                                      <option key={account.id} value={account.id}>{account.name}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-transaction-category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Kategorie
                                  </label>
                                  <select
                                    id="edit-transaction-category"
                                    value={editTransaction.categoryId}
                                    onChange={(e) => setEditTransaction({ ...editTransaction, categoryId: e.target.value })}
                                    className="select"
                                    required
                                  >
                                    <option value="">Kategorie auswählen</option>
                                    <optgroup label="Einkommen">
                                      {categories.filter(c => c.type === 'income').map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="Ausgaben">
                                      {categories.filter(c => c.type === 'expense').map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                      ))}
                                    </optgroup>
                                  </select>
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-transaction-amount" className="block text-sm font-medium text-gray-700 mb-1">
                                    Betrag (€)
                                  </label>
                                  <input
                                    type="number"
                                    id="edit-transaction-amount"
                                    value={editTransaction.amount}
                                    onChange={(e) => setEditTransaction({ ...editTransaction, amount: parseFloat(e.target.value) })}
                                    step="0.01"
                                    className="input"
                                  />
                                </div>
                                
                                <div className="md:col-span-2">
                                  <label htmlFor="edit-transaction-description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Beschreibung
                                  </label>
                                  <input
                                    type="text"
                                    id="edit-transaction-description"
                                    value={editTransaction.description}
                                    onChange={(e) => setEditTransaction({ ...editTransaction, description: e.target.value })}
                                    className="input"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <button 
                                  onClick={handleUpdateTransaction}
                                  className="btn btn-success mr-2 flex items-center"
                                  disabled={!editTransaction.personId || !editTransaction.accountId || !editTransaction.categoryId}
                                >
                                  <Save size={18} className="mr-1" /> Speichern
                                </button>
                                <button 
                                  onClick={cancelEdit}
                                  className="btn btn-outline flex items-center"
                                >
                                  <X size={18} className="mr-1" /> Abbrechen
                                </button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {formatDate(transaction.date)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {abbreviateText(transaction.description, 30) || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex items-center">
                                  <span 
                                    className="inline-block w-3 h-3 rounded-full mr-1" 
                                    style={{ backgroundColor: details.categoryColor }}
                                  ></span>
                                  {details.categoryName}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">{details.personName}</td>
                              <td className="px-4 py-3 text-sm">{details.accountName}</td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <AmountDisplay amount={transaction.amount} />
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                <button
                                  onClick={() => startEdit(transaction)}
                                  className="text-gray-500 hover:text-primary-400 p-1"
                                  title="Bearbeiten"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => confirmDelete(transaction.id)}
                                  className="text-gray-500 hover:text-error-400 p-1 ml-1"
                                  title="Löschen"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;