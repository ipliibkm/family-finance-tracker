import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { RecurringEntry } from '../types';
import { 
  Plus, Trash2, Edit, X, Save, RepeatIcon
} from 'lucide-react';
import AmountDisplay from '../components/shared/AmountDisplay';
import { formatDate, formatDateForInput, formatFrequency } from '../utils/formatters';
import { frequencyOptions } from '../data/defaultData';

const RecurringEntriesPage: React.FC = () => {
  const { 
    persons, 
    accounts, 
    categories,
    recurringEntries, 
    addRecurringEntry, 
    updateRecurringEntry, 
    deleteRecurringEntry 
  } = useAppContext();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [newEntry, setNewEntry] = useState<Omit<RecurringEntry, 'id'>>({
    personId: '',
    accountId: '',
    categoryId: '',
    name: '',
    amount: 0,
    startDate: new Date().toISOString(),
    endDate: null,
    frequency: 'monthly',
    description: ''
  });
  
  const [editEntry, setEditEntry] = useState<RecurringEntry | null>(null);

  // Filter income categories
  const incomeCategories = categories.filter(c => c.type === 'income');

  // Filter accounts by selected person (for the forms)
  const getPersonAccounts = (personId: string) => {
    return accounts.filter(account => account.personId === personId);
  };

  const handleAddEntry = () => {
    if (newEntry.personId && newEntry.accountId && newEntry.name) {
      addRecurringEntry({
        ...newEntry,
        amount: Math.abs(newEntry.amount) // Always store as positive for income
      });
      
      setNewEntry({
        personId: '',
        accountId: '',
        categoryId: '',
        name: '',
        amount: 0,
        startDate: new Date().toISOString(),
        endDate: null,
        frequency: 'monthly',
        description: ''
      });
      setIsAdding(false);
    }
  };

  const handleUpdateEntry = () => {
    if (editEntry && editEntry.personId && editEntry.accountId && editEntry.name) {
      updateRecurringEntry({
        ...editEntry,
        amount: Math.abs(editEntry.amount) // Always store as positive for income
      });
      setEditId(null);
      setEditEntry(null);
    }
  };

  const startEdit = (entry: RecurringEntry) => {
    setEditId(entry.id);
    setEditEntry({ ...entry });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditEntry(null);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie den wiederkehrenden Eintrag "${name}" wirklich löschen?`)) {
      deleteRecurringEntry(id);
    }
  };
  
  // Get entry details with related information
  const getEntryDetails = (entry: RecurringEntry) => {
    const person = persons.find(p => p.id === entry.personId);
    const account = accounts.find(a => a.id === entry.accountId);
    const category = categories.find(c => c.id === entry.categoryId);
    
    return {
      ...entry,
      personName: person?.name || 'Unbekannt',
      accountName: account?.name || 'Unbekannt',
      categoryName: category?.name || 'Unbekannt',
      categoryColor: category?.color || '#CCCCCC'
    };
  };
  
  // Sort entries by name
  const sortedEntries = [...recurringEntries].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Wiederkehrende Einnahmen</h1>
        <button 
          onClick={() => setIsAdding(true)} 
          className="btn btn-primary flex items-center"
          disabled={isAdding || accounts.length === 0}
        >
          <Plus size={18} className="mr-1" /> Eintrag hinzufügen
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <RepeatIcon size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="mb-4">Sie müssen zuerst eine Person und ein Konto hinzufügen.</p>
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
              <h3 className="font-medium mb-3">Neuer wiederkehrender Eintrag</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="entry-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="entry-name"
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                    placeholder="z.B. Gehalt"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="entry-person" className="block text-sm font-medium text-gray-700 mb-1">
                    Person
                  </label>
                  <select
                    id="entry-person"
                    value={newEntry.personId}
                    onChange={(e) => {
                      const personId = e.target.value;
                      setNewEntry({ 
                        ...newEntry, 
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
                  <label htmlFor="entry-account" className="block text-sm font-medium text-gray-700 mb-1">
                    Konto
                  </label>
                  <select
                    id="entry-account"
                    value={newEntry.accountId}
                    onChange={(e) => setNewEntry({ ...newEntry, accountId: e.target.value })}
                    className="select"
                    required
                    disabled={!newEntry.personId}
                  >
                    <option value="">Konto auswählen</option>
                    {newEntry.personId && getPersonAccounts(newEntry.personId).map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="entry-category" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorie
                  </label>
                  <select
                    id="entry-category"
                    value={newEntry.categoryId}
                    onChange={(e) => setNewEntry({ ...newEntry, categoryId: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="">Kategorie auswählen</option>
                    {incomeCategories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="entry-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Betrag (€)
                  </label>
                  <input
                    type="number"
                    id="entry-amount"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: Math.abs(parseFloat(e.target.value)) })}
                    step="0.01"
                    min="0"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="entry-frequency" className="block text-sm font-medium text-gray-700 mb-1">
                    Häufigkeit
                  </label>
                  <select
                    id="entry-frequency"
                    value={newEntry.frequency}
                    onChange={(e) => setNewEntry({ 
                      ...newEntry, 
                      frequency: e.target.value as RecurringEntry['frequency']
                    })}
                    className="select"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="entry-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    id="entry-start-date"
                    value={formatDateForInput(newEntry.startDate)}
                    onChange={(e) => setNewEntry({ 
                      ...newEntry, 
                      startDate: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                    })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="entry-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Enddatum (optional)
                  </label>
                  <input
                    type="date"
                    id="entry-end-date"
                    value={formatDateForInput(newEntry.endDate)}
                    onChange={(e) => setNewEntry({ 
                      ...newEntry, 
                      endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                    })}
                    className="input"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="entry-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung (optional)
                  </label>
                  <input
                    type="text"
                    id="entry-description"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    className="input"
                    placeholder="Beschreibung hinzufügen"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAddEntry}
                  className="btn btn-success mr-2 flex items-center"
                  disabled={!newEntry.personId || !newEntry.accountId || !newEntry.name || !newEntry.categoryId || newEntry.amount <= 0}
                >
                  <Save size={18} className="mr-1" /> Speichern
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewEntry({
                      personId: '',
                      accountId: '',
                      categoryId: '',
                      name: '',
                      amount: 0,
                      startDate: new Date().toISOString(),
                      endDate: null,
                      frequency: 'monthly',
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

          {sortedEntries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              <RepeatIcon size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="mb-4">Keine wiederkehrenden Einnahmen vorhanden</p>
              <button 
                onClick={() => setIsAdding(true)} 
                className="btn btn-primary"
              >
                Eintrag hinzufügen
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-700">
                  Wiederkehrende Einnahmen werden automatisch als Transaktionen erfasst.
                </p>
              </div>
              
              <ul className="divide-y divide-gray-100">
                {sortedEntries.map(entry => {
                  const details = getEntryDetails(entry);
                  const isActive = !entry.endDate || new Date(entry.endDate) > new Date();
                  
                  return (
                    <li key={entry.id} className={`p-4 hover:bg-gray-50 ${!isActive ? 'opacity-60' : ''}`}>
                      {editId === entry.id && editEntry ? (
                        <div className="animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label htmlFor="edit-entry-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                              </label>
                              <input
                                type="text"
                                id="edit-entry-name"
                                value={editEntry.name}
                                onChange={(e) => setEditEntry({ ...editEntry, name: e.target.value })}
                                className="input"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="edit-entry-person" className="block text-sm font-medium text-gray-700 mb-1">
                                Person
                              </label>
                              <select
                                id="edit-entry-person"
                                value={editEntry.personId}
                                onChange={(e) => {
                                  const personId = e.target.value;
                                  setEditEntry({ 
                                    ...editEntry, 
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
                              <label htmlFor="edit-entry-account" className="block text-sm font-medium text-gray-700 mb-1">
                                Konto
                              </label>
                              <select
                                id="edit-entry-account"
                                value={editEntry.accountId}
                                onChange={(e) => setEditEntry({ ...editEntry, accountId: e.target.value })}
                                className="select"
                                required
                                disabled={!editEntry.personId}
                              >
                                <option value="">Konto auswählen</option>
                                {editEntry.personId && getPersonAccounts(editEntry.personId).map(account => (
                                  <option key={account.id} value={account.id}>{account.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="edit-entry-category" className="block text-sm font-medium text-gray-700 mb-1">
                                Kategorie
                              </label>
                              <select
                                id="edit-entry-category"
                                value={editEntry.categoryId}
                                onChange={(e) => setEditEntry({ ...editEntry, categoryId: e.target.value })}
                                className="select"
                                required
                              >
                                <option value="">Kategorie auswählen</option>
                                {incomeCategories.map(category => (
                                  <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="edit-entry-amount" className="block text-sm font-medium text-gray-700 mb-1">
                                Betrag (€)
                              </label>
                              <input
                                type="number"
                                id="edit-entry-amount"
                                value={editEntry.amount}
                                onChange={(e) => setEditEntry({ ...editEntry, amount: Math.abs(parseFloat(e.target.value)) })}
                                step="0.01"
                                min="0"
                                className="input"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="edit-entry-frequency" className="block text-sm font-medium text-gray-700 mb-1">
                                Häufigkeit
                              </label>
                              <select
                                id="edit-entry-frequency"
                                value={editEntry.frequency}
                                onChange={(e) => setEditEntry({ 
                                  ...editEntry, 
                                  frequency: e.target.value as RecurringEntry['frequency']
                                })}
                                className="select"
                              >
                                {frequencyOptions.map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label htmlFor="edit-entry-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Startdatum
                              </label>
                              <input
                                type="date"
                                id="edit-entry-start-date"
                                value={formatDateForInput(editEntry.startDate)}
                                onChange={(e) => setEditEntry({ 
                                  ...editEntry, 
                                  startDate: e.target.value ? new Date(e.target.value).toISOString() : editEntry.startDate
                                })}
                                className="input"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="edit-entry-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Enddatum (optional)
                              </label>
                              <input
                                type="date"
                                id="edit-entry-end-date"
                                value={formatDateForInput(editEntry.endDate)}
                                onChange={(e) => setEditEntry({ 
                                  ...editEntry, 
                                  endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                                })}
                                className="input"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label htmlFor="edit-entry-description" className="block text-sm font-medium text-gray-700 mb-1">
                                Beschreibung (optional)
                              </label>
                              <input
                                type="text"
                                id="edit-entry-description"
                                value={editEntry.description}
                                onChange={(e) => setEditEntry({ ...editEntry, description: e.target.value })}
                                className="input"
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <button 
                              onClick={handleUpdateEntry}
                              className="btn btn-success mr-2 flex items-center"
                              disabled={!editEntry.personId || !editEntry.accountId || !editEntry.name || !editEntry.categoryId || editEntry.amount <= 0}
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
                              <h3 className="font-medium text-lg">{entry.name}</h3>
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
                                {formatFrequency(entry.frequency)}
                              </span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                {formatDate(entry.startDate)}
                                {entry.endDate ? ` - ${formatDate(entry.endDate)}` : ''}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-4 md:mt-0">
                            <div className="text-right mr-4">
                              <AmountDisplay amount={entry.amount} className="font-medium" />
                              <div className="text-sm text-gray-500">
                                <span 
                                  className="inline-block w-3 h-3 rounded-full mr-1" 
                                  style={{ backgroundColor: details.categoryColor }}
                                ></span>
                                {details.categoryName}
                              </div>
                            </div>
                            <div>
                              <button
                                onClick={() => startEdit(entry)}
                                className="text-gray-500 hover:text-primary-400 p-1"
                                title="Bearbeiten"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => confirmDelete(entry.id, entry.name)}
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

export default RecurringEntriesPage;