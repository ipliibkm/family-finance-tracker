import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Investment } from '../types';
import { 
  Plus, Trash2, Edit, X, Save, TrendingUp, ArrowUp, ArrowDown
} from 'lucide-react';
import AmountDisplay from '../components/shared/AmountDisplay';
import { formatDate, formatDateForInput, formatInvestmentType } from '../utils/formatters';
import { investmentTypes } from '../data/defaultData';

const InvestmentsPage: React.FC = () => {
  const { 
    persons, 
    investments, 
    addInvestment, 
    updateInvestment, 
    deleteInvestment 
  } = useAppContext();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [newInvestment, setNewInvestment] = useState<Omit<Investment, 'id'>>({
    personId: '',
    assetName: '',
    assetType: 'stock',
    purchaseDate: new Date().toISOString(),
    units: 1,
    purchasePricePerUnit: 0,
    currentPricePerUnit: 0,
    currency: '€',
    notes: ''
  });
  
  const [editInvestment, setEditInvestment] = useState<Investment | null>(null);

  const handleAddInvestment = () => {
    if (newInvestment.personId && newInvestment.assetName) {
      addInvestment(newInvestment);
      
      setNewInvestment({
        personId: '',
        assetName: '',
        assetType: 'stock',
        purchaseDate: new Date().toISOString(),
        units: 1,
        purchasePricePerUnit: 0,
        currentPricePerUnit: 0,
        currency: '€',
        notes: ''
      });
      setIsAdding(false);
    }
  };

  const handleUpdateInvestment = () => {
    if (editInvestment && editInvestment.personId && editInvestment.assetName) {
      updateInvestment(editInvestment);
      setEditId(null);
      setEditInvestment(null);
    }
  };

  const startEdit = (investment: Investment) => {
    setEditId(investment.id);
    setEditInvestment({ ...investment });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditInvestment(null);
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie die Investition "${name}" wirklich löschen?`)) {
      deleteInvestment(id);
    }
  };
  
  // Calculate total investment value and performance
  const totalInvestmentValue = investments.reduce(
    (sum, inv) => sum + (inv.currentPricePerUnit * inv.units), 
    0
  );
  
  const totalInvestmentCost = investments.reduce(
    (sum, inv) => sum + (inv.purchasePricePerUnit * inv.units), 
    0
  );
  
  const totalProfit = totalInvestmentValue - totalInvestmentCost;
  const totalProfitPercentage = totalInvestmentCost > 0 
    ? (totalProfit / totalInvestmentCost) * 100 
    : 0;
  
  // Get investment details with related information
  const getInvestmentDetails = (investment: Investment) => {
    const person = persons.find(p => p.id === investment.personId);
    
    const totalPurchaseValue = investment.purchasePricePerUnit * investment.units;
    const totalCurrentValue = investment.currentPricePerUnit * investment.units;
    const profit = totalCurrentValue - totalPurchaseValue;
    const profitPercentage = totalPurchaseValue > 0 
      ? (profit / totalPurchaseValue) * 100 
      : 0;
    
    return {
      ...investment,
      personName: person?.name || 'Unbekannt',
      formattedType: formatInvestmentType(investment.assetType),
      totalPurchaseValue,
      totalCurrentValue,
      profit,
      profitPercentage
    };
  };
  
  // Group investments by asset type
  const investmentsByType = investmentTypes.map(type => ({
    type: type.value,
    label: type.label,
    investments: investments.filter(inv => inv.assetType === type.value)
  })).filter(group => group.investments.length > 0);
  
  // Sort by asset type and then by asset name
  const sortedInvestments = [...investments].sort((a, b) => {
    if (a.assetType !== b.assetType) {
      return a.assetType.localeCompare(b.assetType);
    }
    return a.assetName.localeCompare(b.assetName);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Investitionen</h1>
        <button 
          onClick={() => setIsAdding(true)} 
          className="btn btn-primary flex items-center"
          disabled={isAdding || persons.length === 0}
        >
          <Plus size={18} className="mr-1" /> Investition hinzufügen
        </button>
      </div>

      {persons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          <TrendingUp size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="mb-4">Sie müssen zuerst eine Person hinzufügen, bevor Sie Investitionen erfassen können.</p>
          <button 
            onClick={() => window.location.href = '/persons'} 
            className="btn btn-primary"
          >
            Person hinzufügen
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {investments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card">
                <h3 className="text-gray-500 font-medium mb-1">Gesamtwert</h3>
                <AmountDisplay amount={totalInvestmentValue} size="lg" />
              </div>
              
              <div className="card">
                <h3 className="text-gray-500 font-medium mb-1">Gesamtgewinn/-verlust</h3>
                <div className="flex items-baseline">
                  <AmountDisplay amount={totalProfit} size="lg" />
                  <span className={`ml-2 text-sm ${totalProfitPercentage >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                    {totalProfitPercentage >= 0 ? '+' : ''}{totalProfitPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-gray-500 font-medium mb-1">Investitionskosten</h3>
                <AmountDisplay amount={totalInvestmentCost} size="lg" />
              </div>
            </div>
          )}
          
          {isAdding && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-fade-in">
              <h3 className="font-medium mb-3">Neue Investition hinzufügen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="investment-asset-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Anlagename
                  </label>
                  <input
                    type="text"
                    id="investment-asset-name"
                    value={newInvestment.assetName}
                    onChange={(e) => setNewInvestment({ ...newInvestment, assetName: e.target.value })}
                    placeholder="z.B. Apple Aktie"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="investment-person" className="block text-sm font-medium text-gray-700 mb-1">
                    Person
                  </label>
                  <select
                    id="investment-person"
                    value={newInvestment.personId}
                    onChange={(e) => setNewInvestment({ ...newInvestment, personId: e.target.value })}
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
                  <label htmlFor="investment-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Anlagetyp
                  </label>
                  <select
                    id="investment-type"
                    value={newInvestment.assetType}
                    onChange={(e) => setNewInvestment({ ...newInvestment, assetType: e.target.value as Investment['assetType'] })}
                    className="select"
                  >
                    {investmentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="investment-purchase-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Kaufdatum
                  </label>
                  <input
                    type="date"
                    id="investment-purchase-date"
                    value={formatDateForInput(newInvestment.purchaseDate)}
                    onChange={(e) => setNewInvestment({ 
                      ...newInvestment, 
                      purchaseDate: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString()
                    })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="investment-units" className="block text-sm font-medium text-gray-700 mb-1">
                    Anzahl der Einheiten
                  </label>
                  <input
                    type="number"
                    id="investment-units"
                    value={newInvestment.units}
                    onChange={(e) => setNewInvestment({ ...newInvestment, units: parseFloat(e.target.value) })}
                    min="0.0001"
                    step="0.0001"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="investment-purchase-price" className="block text-sm font-medium text-gray-700 mb-1">
                    Kaufpreis pro Einheit (€)
                  </label>
                  <input
                    type="number"
                    id="investment-purchase-price"
                    value={newInvestment.purchasePricePerUnit}
                    onChange={(e) => setNewInvestment({ ...newInvestment, purchasePricePerUnit: parseFloat(e.target.value) })}
                    min="0.01"
                    step="0.01"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="investment-current-price" className="block text-sm font-medium text-gray-700 mb-1">
                    Aktueller Preis pro Einheit (€)
                  </label>
                  <input
                    type="number"
                    id="investment-current-price"
                    value={newInvestment.currentPricePerUnit}
                    onChange={(e) => setNewInvestment({ ...newInvestment, currentPricePerUnit: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="input"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="investment-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notizen (optional)
                  </label>
                  <input
                    type="text"
                    id="investment-notes"
                    value={newInvestment.notes}
                    onChange={(e) => setNewInvestment({ ...newInvestment, notes: e.target.value })}
                    className="input"
                    placeholder="Zusätzliche Informationen"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAddInvestment}
                  className="btn btn-success mr-2 flex items-center"
                  disabled={!newInvestment.personId || !newInvestment.assetName || newInvestment.units <= 0 || newInvestment.purchasePricePerUnit <= 0}
                >
                  <Save size={18} className="mr-1" /> Speichern
                </button>
                <button 
                  onClick={() => {
                    setIsAdding(false);
                    setNewInvestment({
                      personId: '',
                      assetName: '',
                      assetType: 'stock',
                      purchaseDate: new Date().toISOString(),
                      units: 1,
                      purchasePricePerUnit: 0,
                      currentPricePerUnit: 0,
                      currency: '€',
                      notes: ''
                    });
                  }}
                  className="btn btn-outline flex items-center"
                >
                  <X size={18} className="mr-1" /> Abbrechen
                </button>
              </div>
            </div>
          )}

          {investments.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              <TrendingUp size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="mb-4">Keine Investitionen vorhanden</p>
              <button 
                onClick={() => setIsAdding(true)} 
                className="btn btn-primary"
              >
                Investition hinzufügen
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Show investments grouped by type */}
              {investmentsByType.map(group => (
                <div key={group.type} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-medium text-lg">{group.label}</h2>
                    <span className="text-sm text-gray-500">
                      {group.investments.length} {group.investments.length === 1 ? 'Anlage' : 'Anlagen'}
                    </span>
                  </div>
                  
                  <ul className="divide-y divide-gray-100">
                    {group.investments.map(investment => {
                      const details = getInvestmentDetails(investment);
                      
                      return (
                        <li key={investment.id} className="p-4 hover:bg-gray-50">
                          {editId === investment.id && editInvestment ? (
                            <div className="animate-fade-in">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label htmlFor="edit-investment-asset-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Anlagename
                                  </label>
                                  <input
                                    type="text"
                                    id="edit-investment-asset-name"
                                    value={editInvestment.assetName}
                                    onChange={(e) => setEditInvestment({ ...editInvestment, assetName: e.target.value })}
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-investment-person" className="block text-sm font-medium text-gray-700 mb-1">
                                    Person
                                  </label>
                                  <select
                                    id="edit-investment-person"
                                    value={editInvestment.personId}
                                    onChange={(e) => setEditInvestment({ ...editInvestment, personId: e.target.value })}
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
                                  <label htmlFor="edit-investment-type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Anlagetyp
                                  </label>
                                  <select
                                    id="edit-investment-type"
                                    value={editInvestment.assetType}
                                    onChange={(e) => setEditInvestment({ ...editInvestment, assetType: e.target.value as Investment['assetType'] })}
                                    className="select"
                                  >
                                    {investmentTypes.map(type => (
                                      <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-investment-purchase-date" className="block text-sm font-medium text-gray-700 mb-1">
                                    Kaufdatum
                                  </label>
                                  <input
                                    type="date"
                                    id="edit-investment-purchase-date"
                                    value={formatDateForInput(editInvestment.purchaseDate)}
                                    onChange={(e) => setEditInvestment({ 
                                      ...editInvestment, 
                                      purchaseDate: e.target.value ? new Date(e.target.value).toISOString() : editInvestment.purchaseDate
                                    })}
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-investment-units" className="block text-sm font-medium text-gray-700 mb-1">
                                    Anzahl der Einheiten
                                  </label>
                                  <input
                                    type="number"
                                    id="edit-investment-units"
                                    value={editInvestment.units}
                                    onChange={(e) => setEditInvestment({ ...editInvestment, units: parseFloat(e.target.value) })}
                                    min="0.0001"
                                    step="0.0001"
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-investment-purchase-price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Kaufpreis pro Einheit (€)
                                  </label>
                                  <input
                                    type="number"
                                    id="edit-investment-purchase-price"
                                    value={editInvestment.purchasePricePerUnit}
                                    onChange={(e) => setEditInvestment({ ...editInvestment, purchasePricePerUnit: parseFloat(e.target.value) })}
                                    min="0.01"
                                    step="0.01"
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-investment-current-price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Aktueller Preis pro Einheit (€)
                                  </label>
                                  <input
                                    type="number"
                                    id="edit-investment-current-price"
                                    value={editInvestment.currentPricePerUnit}
                                    onChange={(e) => setEditInvestment({ ...editInvestment, currentPricePerUnit: parseFloat(e.target.value) })}
                                    min="0"
                                    step="0.01"
                                    className="input"
                                    required
                                  />
                                </div>
                                
                                <div className="md:col-span-2">
                                  <label htmlFor="edit-investment-notes" className="block text-sm font-medium text-gray-700 mb-1">
                                    Notizen (optional)
                                  </label>
                                  <input
                                    type="text"
                                    id="edit-investment-notes"
                                    value={editInvestment.notes}
                                    onChange={(e) => setEditInvestment({ ...editInvestment, notes: e.target.value })}
                                    className="input"
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <button 
                                  onClick={handleUpdateInvestment}
                                  className="btn btn-success mr-2 flex items-center"
                                  disabled={!editInvestment.personId || !editInvestment.assetName || editInvestment.units <= 0 || editInvestment.purchasePricePerUnit <= 0}
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
                                <h3 className="font-medium text-lg">{investment.assetName}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  {details.personName} • {formatDate(investment.purchaseDate)}
                                </p>
                                <div className="mt-2 text-sm">
                                  <span className="mr-2">
                                    {investment.units.toLocaleString('de-DE', { maximumFractionDigits: 4 })} Einheiten
                                  </span>
                                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                    {investment.purchasePricePerUnit.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / Einheit
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center mt-4 md:mt-0">
                                <div className="text-right mr-4">
                                  <div className="font-medium">
                                    <AmountDisplay amount={details.totalCurrentValue} /> 
                                    <span className={`ml-2 text-sm ${details.profitPercentage >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                                      {details.profitPercentage >= 0 ? (
                                        <ArrowUp size={14} className="inline-block mr-0.5" />
                                      ) : (
                                        <ArrowDown size={14} className="inline-block mr-0.5" />
                                      )}
                                      {Math.abs(details.profitPercentage).toFixed(2)}%
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Aktuell: {investment.currentPricePerUnit.toLocaleString('de-DE', { minimumFractionDigits: 2 })} € / Einheit
                                  </div>
                                </div>
                                <div>
                                  <button
                                    onClick={() => startEdit(investment)}
                                    className="text-gray-500 hover:text-primary-400 p-1"
                                    title="Bearbeiten"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <button
                                    onClick={() => confirmDelete(investment.id, investment.assetName)}
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvestmentsPage;