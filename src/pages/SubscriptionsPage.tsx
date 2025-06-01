import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Subscription } from '../types';
import { 
  Plus, Trash2, Edit, X, Save, Calendar, AlertCircle
} from 'lucide-react';
import AmountDisplay from '../components/shared/AmountDisplay';
import { formatDate, formatDateForInput, formatFrequency } from '../utils/formatters';
import { frequencyOptions } from '../data/defaultData';

const SubscriptionsPage: React.FC = () => {
  const { 
    persons, 
    accounts, 
    categories,
    subscriptions, 
    addSubscription, 
    updateSubscription, 
    deleteSubscription 
  } = useAppContext();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [newSubscription, setNewSubscription] = useState<Omit<Subscription, 'id'>>({
    personId: '',
    accountId: '',
    name: '',
    amount: 0,
    startDate: new Date().toISOString(),
    endDate: null,
    frequency: 'monthly',
    dayOfMonth: 1,
    categoryId: '',
    description: ''
  });
  
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);

  // Filter expense categories
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Filter accounts by selected person (for the forms)
  const getPersonAccounts = (personId: string) => {
    return accounts.filter(account => account.personId === personId);
  };

  const handleAddSubscription = () => {
    if (newSubscription.personId && newSubscription.accountId && newSubscription.name) {
      // Find subscription category or use default
      let categoryId = newSubscription.categoryId;
      if (!categoryId) {
        const subscriptionCategory = categories.find(c => c.name === 'Abonnements' && c.type === 'expense');
        if (subscriptionCategory) {
          categoryId = subscriptionCategory.id;
        } else {
          // Use first expense category as fallback
          const firstExpenseCategory = categories.find(c => c.type === 'expense');
          if (firstExpenseCategory) {
            categoryId = firstExpenseCategory.id;
          }
        }
      }
      
      addSubscription({
        ...newSubscription,
        categoryId,
        amount: Math.abs(newSubscription.amount) // Always store as positive
      });
      
      setNewSubscription({
        personId: '',
        accountId: '',
        name: '',
        amount: 0,
        startDate: new Date().toISOString(),
        endDate: null,
        frequency: 'monthly',
        dayOfMonth: 1,
        categoryId: '',
        description: ''
      });
      setIsAdding(false);
    }
  };

  const handleUpdateSubscription = () => {
    if (editSubscription && editSubscription.personId && editSubscription.accountId && editSubscription.name) {
      updateSubscription({
        ...editSubscription,
        amount: Math.abs(editSubscription.amount) // Always store as positive
      });
      setEditId(null);
      setEditSubscription(null);
    }
  };

  const startEdit = (subscription: Subscription) => {
    setEditId(subscription.id);
    setEditSubscription({ ...subscription });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditSubscription(null);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie das Abonnement "${name}" wirklich löschen?`)) {
      deleteSubscription(id);
    }
  };
  
  // Get subscription details with related information
  const getSubscriptionDetails = (subscription: Subscription) => {
    const person = persons.find(p => p.id === subscription.personId);
    const account = accounts.find(a => a.id === subscription.accountId);
    const category = categories.find(c => c.id === subscription.categoryId);
    
    return {
      ...subscription,
      personName: person?.name || 'Unbekannt',
      accountName: account?.name || 'Unbekannt',
      categoryName: category?.name || 'Unbekannt',
      categoryColor: category?.color || '#CCCCCC'
    };
  };
  
  // Sort subscriptions by name
  const sortedSubscriptions = [...subscriptions].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Abonnements</h1>
        <button 
          onClick={() => setIsAdding(true)} 
          className="btn btn-primary flex items-center"
          disabled={isAdding || accounts.length === 0}
        >
          <Plus size={18} className="mr-1" /> Abonnement hinzufügen
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <Calendar size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="mb-4">Sie müssen zuerst eine Person und ein Konto hinzufügen, bevor Sie Abonnements erstellen können.</p>
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
              <h3 className="font-medium mb-3">Neues Abonnement hinzufügen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="subscription-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="subscription-name"
                    value={newSubscription.name}
                    onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                    placeholder="z.B. Netflix"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subscription-person" className="block text-sm font-medium text-gray-700 mb-1">
                    Person
                  </label>
                  <select
                    id="subscription-person"
                    value={newSubscription.personId}
                    onChange={(e) => {
                      const personId = e.target.value;
                      setNewSubscription({ 
                        ...newSubscription, 
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
                  <label htmlFor="subscription-account" className="block text-sm font-medium text-gray-700 mb-1">
                    Konto
                  </label>
                  <select
                    id="subscription-account"
                    value={newSubscription.accountId}
                    onChange={(e) => setNewSubscription({ ...newSubscription, accountId: e.target.value })}
                    className="select"
                    required
                    disabled={!newSubscription.personId}
                  >
                    <option value="">Konto auswählen</option>
                    {newSubscription.personId && getPersonAccounts(newSubscription.personId).map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subscription-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Betrag (€)
                  </label>
                  <input
                    type="number"
                    id="subscription-amount"
                    value={newSubscription.amount}
                    onChange={(e) => setNewSubscription({ ...newSubscription, amount: Math.abs(parseFloat(e.target.value)) })}
                    step="0.01"
                    min="0"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subscription-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie
                  </label>
                  <select
                    id="subscription-category"
                    value={newSubscription.categoryId}
                    onChange={(e) => setNewSubscription({ ...newSubscription, categoryId: e.target.value })}
                    className="select"
                  >
                    <option value="">Kategorie auswählen</option>
                    {expenseCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subscription-frequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Häufigkeit
                  </label>
                  <select
                    id="subscription-frequency"
                    value={newSubscription.frequency}
                    onChange={(e) => setNewSubscription({ 
                      ...newSubscription, 
                      frequency: e.target.value as Subscription['frequency'] 
                    })}
                    className="select"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                {newSubscription.frequency === 'monthly' && (
                  <div>
                    <label htmlFor="subscription-day" className="block text-sm font-medium text-gray-700 mb-1">
                      Tag des Monats
                    </label>
                    <input
                      type="number"
                      id="subscription-day"
                      value={newSubscription.dayOfMonth}
                      onChange={(e) => setNewSubscription({ 
                        ...newSubscription, 
                        dayOfMonth: parseInt(e.target.value) 
                      })}
                      min="1"
                      max="31"
                      className="input"
                    />
                  </div>
                )}
                
                <div>
                  <label htmlFor="subscription-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    id="subscription-start-date"
                    value={formatDateForInput(newSubscription.startDate)}
                    onChange={(e) => setNewSubscription({ 
                      ...newSubscription, 
                      startDate: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                    })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subscription-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Enddatum (optional)
                  </label>
                  <input
                    type="date"
                    id="subscription-end-date"
                    value={formatDateForInput(newSubscription.endDate)}
                    onChange={(e) => setNewSubscription({ 
                      ...newSubscription, 
                      endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                    })}
                    className="input"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="subscription-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung (optional)
                  </label>
                  <input
                    type="text"
                    id="subscription-description"
                    value={newSubscription.description}
                    onChange={(e) => setNewSubscription({ ...newSubscription, description: e.target.value })}
                    className="input"
                    placeholder="Beschreibung hinzufügen"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAddSubscription}
                  className="btn btn-success mr-2 flex items-center"
                  disabled={!newSubscription.personId || !newSubscription.accountId || !newSubscription.name || newSubscription.amount <= 0}
                >
                  <Save size={18} className="mr-1" /> Speichern
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewSubscription({
                      personId: '',
                      accountId: '',
                      name: '',
                      amount: 0,
                      startDate: new Date().toISOString(),
                      endDate: null,
                      frequency: 'monthly',
                      dayOfMonth: 1,
                      categoryId: '',
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

          {sortedSubscriptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              <Calendar size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="mb-4">Keine Abonnements vorhanden</p>
              <button 
                onClick={() => setIsAdding(true)} 
                className="btn btn-primary"
              >
                Abonnement hinzufügen
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
                <AlertCircle size={18} className="text-primary-400 mr-2" />
                <p className="text-sm text-gray-700">
                  Abonnements werden automatisch als monatliche Ausgaben erfasst und in der Übersicht angezeigt.
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                {sortedSubscriptions.map(subscription => {
                  const details = getSubscriptionDetails(subscription);
                  const isActive = !subscription.endDate || new Date(subscription.endDate) > new Date();
                  
                  return (
                    <li key={subscription.id} className={`p-4 hover:bg-gray-50 ${!isActive ? 'opacity-60' : ''}`}>
                      {editId === subscription.id && editSubscription ? (
                        <div className="animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label htmlFor="edit-subscription-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                id="edit-subscription-name"
                                value={editSubscription.name}
                                onChange={(e) => setEditSubscription({ ...editSubscription, name: e.target.value })}
                                className="input"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="edit-subscription-person" className="block text-sm font-medium text-gray-700 mb-1">
                                Person
                              </label>
                              <select
                                id="edit-subscription-person"
                                value={editSubscription.personId}
                                onChange={(e) => {
                                  const personId = e.target.value;
                                  setEditSubscription({ 
                                    ...editSubscription, 
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
                              <label htmlFor="edit-subscription-account" className="block text-sm font-medium text-gray-700 mb-1">
                                Konto
                              </label>
                              <select
                                id="edit-subscription-account"
                                value={editSubscription.accountId}
                                onChange={(e) => setEditSubscription({ ...editSubscription, accountId: e.target.value })}
                                className="select"
                                required
                                disabled={!editSubscription.personId}
                              >
                                <option value="">Konto auswählen</option>
                                {editSubscription.personId && getPersonAccounts(editSubscription.personId).map(account => (
                                  <option key={account.id} value={account.id}>{account.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="edit-subscription-amount" className="block text-sm font-medium text-gray-700 mb-1">
                                Betrag (€)
                              </label>
                              <input
                                type="number"
                                id="edit-subscription-amount"
                                value={editSubscription.amount}
                                onChange={(e) => setEditSubscription({ 
                                  ...editSubscription, 
                                  amount: Math.abs(parseFloat(e.target.value)) 
                                })}
                                step="0.01"
                                min="0"
                                className="input"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="edit-subscription-category" className="block text-sm font-medium text-gray-700 mb-1">
                                Kategorie
                              </label>
                              <select
                                id="edit-subscription-category"
                                value={editSubscription.categoryId}
                                onChange={(e) => setEditSubscription({ ...editSubscription, categoryId: e.target.value })}
                                className="select"
                              >
                                <option value="">Kategorie auswählen</option>
                                {expenseCategories.map(category => (
                                  <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="edit-subscription-frequency" className="block text-sm font-medium text-gray-700 mb-1">
                                Häufigkeit
                              </label>
                              <select
                                id="edit-subscription-frequency"
                                value={editSubscription.frequency}
                                onChange={(e) => setEditSubscription({ 
                                  ...editSubscription, 
                                  frequency: e.target.value as Subscription['frequency'] 
                                })}
                                className="select"
                              >
                                {frequencyOptions.map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                            
                            {editSubscription.frequency === 'monthly' && (
                              <div>
                                <label htmlFor="edit-subscription-day" className="block text-sm font-medium text-gray-700 mb-1">
                                  Tag des Monats
                                </label>
                                <input
                                  type="number"
                                  id="edit-subscription-day"
                                  value={editSubscription.dayOfMonth || 1}
                                  onChange={(e) => setEditSubscription({ 
                                    ...editSubscription, 
                                    dayOfMonth: parseInt(e.target.value) 
                                  })}
                                  min="1"
                                  max="31"
                                  className="input"
                                />
                              </div>
                            )}
                            
                            <div>
                              <label htmlFor="edit-subscription-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Startdatum
                              </label>
                              <input
                                type="date"
                                id="edit-subscription-start-date"
                                value={formatDateForInput(editSubscription.startDate)}
                                onChange={(e) => setEditSubscription({ 
                                  ...editSubscription, 
                                  startDate: e.target.value ? new Date(e.target.value).toISOString() : editSubscription.startDate
                                })}
                                className="input"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="edit-subscription-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Enddatum (optional)
                              </label>
                              <input
                                type="date"
                                id="edit-subscription-end-date"
                                value={formatDateForInput(editSubscription.endDate)}
                                onChange={(e) => setEditSubscription({ 
                                  ...editSubscription, 
                                  endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                                })}
                                className="input"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label htmlFor="edit-subscription-description" className="block text-sm font-medium text-gray-700 mb-1">
                                Beschreibung (optional)
                              </label>
                              <input
                                type="text"
                                id="edit-subscription-description"
                                value={editSubscription.description}
                                onChange={(e) => setEditSubscription({ ...editSubscription, description: e.target.value })}
                                className="input"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <button 
                              onClick={handleUpdateSubscription}
                              className="btn btn-success mr-2 flex items-center"
                              disabled={!editSubscription.personId || !editSubscription.accountId || !editSubscription.name || editSubscription.amount <= 0}
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
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-lg">{subscription.name}</h3>
                              {!isActive && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                  Beendet
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {details.personName} • {details.accountName}
                            </p>
                            <div className="mt-2 text-sm">
                              <span className="text-gray-600 mr-2">
                                {formatFrequency(subscription.frequency, subscription.dayOfMonth)}
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                {formatDate(subscription.startDate)}
                                {subscription.endDate ? ` - ${formatDate(subscription.endDate)}` : ''}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-4 md:mt-0">
                            <AmountDisplay amount={-subscription.amount} className="font-medium mr-4" />
                            <div>
                              <button
                                onClick={() => startEdit(subscription)}
                                className="text-gray-500 hover:text-primary-400 p-1"
                                title="Bearbeiten"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => confirmDelete(subscription.id, subscription.name)}
                                className="text-gray-500 hover:text-error-400 p-1 ml-1"
                                title="Löschen"
                              >
                                <Trash2 size={18} />
                              </button>
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
  );
};

export default SubscriptionsPage;