import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { BackupData } from '../types';
import { 
  Save, Upload, Download, AlertTriangle, RefreshCw, Check, Plus, Trash2, Edit, X, Tag
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { exportData, importData, resetData, categories, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success'>('idle');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as const,
    color: '#36B37E'
  });
  
  const [editCategory, setEditCategory] = useState<null | {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
  }>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzmanager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportStatus('success');
    setTimeout(() => setExportStatus('idle'), 3000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as BackupData;
        importData(data);
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch (error) {
        console.error('Import failed:', error);
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!window.confirm('Möchten Sie wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }
    resetData();
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addCategory(newCategory);
      setNewCategory({
        name: '',
        type: 'expense',
        color: '#36B37E'
      });
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = () => {
    if (editCategory && editCategory.name.trim()) {
      updateCategory(editCategory);
      setEditCategoryId(null);
      setEditCategory(null);
    }
  };

  const startEditCategory = (category: typeof editCategory) => {
    if (category) {
      setEditCategoryId(category.id);
      setEditCategory(category);
    }
  };

  const cancelEditCategory = () => {
    setEditCategoryId(null);
    setEditCategory(null);
  };

  const confirmDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie die Kategorie "${name}" wirklich löschen?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div>
      <h1 className="mb-6">Einstellungen</h1>
      
      <div className="space-y-6">
        {/* Categories Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Kategorien verwalten</h2>
            <button 
              onClick={() => setIsAddingCategory(true)}
              className="btn btn-primary flex items-center"
              disabled={isAddingCategory}
            >
              <Plus size={18} className="mr-1" /> Kategorie hinzufügen
            </button>
          </div>
          
          {isAddingCategory && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 animate-fade-in">
              <h3 className="font-medium mb-3">Neue Kategorie</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="category-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="category-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Typ
                  </label>
                  <select
                    id="category-type"
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({ 
                      ...newCategory, 
                      type: e.target.value as 'income' | 'expense'
                    })}
                    className="select"
                  >
                    <option value="income">Einkommen</option>
                    <option value="expense">Ausgabe</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="category-color" className="block text-sm font-medium text-gray-700 mb-1">
                    Farbe
                  </label>
                  <input
                    type="color"
                    id="category-color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="h-10 w-full rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={handleAddCategory}
                  className="btn btn-success mr-2 flex items-center"
                  disabled={!newCategory.name.trim()}
                >
                  <Save size={18} className="mr-1" /> Speichern
                </button>
                <button 
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategory({
                      name: '',
                      type: 'expense',
                      color: '#36B37E'
                    });
                  }}
                  className="btn btn-outline flex items-center"
                >
                  <X size={18} className="mr-1" /> Abbrechen
                </button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Categories */}
            <div>
              <h3 className="text-md font-medium mb-3">Einkommenskategorien</h3>
              <div className="space-y-2">
                {categories.filter(c => c.type === 'income').map(category => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    {editCategoryId === category.id && editCategory ? (
                      <div className="w-full animate-fade-in">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={editCategory.name}
                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                            className="input flex-grow"
                            required
                          />
                          <input
                            type="color"
                            value={editCategory.color}
                            onChange={(e) => setEditCategory({ ...editCategory, color: e.target.value })}
                            className="h-10 w-20 rounded cursor-pointer"
                          />
                          <button 
                            onClick={handleUpdateCategory}
                            className="btn btn-success btn-sm"
                            disabled={!editCategory.name.trim()}
                          >
                            <Save size={16} />
                          </button>
                          <button 
                            onClick={cancelEditCategory}
                            className="btn btn-outline btn-sm"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <span 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          ></span>
                          <span>{category.name}</span>
                        </div>
                        <div>
                          <button
                            onClick={() => startEditCategory(category)}
                            className="text-gray-500 hover:text-primary-400 p-1"
                            title="Bearbeiten"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => confirmDeleteCategory(category.id, category.name)}
                            className="text-gray-500 hover:text-error-400 p-1 ml-1"
                            title="Löschen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Expense Categories */}
            <div>
              <h3 className="text-md font-medium mb-3">Ausgabenkategorien</h3>
              <div className="space-y-2">
                {categories.filter(c => c.type === 'expense').map(category => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    {editCategoryId === category.id && editCategory ? (
                      <div className="w-full animate-fade-in">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={editCategory.name}
                            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                            className="input flex-grow"
                            required
                          />
                          <input
                            type="color"
                            value={editCategory.color}
                            onChange={(e) => setEditCategory({ ...editCategory, color: e.target.value })}
                            className="h-10 w-20 rounded cursor-pointer"
                          />
                          <button 
                            onClick={handleUpdateCategory}
                            className="btn btn-success btn-sm"
                            disabled={!editCategory.name.trim()}
                          >
                            <Save size={16} />
                          </button>
                          <button 
                            onClick={cancelEditCategory}
                            className="btn btn-outline btn-sm"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <span 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: category.color }}
                          ></span>
                          <span>{category.name}</span>
                        </div>
                        <div>
                          <button
                            onClick={() => startEditCategory(category)}
                            className="text-gray-500 hover:text-primary-400 p-1"
                            title="Bearbeiten"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => confirmDeleteCategory(category.id, category.name)}
                            className="text-gray-500 hover:text-error-400 p-1 ml-1"
                            title="Löschen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Datenverwaltung</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Daten exportieren</h3>
              <p className="text-gray-600 text-sm mb-3">
                Laden Sie eine Sicherungskopie Ihrer Daten herunter.
              </p>
              <button 
                onClick={handleExport}
                className="btn btn-primary flex items-center"
              >
                {exportStatus === 'success' ? (
                  <>
                    <Check size={18} className="mr-1" /> Exportiert
                  </>
                ) : (
                  <>
                    <Download size={18} className="mr-1" /> Daten exportieren
                  </>
                )}
              </button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Daten importieren</h3>
              <p className="text-gray-600 text-sm mb-3">
                Laden Sie eine zuvor erstellte Sicherungskopie hoch.
              </p>
              <div>
                <label className="btn btn-primary flex items-center">
                  <Upload size={18} className="mr-1" /> Datei auswählen
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                {importStatus === 'success' && (
                  <span className="ml-3 text-success-500 flex items-center">
                    <Check size={18} className="mr-1" /> Import erfolgreich
                  </span>
                )}
                {importStatus === 'error' && (
                  <span className="ml-3 text-error-500 flex items-center">
                    <AlertTriangle size={18} className="mr-1" /> Import fehlgeschlagen
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Daten zurücksetzen</h3>
              <p className="text-gray-600 text-sm mb-3">
                Setzen Sie alle Daten auf den Ausgangszustand zurück. Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <button 
                onClick={handleReset}
                className="btn btn-error flex items-center"
              >
                <RefreshCw size={18} className="mr-1" /> Daten zurücksetzen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;