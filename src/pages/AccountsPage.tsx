import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Account } from '../types';
import { accountTypes } from '../data/defaultData';
import { Plus, Trash2, Edit, X, Save, CreditCard } from 'lucide-react';
import AmountDisplay from '../components/shared/AmountDisplay';
import { formatAccountType } from '../utils/formatters';

const AccountsPage: React.FC = () => {
  const { persons, accounts, addAccount, updateAccount, deleteAccount } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [newAccount, setNewAccount] = useState<Omit<Account, 'id'>>({
    personId: '',
    name: '',
    type: 'giro_account',
    balance: 0,
    currency: '€'
  });
  
  const [editAccount, setEditAccount] = useState<Account | null>(null);

  const handleAddAccount = () => {
    if (newAccount.name.trim() && newAccount.personId) {
      addAccount(newAccount);
      setNewAccount({
        personId: '',
        name: '',
        type: 'giro_account',
        balance: 0,
        currency: '€'
      });
      setIsAdding(false);
    }
  };

  const handleUpdateAccount = () => {
    if (editAccount && editAccount.name.trim()) {
      updateAccount(editAccount);
      setEditId(null);
      setEditAccount(null);
    }
  };

  const startEdit = (account: Account) => {
    setEditId(account.id);
    setEditAccount({ ...account });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditAccount(null);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie "${name}" wirklich löschen? Alle zugehörigen Transaktionen werden ebenfalls gelöscht.`)) {
      deleteAccount(id);
    }
  };

  // Group accounts by person
  const accountsByPerson = persons.map(person => ({
    person,
    accounts: accounts.filter(account => account.personId === person.id)
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Konten</h1>
        <button 
          onClick={() => setIsAdding(true)} 
          className="btn btn-primary flex items-center"
          disabled={isAdding || persons.length === 0}
        >
          <Plus size={18} className="mr-1" /> Konto hinzufügen
        </button>
      </div>

      {persons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <CreditCard size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="mb-4">Sie müssen zuerst eine Person hinzufügen, bevor Sie Konten erstellen können.</p>
          <button 
            onClick={() => window.location.href = '/persons'} 
            className="btn btn-primary"
          >
            Person hinzufügen
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {isAdding && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-fade-in">
              <h3 className="font-medium mb-3">Neues Konto hinzufügen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="person-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Person
                  </label>
                  <select
                    id="person-select"
                    value={newAccount.personId}
                    onChange={(e) => setNewAccount({ ...newAccount, personId: e.target.value })}
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
                  <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Kontoname
                  </label>
                  <input
                    type="text"
                    id="account-name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="z.B. Sparkasse Girokonto"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="account-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Kontotyp
                  </label>
                  <select
                    id="account-type"
                    value={newAccount.type}
                    onChange={(e) => setNewAccount({ 
                      ...newAccount, 
                      type: e.target.value as Account['type']
                    })}
                    className="select"
                  >
                    {accountTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="account-balance" className="block text-sm font-medium text-gray-700 mb-1">
                    Kontostand (€)
                  </label>
                  <input
                    type="number"
                    id="account-balance"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) })}
                    step="0.01"
                    className="input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAddAccount}
                  className="btn btn-success mr-2 flex items-center"
                  disabled={!newAccount.name.trim() || !newAccount.personId}
                >
                  <Save size={18} className="mr-1" /> Speichern
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewAccount({
                      personId: '',
                      name: '',
                      type: 'giro_account',
                      balance: 0,
                      currency: '€'
                    });
                  }}
                  className="btn btn-outline flex items-center"
                >
                  <X size={18} className="mr-1" /> Abbrechen
                </button>
              </div>
            </div>
          )}

          {accountsByPerson.map(({ person, accounts }) => (
            <div key={person.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <h2 className="font-medium text-lg">{person.name}</h2>
              </div>
              
              {accounts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>Keine Konten für {person.name}</p>
                  <button 
                    onClick={() => {
                      setIsAdding(true);
                      setNewAccount({
                        ...newAccount,
                        personId: person.id
                      });
                    }} 
                    className="btn btn-primary mt-2"
                  >
                    Konto hinzufügen
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {accounts.map(account => (
                    <div key={account.id} className="p-4 hover:bg-gray-50">
                      {editId === account.id && editAccount ? (
                        <div className="animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label htmlFor="edit-account-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Kontoname
                              </label>
                              <input
                                type="text"
                                id="edit-account-name"
                                value={editAccount.name}
                                onChange={(e) => setEditAccount({ ...editAccount, name: e.target.value })}
                                className="input"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="edit-account-type" className="block text-sm font-medium text-gray-700 mb-1">
                                Kontotyp
                              </label>
                              <select
                                id="edit-account-type"
                                value={editAccount.type}
                                onChange={(e) => setEditAccount({ 
                                  ...editAccount, 
                                  type: e.target.value as Account['type'] 
                                })}
                                className="select"
                              >
                                {accountTypes.map(type => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="edit-account-balance" className="block text-sm font-medium text-gray-700 mb-1">
                                Kontostand (€)
                              </label>
                              <input
                                type="number"
                                id="edit-account-balance"
                                value={editAccount.balance}
                                onChange={(e) => setEditAccount({ ...editAccount, balance: parseFloat(e.target.value) })}
                                step="0.01"
                                className="input"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <button 
                              onClick={handleUpdateAccount}
                              className="btn btn-success mr-2 flex items-center"
                              disabled={!editAccount.name.trim()}
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
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-lg">{account.name}</h3>
                            <p className="text-sm text-gray-500">{formatAccountType(account.type)}</p>
                          </div>
                          <div className="flex items-center">
                            <AmountDisplay amount={account.balance} className="mr-4" />
                            <div>
                              <button
                                onClick={() => startEdit(account)}
                                className="text-gray-500 hover:text-primary-400 p-1"
                                title="Bearbeiten"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => confirmDelete(account.id, account.name)}
                                className="text-gray-500 hover:text-error-400 p-1 ml-1"
                                title="Löschen"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountsPage;