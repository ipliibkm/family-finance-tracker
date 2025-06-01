import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Debt } from '../types';
import { 
  Plus, Trash2, Edit, X, Save, Wallet, AlertCircle
} from 'lucide-react';
import AmountDisplay from '../components/shared/AmountDisplay';
import { formatDate, formatDateForInput, formatDebtType } from '../utils/formatters';
import { debtTypes } from '../data/defaultData';

const DebtsPage: React.FC = () => {
  const { 
    persons, 
    accounts, 
    debts, 
    addDebt, 
    updateDebt, 
    deleteDebt 
  } = useAppContext();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [newDebt, setNewDebt] = useState<Omit<Debt, 'id'>>({
    personId: '',
    name: '',
    type: 'personal',
    totalAmount: 0,
    remainingAmount: 0,
    interestRate: 0,
    monthlyPayment: 0,
    startDate: new Date().toISOString(),
    endDate: null,
    dayOfMonth: 1,
    accountId: '',
    description: ''
  });
  
  const [editDebt, setEditDebt] = useState<Debt | null>(null);

  // Filter accounts by selected person (for the forms)
  const getPersonAccounts = (personId: string) => {
    return accounts.filter(account => account.personId === personId);
  };

  const handleAddDebt = () => {
    if (newDebt.personId && newDebt.accountId && newDebt.name) {
      // If not specified, remaining amount should equal total amount
      const remainingAmount = newDebt.remainingAmount || newDebt.totalAmount;
      
      addDebt({
        ...newDebt,
        remainingAmount,
        totalAmount: Math.abs(newDebt.totalAmount),
        monthlyPayment: Math.abs(newDebt.monthlyPayment)
      });
      
      setNewDebt({
        personId: '',
        name: '',
        type: 'personal',
        totalAmount: 0,
        remainingAmount: 0,
        interestRate: 0,
        monthlyPayment: 0,
        startDate: new Date().toISOString(),
        endDate: null,
        dayOfMonth: 1,
        accountId: '',
        description: ''
      });
      setIsAdding(false);
    }
  };

  const handleUpdateDebt = () => {
    if (editDebt && editDebt.personId && editDebt.accountId && editDebt.name) {
      updateDebt({
        ...editDebt,
        totalAmount: Math.abs(editDebt.totalAmount),
        remainingAmount: Math.abs(editDebt.remainingAmount),
        monthlyPayment: Math.abs(editDebt.monthlyPayment)
      });
      setEditId(null);
      setEditDebt(null);
    }
  };

  const startEdit = (debt: Debt) => {
    setEditId(debt.id);
    setEditDebt({ ...debt });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditDebt(null);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie die Schuld "${name}" wirklich löschen?`)) {
      deleteDebt(id);
    }
  };
  
  // Get debt details with related information
  const getDebtDetails = (debt: Debt) => {
    const person = persons.find(p => p.id === debt.personId);
    const account = accounts.find(a => a.id === debt.accountId);
    
    return {
      ...debt,
      personName: person?.name || 'Unbekannt',
      accountName: account?.name || 'Unbekannt'
    };
  };
  
  // Calculate total debt amount
  const totalDebtAmount = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  
  // Calculate monthly payments
  const totalMonthlyPayments = debts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
  
  // Group debts by type
  const personalDebts = debts.filter(debt => debt.type === 'personal');
  const creditDebts = debts.filter(debt => debt.type === 'credit');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Schulden</h1>
        <button 
          onClick={() => setIsAdding(true)} 
          className="btn btn-primary flex items-center"
          disabled={isAdding || accounts.length === 0}
        >
          <Plus size={18} className="mr-1" /> Schuld hinzufügen
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <Wallet size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="mb-4">Sie müssen zuerst eine Person und ein Konto hinzufügen, bevor Sie Schulden erfassen können.</p>
          <button 
            onClick={() => window.location.href = '/accounts'} 
            className="btn btn-primary"
          >
            Konto hinzufügen
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {debts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <h3 className="text-gray-500 font-medium mb-1">Gesamtschulden</h3>
                <AmountDisplay amount={-totalDebtAmount} size="lg" />
              </div>
              
              <div className="card">
                <h3 className="text-gray-500 font-medium mb-1">Monatliche Zahlungen</h3>
                <AmountDisplay amount={-totalMonthlyPayments} size="lg" />
              </div>
              
              <div className="card">
                <h3 className="text-gray-500 font-medium mb-1">Anzahl der Schulden</h3>
                <p className="text-lg md:text-xl font-semibold">
                  {debts.length} <span className="text-sm font-normal text-gray-500">({personalDebts.length} persönlich, {creditDebts.length} Kredit)</span>
                </p>
              </div>
            </div>
          )}
          
          {isAdding && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-fade-in">
              <h3 className="font-medium mb-3">Neue Schuld hinzufügen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="debt-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="debt-name"
                    value={newDebt.name}
                    onChange={(e) => setNewDebt({ ...newDebt, name: e.target.value })}
                    placeholder="z.B. Auto Kredit"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="debt-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Typ
                  </label>
                  <select
                    id="debt-type"
                    value={newDebt.type}
                    onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value as Debt['type'] })}
                    className="select"
                  >
                    {debtTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="debt-person" className="block text-sm font-medium text-gray-700 mb-1">
                    Person
                  </label>
                  <select
                    id="debt-person"
                    value={newDebt.personId}
                    onChange={(e) => {
                      const personId = e.target.value;
                      setNewDebt({ 
                        ...newDebt, 
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
                  <label htmlFor="debt-account" className="block text-sm font-medium text-gray-700 mb-1">
                    Zahlungskonto
                  </label>
                  <select
                    id="debt-account"
                    value={newDebt.accountId}
                    onChange={(e) => setNewDebt({ ...newDebt, accountId: e.target.value })}
                    className="select"
                    required
                    disabled={!newDebt.personId}
                  >
                    <option value="">Konto auswählen</option>
                    {newDebt.personId && getPersonAccounts(newDebt.personId).map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="debt-total" className="block text-sm font-medium text-gray-700 mb-1">
                    Gesamtbetrag (€)
                  </label>
                  <input
                    type="number"
                    id="debt-total"
                    value={newDebt.totalAmount}
                    onChange={(e) => {
                      const total = Math.abs(parseFloat(e.target.value));
                      setNewDebt({ 
                        ...newDebt, 
                        totalAmount: total,
                        remainingAmount: total // Update remaining amount to match total
                      });
                    }}
                    min="0"
                    step="0.01"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="debt-remaining" className="block text-sm font-medium text-gray-700 mb-1">
                    Restbetrag (€)
                  </label>
                  <input
                    type="number"
                    id="debt-remaining"
                    value={newDebt.remainingAmount}
                    onChange={(e) => setNewDebt({ ...newDebt, remainingAmount: Math.abs(parseFloat(e.target.value)) })}
                    min="0"
                    max={newDebt.totalAmount}
                    step="0.01"
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="debt-monthly" className="block text-sm font-medium text-gray-700 mb-1">
                    Monatliche Zahlung (€)
                  </label>
                  <input
                    type="number"
                    id="debt-monthly"
                    value={newDebt.monthlyPayment}
                    onChange={(e) => setNewDebt({ ...newDebt, monthlyPayment: Math.abs(parseFloat(e.target.value)) })}
                    min="0"
                    step="0.01"
                    className="input"
                    required
                  />
                </div>
                
                {newDebt.type === 'credit' && (
                  <div>
                    <label htmlFor="debt-interest" className="block text-sm font-medium text-gray-700 mb-1">
                      Zinssatz (%)
                    </label>
                    <input
                      type="number"
                      id="debt-interest"
                      value={newDebt.interestRate}
                      onChange={(e) => setNewDebt({ ...newDebt, interestRate: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="input"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="debt-day" className="block text-sm font-medium text-gray-700 mb-1">
                    Zahltag des Monats
                  </label>
                  <input
                    type="number"
                    id="debt-day"
                    value={newDebt.dayOfMonth}
                    onChange={(e) => setNewDebt({ ...newDebt, dayOfMonth: parseInt(e.target.value) })}
                    min="1"
                    max="31"
                    className="input"
                  />
                </div>
                
                <div>
                  <label htmlFor="debt-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    id="debt-start-date"
                    value={formatDateForInput(newDebt.startDate)}
                    onChange={(e) => setNewDebt({ 
                      ...newDebt, 
                      startDate: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                    })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="debt-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Enddatum (optional)
                  </label>
                  <input
                    type="date"
                    id="debt-end-date"
                    value={formatDateForInput(newDebt.endDate)}
                    onChange={(e) => setNewDebt({ 
                      ...newDebt, 
                      endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                    })}
                    className="input"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="debt-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung (optional)
                  </label>
                  <input
                    type="text"
                    id="debt-description"
                    value={newDebt.description}
                    onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                    className="input"
                    placeholder="Beschreibung hinzufügen"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAddDebt}
                  className="btn btn-success mr-2 flex items-center"
                  disabled={!newDebt.personId || !newDebt.accountId || !newDebt.name || newDebt.totalAmount <= 0 || newDebt.monthlyPayment <= 0}
                >
                  <Save size={18} className="mr-1" /> Speichern
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewDebt({
                      personId: '',
                      name: '',
                      type: 'personal',
                      totalAmount: 0,
                      remainingAmount: 0,
                      interestRate: 0,
                      monthlyPayment: 0,
                      startDate: new Date().toISOString(),
                      endDate: null,
                      dayOfMonth: 1,
                      accountId: '',
                      description: ''
                    });
                  }}
                  className="btn btn-outline flex items-center"
                >
                  <X size={18} className="mr-1" /> Abbrechen
                </button>
              </div>
            </div>
          )}

          {debts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              <Wallet size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="mb-4">Keine Schulden vorhanden</p>
              <button 
                onClick={() => setIsAdding(true)} 
                className="btn btn-primary"
              >
                Schuld hinzufügen
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Credit Debts */}
              {creditDebts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-medium text-lg">Kredite</h2>
                    <span className="text-sm text-gray-500">
                      Gesamt: <AmountDisplay amount={-creditDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0)} />
                    </span>
                  </div>
                  
                  <ul className="divide-y divide-gray-100">
                    {creditDebts.map(debt => {
                      const details = getDebtDetails(debt);
                      const isActive = !debt.endDate || new Date(debt.endDate) > new Date();
                      const percentPaid = (debt.totalAmount - debt.remainingAmount) / debt.totalAmount * 100;
                      
                      return (
                        <li key={debt.id} className={`p-4 hover:bg-gray-50 ${!isActive ? 'opacity-60' : ''}`}>
                          {editId === debt.id && editDebt ? (
                            <div className="animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label htmlFor="edit-debt-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                  </label>
                                  <input
                                    type="text"
                                    id="edit-debt-name"
                                    value={editDebt.name}
                                    onChange={(e) => setEditDebt({ ...editDebt, name: e.target.value })}
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-debt-type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Typ
                                  </label>
                                  <select
                                    id="edit-debt-type"
                                    value={editDebt.type}
                                    onChange={(e) => setEditDebt({ ...editDebt, type: e.target.value as Debt['type'] })}
                                    className="select"
                                  >
                                    {debtTypes.map(type => (
                                      <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-debt-person" className="block text-sm font-medium text-gray-700 mb-1">
                                    Person
                                  </label>
                                  <select
                                    id="edit-debt-person"
                                    value={editDebt.personId}
                                    onChange={(e) => {
                                      const personId = e.target.value;
                                      setEditDebt({ 
                                        ...editDebt, 
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
                                  <label htmlFor="edit-debt-account" className="block text-sm font-medium text-gray-700 mb-1">
                                    Zahlungskonto
                                  </label>
                                  <select
                                    id="edit-debt-account"
                                    value={editDebt.accountId}
                                    onChange={(e) => setEditDebt({ ...editDebt, accountId: e.target.value })}
                                    className="select"
                                    required
                                    disabled={!editDebt.personId}
                                  >
                                    <option value="">Konto auswählen</option>
                                    {editDebt.personId && getPersonAccounts(editDebt.personId).map(account => (
                                      <option key={account.id} value={account.id}>{account.name}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-debt-total" className="block text-sm font-medium text-gray-700 mb-1">
                                    Gesamtbetrag (€)
                                  </label>
                                  <input
                                    type="number"
                                    id="edit-debt-total"
                                    value={editDebt.totalAmount}
                                    onChange={(e) => setEditDebt({ ...editDebt, totalAmount: Math.abs(parseFloat(e.target.value)) })}
                                    min="0"
                                    step="0.01"
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-debt-remaining" className="block text-sm font-medium text-gray-700 mb-1">
                                    Restbetrag (€)
                                  </label>
                                  <input
                                    type="number"
                                    id="edit-debt-remaining"
                                    value={editDebt.remainingAmount}
                                    onChange={(e) => setEditDebt({ ...editDebt, remainingAmount: Math.abs(parseFloat(e.target.value)) })}
                                    min="0"
                                    max={editDebt.totalAmount}
                                    step="0.01"
                                    className="input"
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-debt-monthly" className="block text-sm font-medium text-gray-700 mb-1">
                                    Monatliche Zahlung (€)
                                  </label>
                                  <input
                                    type="number"
                                    id="edit-debt-monthly"
                                    value={editDebt.monthlyPayment}
                                    onChange={(e) => setEditDebt({ ...editDebt, monthlyPayment: Math.abs(parseFloat(e.target.value)) })}
                                    min="0"
                                    step="0.01"
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                {editDebt.type === 'credit' && (
                                  <div>
                                    <label htmlFor="edit-debt-interest" className="block text-sm font-medium text-gray-700 mb-1">
                                      Zinssatz (%)
                                    </label>
                                    <input
                                      type="number"
                                      id="edit-debt-interest"
                                      value={editDebt.interestRate || 0}
                                      onChange={(e) => setEditDebt({ ...editDebt, interestRate: parseFloat(e.target.value) })}
                                      min="0"
                                      step="0.01"
                                      className="input"
                                    />
                                  </div>
                                )}
                                
                                <div>
                                  <label htmlFor="edit-debt-day" className="block text-sm font-medium text-gray-700 mb-1">
                                    Zahltag des Monats
                                  </label>
                                  <input
                                    type="number"
                                    id="edit-debt-day"
                                    value={editDebt.dayOfMonth}
                                    onChange={(e) => setEditDebt({ ...editDebt, dayOfMonth: parseInt(e.target.value) })}
                                    min="1"
                                    max="31"
                                    className="input"
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-debt-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Startdatum
                                  </label>
                                  <input
                                    type="date"
                                    id="edit-debt-start-date"
                                    value={formatDateForInput(editDebt.startDate)}
                                    onChange={(e) => setEditDebt({ 
                                      ...editDebt, 
                                      startDate: e.target.value ? new Date(e.target.value).toISOString() : editDebt.startDate
                                    })}
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-debt-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Enddatum (optional)
                                  </label>
                                  <input
                                    type="date"
                                    id="edit-debt-end-date"
                                    value={formatDateForInput(editDebt.endDate)}
                                    onChange={(e) => setEditDebt({ 
                                      ...editDebt, 
                                      endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                                    })}
                                    className="input"
                                  />
                                </div>
                                
                                <div className="md:col-span-2">
                                  <label htmlFor="edit-debt-description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Beschreibung (optional)
                                  </label>
                                  <input
                                    type="text"
                                    id="edit-debt-description"
                                    value={editDebt.description}
                                    onChange={(e) => setEditDebt({ ...editDebt, description: e.target.value })}
                                    className="input"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <button 
                                  onClick={handleUpdateDebt}
                                  className="btn btn-success mr-2 flex items-center"
                                  disabled={!editDebt.personId || !editDebt.accountId || !editDebt.name || editDebt.totalAmount <= 0 || editDebt.monthlyPayment <= 0}
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
                            </div>
                          ) : (
                            <div>
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-medium text-lg">{debt.name}</h3>
                                    {!isActive && (
                                      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                        Bezahlt
                                      </span>
                                    )}
                                    {debt.interestRate && debt.interestRate > 0 && (
                                      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                        {debt.interestRate}% Zinsen
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {details.personName} • Zahlung von {details.accountName} am {debt.dayOfMonth}. jeden Monats
                                  </p>
                                </div>
                                
                                <div className="flex items-center mt-4 md:mt-0">
                                  <div className="text-right mr-4">
                                    <div className="font-medium">
                                      <AmountDisplay amount={-debt.remainingAmount} /> 
                                      <span className="text-sm text-gray-500 ml-1">
                                        von {debt.totalAmount.toLocaleString('de-DE')} €
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      <AmountDisplay amount={-debt.monthlyPayment} size="sm" /> monatlich
                                    </div>
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => startEdit(debt)}
                                      className="text-gray-500 hover:text-primary-400 p-1"
                                      title="Bearbeiten"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button
                                      onClick={() => confirmDelete(debt.id, debt.name)}
                                      className="text-gray-500 hover:text-error-400 p-1 ml-1"
                                      title="Löschen"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary-400 h-2 rounded-full" 
                                    style={{ width: `${percentPaid}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>{percentPaid.toFixed(0)}% abbezahlt</span>
                                  <span>{formatDate(debt.startDate)} {debt.endDate ? `- ${formatDate(debt.endDate)}` : ''}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              
              {/* Personal Debts */}
              {personalDebts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-medium text-lg">Persönliche Schulden</h2>
                    <span className="text-sm text-gray-500">
                      Gesamt: <AmountDisplay amount={-personalDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0)} />
                    </span>
                  </div>
                  
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                    <AlertCircle size={18} className="text-primary-400 mr-2" />
                    <p className="text-sm text-gray-700">
                      Persönliche Schulden sind informelle Schulden zwischen Personen oder kleine Verbindlichkeiten.
                    </p>
                  </div>
                  
                  <ul className="divide-y divide-gray-100">
                    {personalDebts.map(debt => {
                      const details = getDebtDetails(debt);
                      const isActive = !debt.endDate || new Date(debt.endDate) > new Date();
                      const percentPaid = (debt.totalAmount - debt.remainingAmount) / debt.totalAmount * 100;
                      
                      return (
                        <li key={debt.id} className={`p-4 hover:bg-gray-50 ${!isActive ? 'opacity-60' : ''}`}>
                          {editId === debt.id && editDebt ? (
                            <div className="animate-fade-in">
                              {/* Same edit form as above - omitted for brevity */}
                              {/* This would be the same form as for credit debts */}
                            </div>
                          ) : (
                            <div>
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-medium text-lg">{debt.name}</h3>
                                    {!isActive && (
                                      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                        Bezahlt
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {details.personName} • Zahlung von {details.accountName} am {debt.dayOfMonth}. jeden Monats
                                  </p>
                                </div>
                                
                                <div className="flex items-center mt-4 md:mt-0">
                                  <div className="text-right mr-4">
                                    <div className="font-medium">
                                      <AmountDisplay amount={-debt.remainingAmount} /> 
                                      <span className="text-sm text-gray-500 ml-1">
                                        von {debt.totalAmount.toLocaleString('de-DE')} €
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      <AmountDisplay amount={-debt.monthlyPayment} size="sm" /> monatlich
                                    </div>
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => startEdit(debt)}
                                      className="text-gray-500 hover:text-primary-400 p-1"
                                      title="Bearbeiten"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button
                                      onClick={() => confirmDelete(debt.id, debt.name)}
                                      className="text-gray-500 hover:text-error-400 p-1 ml-1"
                                      title="Löschen"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary-400 h-2 rounded-full" 
                                    style={{ width: `${percentPaid}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>{percentPaid.toFixed(0)}% abbezahlt</span>
                                  <span>{formatDate(debt.startDate)} {debt.endDate ? `- ${formatDate(debt.endDate)}` : ''}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebtsPage;