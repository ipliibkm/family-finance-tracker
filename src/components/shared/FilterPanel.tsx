import React, { useState } from 'react';
import { FilterCriteria } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { FilterX } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterCriteria;
  setFilters: React.Dispatch<React.SetStateAction<FilterCriteria>>;
  onApplyFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  filters, 
  setFilters, 
  onApplyFilters 
}) => {
  const { persons, accounts, categories } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePersonChange = (personId: string) => {
    const personIds = filters.personIds.includes(personId)
      ? filters.personIds.filter(id => id !== personId)
      : [...filters.personIds, personId];
    setFilters({ ...filters, personIds });
  };

  const handleAccountChange = (accountId: string) => {
    const accountIds = filters.accountIds.includes(accountId)
      ? filters.accountIds.filter(id => id !== accountId)
      : [...filters.accountIds, accountId];
    setFilters({ ...filters, accountIds });
  };

  const handleCategoryChange = (categoryId: string) => {
    const categoryIds = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter(id => id !== categoryId)
      : [...filters.categoryIds, categoryId];
    setFilters({ ...filters, categoryIds });
  };

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
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-medium">Filter</h2>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Person Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personen
              </label>
              <div className="max-h-32 overflow-y-auto">
                {persons.map(person => (
                  <div key={person.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`person-${person.id}`}
                      checked={filters.personIds.includes(person.id)}
                      onChange={() => handlePersonChange(person.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`person-${person.id}`} className="text-sm">
                      {person.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konten
              </label>
              <div className="max-h-32 overflow-y-auto">
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`account-${account.id}`}
                      checked={filters.accountIds.includes(account.id)}
                      onChange={() => handleAccountChange(account.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`account-${account.id}`} className="text-sm">
                      {account.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorien
              </label>
              <div className="max-h-32 overflow-y-auto">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={filters.categoryIds.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`category-${category.id}`} className="text-sm flex items-center">
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-1" 
                        style={{ backgroundColor: category.color }}
                      ></span>
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Von Datum
              </label>
              <input
                type="date"
                value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  dateFrom: e.target.value ? new Date(e.target.value).toISOString() : null 
                })}
                className="input text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bis Datum
              </label>
              <input
                type="date"
                value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  dateTo: e.target.value ? new Date(e.target.value).toISOString() : null 
                })}
                className="input text-sm"
              />
            </div>

            {/* Amount Range */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min. Betrag (€)
                </label>
                <input
                  type="number"
                  value={filters.amountMin !== null ? filters.amountMin : ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    amountMin: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  step="0.01"
                  className="input text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max. Betrag (€)
                </label>
                <input
                  type="number"
                  value={filters.amountMax !== null ? filters.amountMax : ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    amountMax: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  step="0.01"
                  className="input text-sm"
                />
              </div>
            </div>

            {/* Search Term */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suche
              </label>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                placeholder="Beschreibung suchen..."
                className="input text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={resetFilters}
              className="flex items-center px-3 py-1.5 text-sm bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              <FilterX size={16} className="mr-1" />
              Filter zurücksetzen
            </button>
            <button
              onClick={onApplyFilters}
              className="btn btn-primary text-sm py-1.5"
            >
              Anwenden
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;